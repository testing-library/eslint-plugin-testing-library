/**
 * @file Fake rule to be able to test createTestingLibraryRule and
 * detectTestingLibraryUtils properly
 */
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../lib/create-testing-library-rule';

export const RULE_NAME = 'fake-rule';
type Options = [];
type MessageIds = 'fakeError';

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Fake rule to test rule maker and detection helpers',
      category: 'Possible Errors',
      recommended: false,
    },
    messages: {
      fakeError: 'fake error reported',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const reportRenderIdentifier = (node: TSESTree.Identifier) => {
      if (node.name === 'render') {
        context.report({
          node,
          messageId: 'fakeError',
        });
      }
    };

    return {
      'CallExpression Identifier': reportRenderIdentifier,
    };
  },
});
