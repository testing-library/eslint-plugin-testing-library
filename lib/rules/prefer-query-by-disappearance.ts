import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getPropertyIdentifierNode,
  isArrowFunctionExpression,
  isCallExpression,
  isMemberExpression,
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
      argumentNode: TSESTree.CallExpressionArgument
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
        !isArrowFunctionViolation(argumentNode)
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
