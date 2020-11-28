import {
  ESLintUtils,
  TSESTree,
  ASTUtils,
} from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import { isAwaited, hasChainedThen } from '../node-utils';

export const RULE_NAME = 'await-fire-event';
export type MessageIds = 'awaitFireEvent';
type Options = [];
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

  create: function (context) {
    return {
      'CallExpression > MemberExpression > Identifier[name=fireEvent]'(
        node: TSESTree.Identifier
      ) {
        const memberExpression = node.parent as TSESTree.MemberExpression;
        const fireEventMethodNode = memberExpression.property;

        if (
          ASTUtils.isIdentifier(fireEventMethodNode) &&
          !isAwaited(node.parent.parent.parent) &&
          !hasChainedThen(fireEventMethodNode.parent)
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
