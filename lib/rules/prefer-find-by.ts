import {
  ESLintUtils,
  TSESTree,
  ASTUtils,
} from '@typescript-eslint/experimental-utils';
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
import { getDocsUrl, SYNC_QUERIES_COMBINATIONS } from '../utils';

export const RULE_NAME = 'prefer-find-by';
export type MessageIds = 'preferFindBy';
type Options = [];

export const WAIT_METHODS = ['waitFor', 'waitForElement', 'wait'];

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

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest using find* instead of waitFor to wait for elements',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      preferFindBy:
        'Prefer {{queryVariant}}{{queryMethod}} method over using await {{fullQuery}}',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const sourceCode = context.getSourceCode();

    /**
     * Reports the invalid usage of wait* plus getBy/QueryBy methods and automatically fixes the scenario
     * @param {TSESTree.CallExpression} node - The CallExpresion node that contains the wait* method
     * @param {'findBy' | 'findAllBy'} replacementParams.queryVariant - The variant method used to query: findBy/findByAll.
     * @param {string} replacementParams.queryMethod - Suffix string to build the query method (the query-part that comes after the "By"): LabelText, Placeholder, Text, Role, Title, etc.
     * @param {ReportFixFunction} replacementParams.fix - Function that applies the fix to correct the code
     */
    function reportInvalidUsage(
      node: TSESTree.CallExpression,
      {
        queryVariant,
        queryMethod,
        fix,
      }: {
        queryVariant: 'findBy' | 'findAllBy';
        queryMethod: string;
        fix: ReportFixFunction;
      }
    ) {
      context.report({
        node,
        messageId: 'preferFindBy',
        data: {
          queryVariant,
          queryMethod,
          fullQuery: sourceCode.getText(node),
        },
        fix,
      });
    }

    return {
      'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
        if (
          !ASTUtils.isIdentifier(node.callee) ||
          !WAIT_METHODS.includes(node.callee.name)
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
        // ensure here it's one of the sync methods that we are calling
        if (
          isMemberExpression(argument.body.callee) &&
          ASTUtils.isIdentifier(argument.body.callee.property) &&
          ASTUtils.isIdentifier(argument.body.callee.object) &&
          SYNC_QUERIES_COMBINATIONS.includes(argument.body.callee.property.name)
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
            fix(fixer) {
              const newCode = `${caller}.${queryVariant}${queryMethod}(${callArguments
                .map((node) => sourceCode.getText(node))
                .join(', ')})`;
              return fixer.replaceText(node, newCode);
            },
          });
          return;
        }
        if (
          ASTUtils.isIdentifier(argument.body.callee) &&
          SYNC_QUERIES_COMBINATIONS.includes(argument.body.callee.name)
        ) {
          // shape of () => getByText
          const fullQueryMethod = argument.body.callee.name;
          const queryMethod = fullQueryMethod.split('By')[1];
          const queryVariant = getFindByQueryVariant(fullQueryMethod);
          const callArguments = argument.body.arguments;

          reportInvalidUsage(node, {
            queryMethod,
            queryVariant,
            fix(fixer) {
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
          return;
        }
      },
    };
  },
});
