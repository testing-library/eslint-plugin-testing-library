import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import { isIdentifier, isCallExpression, hasThenProperty } from '../node-utils';

export const RULE_NAME = 'await-fire-event';
export type MessageIds = 'awaitFireEvent';
type Options = [];

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

function isAwaited(node: TSESTree.Node) {
  return VALID_PARENTS.includes(node.type);
}

function isPromiseResolved(node: TSESTree.Node) {
  const parent = node.parent.parent;

  // fireEvent.click().then(...)
  return isCallExpression(parent) && hasThenProperty(parent.parent);
}

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async fire event methods to be awaited',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      awaitFireEvent: 'async `fireEvent.{{ methodName }}` must be awaited',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create: function(context) {
    return {
      'CallExpression > MemberExpression > Identifier[name=fireEvent]'(
        node: TSESTree.Identifier
      ) {
        const memberExpression = node.parent as TSESTree.MemberExpression;
        const fireEventMethodNode = memberExpression.property;

        if (
          isIdentifier(fireEventMethodNode) &&
          !isAwaited(node.parent.parent.parent) &&
          !isPromiseResolved(fireEventMethodNode)
        ) {
          context.report({
            node: fireEventMethodNode,
            messageId: 'awaitFireEvent',
            data: {
              methodName: fireEventMethodNode.name,
            },
          });
        }
      },
    };
  },
});
