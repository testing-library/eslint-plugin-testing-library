import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getPropertyIdentifierNode,
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

    function check(node: TSESTree.CallExpression) {
      if (!isValidWaitFor(node)) {
        return;
      }

      const argumentNode = node.arguments[0];

      if (!isCallExpression(argumentNode)) {
        return;
      }

      if (!isMemberExpression(argumentNode.callee)) {
        return;
      }

      const argumentObjectIdentifier = getPropertyIdentifierNode(
        argumentNode.callee.object
      );

      if (
        argumentObjectIdentifier?.name &&
        argumentObjectIdentifier.name !== 'screen'
      ) {
        return;
      }

      const argumentProperty = getPropertyIdentifierNode(
        argumentNode.callee.property
      );

      if (!argumentProperty) {
        return;
      }

      if (
        !helpers.isGetQueryVariant(argumentProperty) &&
        // not sure if this rule should handle findBy*, perhaps it could be a new rule to disallow findBy
        !helpers.isFindQueryVariant(argumentProperty)
      ) {
        return;
      }

      context.report({
        node: argumentProperty,
        messageId: 'preferQueryByDisappearance',
      });
    }

    return {
      CallExpression: check,
    };
  },
});
