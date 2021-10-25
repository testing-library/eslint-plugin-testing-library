import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  isCallExpression,
  isMemberExpression,
  isObjectExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';

export const RULE_NAME = 'prefer-screen-queries';
export type MessageIds = 'preferScreenQueries';
type Options = [];

const ALLOWED_RENDER_PROPERTIES_FOR_DESTRUCTURING = [
  'container',
  'baseElement',
];

function usesContainerOrBaseElement(node: TSESTree.CallExpression) {
  const secondArgument = node.arguments[1];
  return (
    isObjectExpression(secondArgument) &&
    secondArgument.properties.some(
      (property) =>
        isProperty(property) &&
        ASTUtils.isIdentifier(property.key) &&
        ALLOWED_RENDER_PROPERTIES_FOR_DESTRUCTURING.includes(property.key.name)
    )
  );
}

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using `screen` while querying',
      recommendedConfig: {
        dom: 'error',
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      preferScreenQueries:
        'Avoid destructuring queries from `render` result, use `screen.{{ name }}` instead',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const renderWrapperNames: string[] = [];

    function detectRenderWrapper(node: TSESTree.Identifier): void {
      const innerFunction = getInnermostReturningFunction(context, node);

      if (innerFunction) {
        renderWrapperNames.push(getFunctionName(innerFunction));
      }
    }

    function isReportableRender(node: TSESTree.Identifier): boolean {
      return (
        helpers.isRenderUtil(node) || renderWrapperNames.includes(node.name)
      );
    }

    function reportInvalidUsage(node: TSESTree.Identifier) {
      context.report({
        node,
        messageId: 'preferScreenQueries',
        data: {
          name: node.name,
        },
      });
    }

    function saveSafeDestructuredQueries(node: TSESTree.VariableDeclarator) {
      if (isObjectPattern(node.id)) {
        for (const property of node.id.properties) {
          if (
            isProperty(property) &&
            ASTUtils.isIdentifier(property.key) &&
            helpers.isBuiltInQuery(property.key)
          ) {
            safeDestructuredQueries.push(property.key.name);
          }
        }
      }
    }

    function isIdentifierAllowed(name: string) {
      return ['screen', ...withinDeclaredVariables].includes(name);
    }

    // keep here those queries which are safe and shouldn't be reported
    // (from within, from render + container/base element, not related to TL, etc)
    const safeDestructuredQueries: string[] = [];
    // use an array as within might be used more than once in a test
    const withinDeclaredVariables: string[] = [];

    return {
      VariableDeclarator(node) {
        if (
          !isCallExpression(node.init) ||
          !ASTUtils.isIdentifier(node.init.callee)
        ) {
          return;
        }

        const isComingFromValidRender = isReportableRender(node.init.callee);

        if (!isComingFromValidRender) {
          // save the destructured query methods as safe since they are coming
          // from render not related to TL
          saveSafeDestructuredQueries(node);
        }

        const isWithinFunction = node.init.callee.name === 'within';
        const usesRenderOptions =
          isComingFromValidRender && usesContainerOrBaseElement(node.init);

        if (!isWithinFunction && !usesRenderOptions) {
          return;
        }

        if (isObjectPattern(node.id)) {
          // save the destructured query methods as safe since they are coming
          // from within or render + base/container options
          saveSafeDestructuredQueries(node);
        } else if (ASTUtils.isIdentifier(node.id)) {
          withinDeclaredVariables.push(node.id.name);
        }
      },
      CallExpression(node) {
        const identifierNode = getDeepestIdentifierNode(node);

        if (!identifierNode) {
          return;
        }

        if (helpers.isRenderUtil(identifierNode)) {
          detectRenderWrapper(identifierNode);
        }

        if (!helpers.isBuiltInQuery(identifierNode)) {
          return;
        }

        if (!isMemberExpression(identifierNode.parent)) {
          const isSafeDestructuredQuery = safeDestructuredQueries.some(
            (queryName) => queryName === identifierNode.name
          );
          if (isSafeDestructuredQuery) {
            return;
          }

          reportInvalidUsage(identifierNode);
          return;
        }

        const memberExpressionNode = identifierNode.parent;
        if (
          isCallExpression(memberExpressionNode.object) &&
          ASTUtils.isIdentifier(memberExpressionNode.object.callee) &&
          memberExpressionNode.object.callee.name !== 'within' &&
          isReportableRender(memberExpressionNode.object.callee) &&
          !usesContainerOrBaseElement(memberExpressionNode.object)
        ) {
          reportInvalidUsage(identifierNode);
          return;
        }

        if (
          ASTUtils.isIdentifier(memberExpressionNode.object) &&
          !isIdentifierAllowed(memberExpressionNode.object.name)
        ) {
          reportInvalidUsage(identifierNode);
        }
      },
    };
  },
});
