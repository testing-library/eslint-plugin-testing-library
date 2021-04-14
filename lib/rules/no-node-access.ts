import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';
import { ALL_RETURNING_NODES } from '../utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-node-access';
export type MessageIds = 'noNodeAccess';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
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
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    function showErrorForNodeAccess(node: TSESTree.MemberExpression) {
      // This rule is so aggressive that can cause tons of false positives outside test files when Aggressive Reporting
      // is enabled. Because of that, this rule will skip this mechanism and report only if some Testing Library package
      // or custom one (set in utils-module Shared Setting) is found.
      if (!helpers.isTestingLibraryImported(true)) {
        return;
      }

      ASTUtils.isIdentifier(node.property) &&
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
