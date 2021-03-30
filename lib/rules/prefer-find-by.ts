import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';
import {
  ReportFixFunction,
  RuleFix,
  Scope,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import {
  isArrowFunctionExpression,
  isCallExpression,
  isMemberExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'prefer-find-by';
export type MessageIds = 'preferFindBy';
type Options = [];

export const WAIT_METHODS = ['waitFor', 'waitForElement', 'wait'] as const;

export function getFindByQueryVariant(
  queryMethod: string
): 'findAllBy' | 'findBy' {
  return queryMethod.includes('All') ? 'findAllBy' : 'findBy';
}

function findRenderDefinitionDeclaration(
  scope: Scope.Scope | null,
  query: string
): TSESTree.Identifier | null {
  if (!scope) {
    return null;
  }

  const variable = scope.variables.find(
    (v: Scope.Variable) => v.name === query
  );

  if (variable) {
    return variable.defs
      .map(({ name }) => name)
      .filter(ASTUtils.isIdentifier)
      .find(({ name }) => name === query);
  }

  return findRenderDefinitionDeclaration(scope.upper, query);
}

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest using `find*` query instead of `waitFor` + `get*` to wait for elements',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      preferFindBy:
        'Prefer `{{queryVariant}}{{queryMethod}}` query over using `{{waitForMethodName}}` + `{{prevQuery}}`',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const sourceCode = context.getSourceCode();

    /**
     * Reports the invalid usage of wait* plus getBy/QueryBy methods and automatically fixes the scenario
     * @param node - The CallExpresion node that contains the wait* method
     * @param replacementParams - Object with info for error message and autofix:
     * @param replacementParams.queryVariant - The variant method used to query: findBy/findAllBy.
     * @param replacementParams.prevQuery - The query originally used inside `waitFor`
     * @param replacementParams.queryMethod - Suffix string to build the query method (the query-part that comes after the "By"): LabelText, Placeholder, Text, Role, Title, etc.
     * @param replacementParams.waitForMethodName - wait for method used: waitFor/wait/waitForElement
     * @param replacementParams.fix - Function that applies the fix to correct the code
     */
    function reportInvalidUsage(
      node: TSESTree.CallExpression,
      replacementParams: {
        queryVariant: 'findBy' | 'findAllBy';
        queryMethod: string;
        prevQuery: string;
        waitForMethodName: string;
        fix: ReportFixFunction;
      }
    ) {
      const {
        queryMethod,
        queryVariant,
        prevQuery,
        waitForMethodName,
        fix,
      } = replacementParams;
      context.report({
        node,
        messageId: 'preferFindBy',
        data: {
          queryVariant,
          queryMethod,
          prevQuery,
          waitForMethodName,
        },
        fix,
      });
    }

    return {
      'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
        if (
          !ASTUtils.isIdentifier(node.callee) ||
          !helpers.isAsyncUtil(node.callee, WAIT_METHODS)
        ) {
          return;
        }
        // ensure the only argument is an arrow function expression - if the arrow function is a block
        // we skip it
        const argument = node.arguments[0];
        if (!isArrowFunctionExpression(argument)) {
          return;
        }
        if (!isCallExpression(argument.body)) {
          return;
        }

        const waitForMethodName = node.callee.name;

        // ensure here it's one of the sync methods that we are calling
        if (
          isMemberExpression(argument.body.callee) &&
          ASTUtils.isIdentifier(argument.body.callee.property) &&
          ASTUtils.isIdentifier(argument.body.callee.object) &&
          helpers.isSyncQuery(argument.body.callee.property)
        ) {
          // shape of () => screen.getByText
          const fullQueryMethod = argument.body.callee.property.name;
          const caller = argument.body.callee.object.name;
          const queryVariant = getFindByQueryVariant(fullQueryMethod);
          const callArguments = argument.body.arguments;
          const queryMethod = fullQueryMethod.split('By')[1];

          reportInvalidUsage(node, {
            queryMethod,
            queryVariant,
            prevQuery: fullQueryMethod,
            waitForMethodName,
            fix(fixer) {
              const property = ((argument.body as TSESTree.CallExpression)
                .callee as TSESTree.MemberExpression).property;
              if (helpers.isCustomQuery(property as TSESTree.Identifier)) {
                return;
              }
              const newCode = `${caller}.${queryVariant}${queryMethod}(${callArguments
                .map((node) => sourceCode.getText(node))
                .join(', ')})`;
              return fixer.replaceText(node, newCode);
            },
          });
          return;
        }
        if (
          !ASTUtils.isIdentifier(argument.body.callee) ||
          !helpers.isSyncQuery(argument.body.callee)
        ) {
          return;
        }
        // shape of () => getByText
        const fullQueryMethod = argument.body.callee.name;
        const queryMethod = fullQueryMethod.split('By')[1];
        const queryVariant = getFindByQueryVariant(fullQueryMethod);
        const callArguments = argument.body.arguments;

        reportInvalidUsage(node, {
          queryMethod,
          queryVariant,
          prevQuery: fullQueryMethod,
          waitForMethodName,
          fix(fixer) {
            // we know from above callee is an Identifier
            if (
              helpers.isCustomQuery(
                (argument.body as TSESTree.CallExpression)
                  .callee as TSESTree.Identifier
              )
            ) {
              return;
            }
            const findByMethod = `${queryVariant}${queryMethod}`;
            const allFixes: RuleFix[] = [];
            // this updates waitFor with findBy*
            const newCode = `${findByMethod}(${callArguments
              .map((node) => sourceCode.getText(node))
              .join(', ')})`;
            allFixes.push(fixer.replaceText(node, newCode));

            // this adds the findBy* declaration - adding it to the list of destructured variables { findBy* } = render()
            const definition = findRenderDefinitionDeclaration(
              context.getScope(),
              fullQueryMethod
            );
            // I think it should always find it, otherwise code should not be valid (it'd be using undeclared variables)
            if (!definition) {
              return allFixes;
            }
            // check the declaration is part of a destructuring
            if (isObjectPattern(definition.parent.parent)) {
              const allVariableDeclarations = definition.parent.parent;
              // verify if the findBy* method was already declared
              if (
                allVariableDeclarations.properties.some(
                  (p) =>
                    isProperty(p) &&
                    ASTUtils.isIdentifier(p.key) &&
                    p.key.name === findByMethod
                )
              ) {
                return allFixes;
              }
              // the last character of a destructuring is always a  "}", so we should replace it with the findBy* declaration
              const textDestructuring = sourceCode.getText(
                allVariableDeclarations
              );
              const text =
                textDestructuring.substring(0, textDestructuring.length - 2) +
                `, ${findByMethod} }`;
              allFixes.push(fixer.replaceText(allVariableDeclarations, text));
            }

            return allFixes;
          },
        });
      },
    };
  },
});
