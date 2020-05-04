import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ALL_QUERIES_COMBINATIONS } from '../utils';

export const RULE_NAME = 'prefer-screen-queries';
export type MessageIds = 'preferScreenQueries';
type Options = [];

const ALL_QUERIES_COMBINATIONS_REGEXP = ALL_QUERIES_COMBINATIONS.join('|');

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using screen while using queries',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      preferScreenQueries:
        'Use screen to query DOM elements, `screen.{{ name }}`',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    function reportInvalidUsage(node: TSESTree.Identifier) {
      context.report({
        node,
        messageId: 'preferScreenQueries',
        data: {
          name: node.name,
        },
      });
    }

    return {
      [`CallExpression > Identifier[name=/^${ALL_QUERIES_COMBINATIONS_REGEXP}$/]`]: reportInvalidUsage,
      [`MemberExpression[object.name!="screen"] > Identifier[name=/^${ALL_QUERIES_COMBINATIONS_REGEXP}$/]`]: reportInvalidUsage,
    };
  },
});
