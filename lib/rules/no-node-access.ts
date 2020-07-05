import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ALL_RETURNING_NODES } from '../utils';
import { isIdentifier } from '../node-utils';

export const RULE_NAME = 'no-node-access';

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct Node access',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noNodeAccess:
        'Avoid direct Node access. Prefer using the methods from Testing Library.',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    function showErrorForNodeAccess(node: TSESTree.MemberExpression) {
      isIdentifier(node.property) &&
        ALL_RETURNING_NODES.includes(node.property.name) &&
        context.report({
          node: node,
          loc: node.property.loc.start,
          messageId: 'noNodeAccess',
        });
    }

    return {
      ['ExpressionStatement MemberExpression']: showErrorForNodeAccess,
      ['VariableDeclarator MemberExpression']: showErrorForNodeAccess,
    };
  },
});
