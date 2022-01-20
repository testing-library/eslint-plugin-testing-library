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

    function getWrongQueryNameInAssertion(
      node: TSESTree.ArrowFunctionExpression
    ) {
      if (
        !isCallExpression(node.body) ||
        !isMemberExpression(node.body.callee)
      ) {
        return null;
      }

      // expect(getByText).toBeInTheDocument() shape
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

      // expect(screen.getByText).toBeInTheDocument() shape
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

      // expect(screen.getByText).not shape
      if (
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

      // expect(getByText).not shape
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

    function getWrongQueryName(node: TSESTree.ArrowFunctionExpression) {
      if (!isCallExpression(node.body)) {
        return null;
      }

      // expect(() => getByText) and expect(() => screen.getByText) shape
      if (
        ASTUtils.isIdentifier(node.body.callee) &&
        helpers.isSyncQuery(node.body.callee)
      ) {
        return node.body.callee.name;
      }

      return getWrongQueryNameInAssertion(node);
    }

    function getCaller(node: TSESTree.ArrowFunctionExpression) {
      if (
        !isCallExpression(node.body) ||
        !isMemberExpression(node.body.callee)
      ) {
        return null;
      }

      if (ASTUtils.isIdentifier(node.body.callee.object)) {
        // () => screen.getByText
        return node.body.callee.object.name;
      }

      if (
        // expect()
        isCallExpression(node.body.callee.object) &&
        ASTUtils.isIdentifier(node.body.callee.object.callee) &&
        isCallExpression(node.body.callee.object.arguments[0]) &&
        isMemberExpression(node.body.callee.object.arguments[0].callee) &&
        ASTUtils.isIdentifier(
          node.body.callee.object.arguments[0].callee.object
        )
      ) {
        return node.body.callee.object.arguments[0].callee.object.name;
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
          node.body.callee.object.object.arguments[0].callee.object
        )
      ) {
        return node.body.callee.object.object.arguments[0].callee.object.name;
      }

      return null;
    }

    function isSyncQuery(node: TSESTree.ArrowFunctionExpression) {
      if (!isCallExpression(node.body)) {
        return false;
      }

      const isQuery =
        ASTUtils.isIdentifier(node.body.callee) &&
        helpers.isSyncQuery(node.body.callee);

      const isWrappedInPresenceAssert =
        isMemberExpression(node.body.callee) &&
        isCallExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.arguments[0]) &&
        ASTUtils.isIdentifier(node.body.callee.object.arguments[0].callee) &&
        helpers.isSyncQuery(node.body.callee.object.arguments[0].callee) &&
        helpers.isPresenceAssert(node.body.callee);

      const isWrappedInNegatedPresenceAssert =
        isMemberExpression(node.body.callee) &&
        isMemberExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.object) &&
        isCallExpression(node.body.callee.object.object.arguments[0]) &&
        ASTUtils.isIdentifier(
          node.body.callee.object.object.arguments[0].callee
        ) &&
        helpers.isSyncQuery(
          node.body.callee.object.object.arguments[0].callee
        ) &&
        helpers.isPresenceAssert(node.body.callee.object);

      return (
        isQuery || isWrappedInPresenceAssert || isWrappedInNegatedPresenceAssert
      );
    }

    function isScreenSyncQuery(node: TSESTree.ArrowFunctionExpression) {
      if (!isArrowFunctionExpression(node) || !isCallExpression(node.body)) {
        return false;
      }

      if (
        !isMemberExpression(node.body.callee) ||
        !ASTUtils.isIdentifier(node.body.callee.property)
      ) {
        return false;
      }

      if (
        !ASTUtils.isIdentifier(node.body.callee.object) &&
        !isCallExpression(node.body.callee.object) &&
        !isMemberExpression(node.body.callee.object)
      ) {
        return false;
      }

      const isWrappedInPresenceAssert =
        helpers.isPresenceAssert(node.body.callee) &&
        isCallExpression(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.arguments[0]) &&
        isMemberExpression(node.body.callee.object.arguments[0].callee) &&
        ASTUtils.isIdentifier(
          node.body.callee.object.arguments[0].callee.object
        );

      const isWrappedInNegatedPresenceAssert =
        isMemberExpression(node.body.callee.object) &&
        helpers.isPresenceAssert(node.body.callee.object) &&
        isCallExpression(node.body.callee.object.object) &&
        isCallExpression(node.body.callee.object.object.arguments[0]) &&
        isMemberExpression(node.body.callee.object.object.arguments[0].callee);

      return (
        helpers.isSyncQuery(node.body.callee.property) ||
        isWrappedInPresenceAssert ||
        isWrappedInNegatedPresenceAssert
      );
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
        if (
          !isArrowFunctionExpression(argument) ||
          !isCallExpression(argument.body)
        ) {
          return;
        }

        const waitForMethodName = node.callee.name;

        // ensure here it's one of the sync methods that we are calling
        if (isScreenSyncQuery(argument)) {
          const caller = getCaller(argument);

          if (!caller) {
            return;
          }

          // shape of () => screen.getByText
          const fullQueryMethod = getWrongQueryName(argument);

          if (!fullQueryMethod) {
            return;
          }

          const queryVariant = getFindByQueryVariant(fullQueryMethod);
          const callArguments = getQueryArguments(argument.body);
          const queryMethod = fullQueryMethod.split('By')[1];

          if (!queryMethod) {
            return;
          }

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

        if (!isSyncQuery(argument)) {
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
              const text = textDestructuring.replace(
                /(\s*})$/,
                `, ${findByMethod}$1`
              );
              allFixes.push(fixer.replaceText(allVariableDeclarations, text));
            }

            return allFixes;
          },
        });
      },
    };
  },
});
