import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ALL_RETURNING_NODES } from '../utils';
import { isIdentifier } from '../node-utils';
import detect from '../testing-library-detection';

export const RULE_NAME = 'no-node-access';
export type MessageIds = 'noNodeAccess';
type Options = [];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
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

  create: detect((context: any, _: any, helpers: any) => {
    function showErrorForNodeAccess(node: TSESTree.MemberExpression) {
      isIdentifier(node.property) &&
        ALL_RETURNING_NODES.includes(node.property.name) &&
        helpers.getIsImportingTestingLibrary() &&
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
  }),
});
