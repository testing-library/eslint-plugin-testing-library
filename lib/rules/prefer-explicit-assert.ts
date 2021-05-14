import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';
import { PRESENCE_MATCHERS, ABSENCE_MATCHERS } from '../utils';
import { findClosestCallNode, isMemberExpression } from '../node-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'prefer-explicit-assert';
export type MessageIds =
  | 'preferExplicitAssert'
  | 'preferExplicitAssertAssertion';
type Options = [
  {
    assertion?: string;
  }
];

const isAtTopLevel = (node: TSESTree.Node) =>
  !!node.parent?.parent && node.parent.parent.type === 'ExpressionStatement';

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest using explicit assertions rather than just `getBy*` queries',
      category: 'Best Practices',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      preferExplicitAssert:
        'Wrap stand-alone `getBy*` query with `expect` function for better explicit assertion',
      preferExplicitAssertAssertion:
        '`getBy*` queries must be asserted with `{{assertion}}`',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          assertion: {
            type: 'string',
            enum: PRESENCE_MATCHERS,
          },
        },
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options], helpers) {
    const { assertion } = options;
    const getQueryCalls: TSESTree.Identifier[] = [];

    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (helpers.isGetQueryVariant(node)) {
          getQueryCalls.push(node);
        }
      },
      'Program:exit'() {
        getQueryCalls.forEach((queryCall) => {
          const node = isMemberExpression(queryCall.parent)
            ? queryCall.parent
            : queryCall;

          if (isAtTopLevel(node)) {
            context.report({
              node: queryCall,
              messageId: 'preferExplicitAssert',
            });
          }

          if (assertion) {
            const expectCallNode = findClosestCallNode(node, 'expect');
            if (!expectCallNode) return;

            const expectStatement = expectCallNode.parent as TSESTree.MemberExpression;
            const property = expectStatement.property as TSESTree.Identifier;
            let matcher = property.name;
            let isNegatedMatcher = false;

            if (
              matcher === 'not' &&
              isMemberExpression(expectStatement.parent) &&
              ASTUtils.isIdentifier(expectStatement.parent.property)
            ) {
              isNegatedMatcher = true;
              matcher = expectStatement.parent.property.name;
            }

            const shouldEnforceAssertion =
              (!isNegatedMatcher && PRESENCE_MATCHERS.includes(matcher)) ||
              (isNegatedMatcher && ABSENCE_MATCHERS.includes(matcher));

            if (shouldEnforceAssertion && matcher !== assertion) {
              context.report({
                node: property,
                messageId: 'preferExplicitAssertAssertion',
                data: {
                  assertion,
                },
              });
            }
          }
        });
      },
    };
  },
});
