import {
  TSESTree,
  ASTUtils,
  TSESLint,
} from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  isArrowFunctionExpression,
  isCallExpression,
  isMemberExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';

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
  scope: TSESLint.Scope.Scope | null,
  query: string
): TSESTree.Identifier | null {
  if (!scope) {
    return null;
  }

  const variable = scope.variables.find(
    (v: TSESLint.Scope.Variable) => v.name === query
  );

  if (variable) {
    return (
      variable.defs
        .map(({ name }) => name)
        .filter(ASTUtils.isIdentifier)
        .find(({ name }) => name === query) ?? null
    );
  }

  return findRenderDefinitionDeclaration(scope.upper, query);
}

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest using `find(All)By*` query instead of `waitFor` + `get(All)By*` to wait for elements',
      category: 'Best Practices',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
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
        queryVariant: 'findAllBy' | 'findBy';
        queryMethod: string;
        prevQuery: string;
        waitForMethodName: string;
        fix: TSESLint.ReportFixFunction;
      }
    ) {
      const { queryMethod, queryVariant, prevQuery, waitForMethodName, fix } =
        replacementParams;
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

    // eslint-disable-next-line complexity
    function getWrongQueryName(node: TSESTree.ArrowFunctionExpression) {
      // refactor to take node.body.callee
      if (!isCallExpression(node.body)) {
        return null;
      }

      if (
        ASTUtils.isIdentifier(node.body.callee) &&
        helpers.isSyncQuery(node.body.callee)
      ) {
        return node.body.callee.name;
      }

      if (!isMemberExpression(node.body.callee)) {
        return null;
      }

      if (
        isCallExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.arguments[0]) &&
        ASTUtils.isIdentifier(node.body.callee.object.arguments[0].callee)
      ) {
        return node.body.callee.object.arguments[0].callee.name;
      }

      if (!ASTUtils.isIdentifier(node.body.callee.property)) {
        return null;
      }

      if (
        isCallExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.arguments[0]) &&
        isMemberExpression(node.body.callee.object.arguments[0].callee) &&
        ASTUtils.isIdentifier(
          node.body.callee.object.arguments[0].callee.property
        )
      ) {
        return node.body.callee.object.arguments[0].callee.property.name;
      }

      if (
        // expect().not
        isMemberExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.object) &&
        isCallExpression(node.body.callee.object.object.arguments[0]) &&
        isMemberExpression(
          node.body.callee.object.object.arguments[0].callee
        ) &&
        ASTUtils.isIdentifier(
          node.body.callee.object.object.arguments[0].callee.property
        )
      ) {
        return node.body.callee.object.object.arguments[0].callee.property.name;
      }

      if (
        isMemberExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.object) &&
        isCallExpression(node.body.callee.object.object.arguments[0]) &&
        ASTUtils.isIdentifier(
          node.body.callee.object.object.arguments[0].callee
        )
      ) {
        return node.body.callee.object.object.arguments[0].callee.name;
      }

      return node.body.callee.property.name;
    }

    function getQueryArguments(node: TSESTree.CallExpression) {
      if (
        isMemberExpression(node.callee) &&
        isCallExpression(node.callee.object) &&
        isCallExpression(node.callee.object.arguments[0])
      ) {
        return node.callee.object.arguments[0].arguments;
      }

      if (
        isMemberExpression(node.callee) &&
        isMemberExpression(node.callee.object) &&
        isCallExpression(node.callee.object.object) &&
        isCallExpression(node.callee.object.object.arguments[0])
      ) {
        return node.callee.object.object.arguments[0].arguments;
      }

      return node.arguments;
    }

    return {
      // eslint-disable-next-line complexity
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
          (ASTUtils.isIdentifier(argument.body.callee.object) ||
            isCallExpression(argument.body.callee.object) ||
            isMemberExpression(argument.body.callee.object)) &&
          (helpers.isSyncQuery(argument.body.callee.property) ||
            (helpers.isPresenceAssert(argument.body.callee) &&
              isCallExpression(argument.body.callee.object) &&
              isCallExpression(argument.body.callee.object.arguments[0]) &&
              isMemberExpression(
                argument.body.callee.object.arguments[0].callee
              ) &&
              ASTUtils.isIdentifier(
                argument.body.callee.object.arguments[0].callee.object
              )) ||
            (isMemberExpression(argument.body.callee.object) &&
              helpers.isPresenceAssert(argument.body.callee.object) &&
              isCallExpression(argument.body.callee.object.object) &&
              isCallExpression(
                argument.body.callee.object.object.arguments[0]
              ) &&
              isMemberExpression(
                argument.body.callee.object.object.arguments[0].callee
              )))
        ) {
          let caller = '';

          if (ASTUtils.isIdentifier(argument.body.callee.object)) {
            // () => screen.getByText
            caller = argument.body.callee.object.name;
          } else if (
            // expect()
            isCallExpression(argument.body.callee.object) &&
            ASTUtils.isIdentifier(argument.body.callee.object.callee) &&
            isCallExpression(argument.body.callee.object.arguments[0]) &&
            isMemberExpression(
              argument.body.callee.object.arguments[0].callee
            ) &&
            ASTUtils.isIdentifier(
              argument.body.callee.object.arguments[0].callee.object
            )
          ) {
            caller =
              argument.body.callee.object.arguments[0].callee.object.name;
          } else if (
            // expect().not
            isMemberExpression(argument.body.callee.object) &&
            isCallExpression(argument.body.callee.object.object) &&
            isCallExpression(argument.body.callee.object.object.arguments[0]) &&
            isMemberExpression(
              argument.body.callee.object.object.arguments[0].callee
            ) &&
            ASTUtils.isIdentifier(
              argument.body.callee.object.object.arguments[0].callee.object
            )
          ) {
            caller =
              argument.body.callee.object.object.arguments[0].callee.object
                .name;
          }

          // shape of () => screen.getByText
          const fullQueryMethod = getWrongQueryName(argument);

          if (!fullQueryMethod) {
            return;
          }

          const queryVariant = getFindByQueryVariant(fullQueryMethod);
          const callArguments = getQueryArguments(argument.body);
          const queryMethod = fullQueryMethod.split('By')[1];

          reportInvalidUsage(node, {
            queryMethod,
            queryVariant,
            prevQuery: fullQueryMethod,
            waitForMethodName,
            fix(fixer) {
              const property = (
                (argument.body as TSESTree.CallExpression)
                  .callee as TSESTree.MemberExpression
              ).property;
              if (helpers.isCustomQuery(property as TSESTree.Identifier)) {
                return null;
              }
              const newCode = `${caller}.${queryVariant}${queryMethod}(${callArguments
                .map((callArgNode) => sourceCode.getText(callArgNode))
                .join(', ')})`;
              return fixer.replaceText(node, newCode);
            },
          });
          return;
        }

        if (
          (!ASTUtils.isIdentifier(argument.body.callee) || // () => getByText
            !helpers.isSyncQuery(argument.body.callee)) &&
          (!isMemberExpression(argument.body.callee) || // wrapped in presence expect()
            !isCallExpression(argument.body.callee.object) ||
            !isCallExpression(argument.body.callee.object.arguments[0]) ||
            !ASTUtils.isIdentifier(
              argument.body.callee.object.arguments[0].callee
            ) ||
            !helpers.isSyncQuery(
              argument.body.callee.object.arguments[0].callee
            ) ||
            !helpers.isPresenceAssert(argument.body.callee)) &&
          (!isMemberExpression(argument.body.callee) || // wrpaped in presence expect().not
            !isMemberExpression(argument.body.callee.object) ||
            !isCallExpression(argument.body.callee.object.object) ||
            !isCallExpression(
              argument.body.callee.object.object.arguments[0]
            ) ||
            !ASTUtils.isIdentifier(
              argument.body.callee.object.object.arguments[0].callee
            ) ||
            !helpers.isSyncQuery(
              argument.body.callee.object.object.arguments[0].callee
            ) ||
            !helpers.isPresenceAssert(argument.body.callee.object))
        ) {
          return;
        }

        // shape of () => getByText
        const fullQueryMethod = getWrongQueryName(argument);

        if (!fullQueryMethod) {
          return;
        }

        const queryMethod = fullQueryMethod.split('By')[1];
        const queryVariant = getFindByQueryVariant(fullQueryMethod);
        const callArguments = getQueryArguments(argument.body);

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
              return null;
            }
            const findByMethod = `${queryVariant}${queryMethod}`;
            const allFixes: TSESLint.RuleFix[] = [];
            // this updates waitFor with findBy*
            const newCode = `${findByMethod}(${callArguments
              .map((callArgNode) => sourceCode.getText(callArgNode))
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
            if (
              definition.parent &&
              isObjectPattern(definition.parent.parent)
            ) {
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
              const text = `${textDestructuring.substring(
                0,
                textDestructuring.length - 2
              )}, ${findByMethod} }`;
              allFixes.push(fixer.replaceText(allVariableDeclarations, text));
            }

            return allFixes;
          },
        });
      },
    };
  },
});
