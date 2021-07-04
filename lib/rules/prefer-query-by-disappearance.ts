import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getPropertyIdentifierNode,
  isArrowFunctionExpression,
  isCallExpression,
  isMemberExpression,
  isFunctionExpression,
  isExpressionStatement,
  isReturnStatement,
  isBlockStatement,
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

      if (
        !isMemberExpression(argumentNode.callee) &&
        !getPropertyIdentifierNode(argumentNode.callee)
      ) {
        return false;
      }

      let argumentProperty;

      if (isMemberExpression(argumentNode.callee)) {
        argumentProperty = getPropertyIdentifierNode(
          argumentNode.callee.property
        );
      } else {
        argumentProperty = getPropertyIdentifierNode(argumentNode.callee);
      }

      if (!argumentProperty) {
        return false;
      }

      return (
        helpers.isGetQueryVariant(argumentProperty) ||
        helpers.isFindQueryVariant(argumentProperty)
      );
    }

    function isReturnViolation(node: TSESTree.Statement) {
      if (!isReturnStatement(node)) {
        return false;
      }

      if (!node.argument) {
        return false;
      }

      if (!isCallExpression(node.argument)) {
        return false;
      }

      const argumentNode = node.argument;

      let argumentProperty;

      if (isMemberExpression(argumentNode.callee)) {
        argumentProperty = getPropertyIdentifierNode(
          argumentNode.callee.property
        );
      } else {
        argumentProperty = getPropertyIdentifierNode(argumentNode.callee);
      }

      if (!argumentProperty) {
        return false;
      }

      return (
        helpers.isGetQueryVariant(argumentProperty) ||
        helpers.isFindQueryVariant(argumentProperty)
      );
    }

    function isNonReturnViolation(node: TSESTree.Statement) {
      if (!isExpressionStatement(node)) {
        return false;
      }

      if (!isCallExpression(node.expression)) {
        return false;
      }

      if (
        !isMemberExpression(node.expression.callee) &&
        !getPropertyIdentifierNode(node.expression.callee)
      ) {
        return false;
      }

      let argumentProperty;

      if (isMemberExpression(node.expression.callee)) {
        argumentProperty = getPropertyIdentifierNode(
          node.expression.callee.property
        );
      } else {
        argumentProperty = getPropertyIdentifierNode(node.expression.callee);
      }

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
        if (!isReturnViolation(value) && !isNonReturnViolation(value)) {
          return acc || false;
        }

        return true;
      }, false);
    }

    function isArrowFunctionBodyViolation(
      node: TSESTree.CallExpressionArgument
    ) {
      if (!isArrowFunctionExpression(node)) {
        return false;
      }

      if (!isBlockStatement(node.body)) {
        return false;
      }

      return node.body.body.reduce((acc, value) => {
        if (!isReturnViolation(value) && !isNonReturnViolation(value)) {
          return acc || false;
        }

        return true;
      }, false);
    }

    function isArrowFunctionImplicitReturnViolation(
      argumentNode: TSESTree.CallExpressionArgument
    ) {
      if (!isArrowFunctionExpression(argumentNode)) {
        return false;
      }

      if (!isCallExpression(argumentNode.body)) {
        return false;
      }

      if (
        !isMemberExpression(argumentNode.body.callee) &&
        !getPropertyIdentifierNode(argumentNode.body.callee)
      ) {
        return false;
      }

      let argumentProperty;

      if (isMemberExpression(argumentNode.body.callee)) {
        argumentProperty = getPropertyIdentifierNode(
          argumentNode.body.callee.property
        );
      } else {
        argumentProperty = getPropertyIdentifierNode(argumentNode.body.callee);
      }

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
      return (
        isArrowFunctionBodyViolation(argumentNode) ||
        isArrowFunctionImplicitReturnViolation(argumentNode)
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