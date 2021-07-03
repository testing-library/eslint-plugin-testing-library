import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getPropertyIdentifierNode,
  isArrowFunctionExpression,
  isCallExpression,
  isMemberExpression,
  isFunctionExpression,
  isExpressionStatement,
} from '../node-utils';

export const RULE_NAME = 'prefer-query-wait-disappearance';
export type MessageIds = 'preferQueryByDisappearance';

export default createTestingLibraryRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow using getBy* query inside waitForElementToBeRemoved',
      category: 'Possible Errors',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      preferQueryByDisappearance:
        'Prefer using queryBy* when waiting for disappearance',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    function isValidWaitFor(node: TSESTree.CallExpression): boolean {
      const identifierNode = getPropertyIdentifierNode(node);

      if (!identifierNode) {
        return false;
      }

      return helpers.isAsyncUtil(identifierNode, ['waitForElementToBeRemoved']);
    }

    function isNonCallbackViolation(
      argumentNode: TSESTree.CallExpressionArgument // TODO: rename to node
    ) {
      if (!isCallExpression(argumentNode)) {
        return false;
      }

      if (!isMemberExpression(argumentNode.callee)) {
        return false;
      }

      const argumentObjectIdentifier = getPropertyIdentifierNode(
        argumentNode.callee.object
      );

      if (
        argumentObjectIdentifier?.name &&
        argumentObjectIdentifier.name !== 'screen'
      ) {
        return false;
      }

      const argumentProperty = getPropertyIdentifierNode(
        argumentNode.callee.property
      );

      if (!argumentProperty) {
        return false;
      }

      return (
        helpers.isGetQueryVariant(argumentProperty) ||
        helpers.isFindQueryVariant(argumentProperty)
      );
    }

    function isFunctionExpressionViolation(
      node: TSESTree.CallExpressionArgument
    ) {
      if (!isFunctionExpression(node)) {
        return false;
      }

      return node.body.body.reduce((acc, value) => {
        if (!isExpressionStatement(value)) {
          return acc || false;
        }

        if (!isCallExpression(value.expression)) {
          return acc || false;
        }

        if (!isMemberExpression(value.expression.callee)) {
          return acc || false;
        }

        const argumentObjectIdentifier = getPropertyIdentifierNode(
          value.expression.callee.object
        );

        if (
          argumentObjectIdentifier?.name &&
          argumentObjectIdentifier.name !== 'screen'
        ) {
          return acc || false;
        }

        const argumentProperty = getPropertyIdentifierNode(
          value.expression.callee.property
        );

        if (!argumentProperty) {
          return acc || false;
        }

        return (
          acc ||
          helpers.isGetQueryVariant(argumentProperty) ||
          helpers.isFindQueryVariant(argumentProperty)
        );
      }, false);
    }

    function isArrowFunctionViolation(
      argumentNode: TSESTree.CallExpressionArgument
    ) {
      if (!isArrowFunctionExpression(argumentNode)) {
        return false;
      }

      if (!isCallExpression(argumentNode.body)) {
        return false;
      }

      if (!isMemberExpression(argumentNode.body.callee)) {
        return false;
      }

      const argumentObjectIdentifier = getPropertyIdentifierNode(
        argumentNode.body.callee.object
      );

      if (
        argumentObjectIdentifier?.name &&
        argumentObjectIdentifier.name !== 'screen'
      ) {
        return false;
      }

      const argumentProperty = getPropertyIdentifierNode(
        argumentNode.body.callee.property
      );

      if (!argumentProperty) {
        return false;
      }

      return (
        helpers.isGetQueryVariant(argumentProperty) ||
        helpers.isFindQueryVariant(argumentProperty)
      );
    }

    function check(node: TSESTree.CallExpression) {
      if (!isValidWaitFor(node)) {
        return;
      }

      const argumentNode = node.arguments[0];

      if (
        !isNonCallbackViolation(argumentNode) &&
        !isArrowFunctionViolation(argumentNode) &&
        !isFunctionExpressionViolation(argumentNode)
      ) {
        return;
      }

      context.report({
        node: argumentNode, // should we report only .getBy* and not the whole argument?
        messageId: 'preferQueryByDisappearance',
      });
    }

    return {
      CallExpression: check,
    };
  },
});
