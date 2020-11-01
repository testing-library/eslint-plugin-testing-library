/**
 * @file Fake rule to be able to test createTestingLibraryRule and
 * detectTestingLibraryUtils properly
 */
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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
  create(context, _, helpers) {
    const reportRenderIdentifier = (node: TSESTree.Identifier) => {
      if (node.name === 'render') {
        context.report({
          node,
          messageId: 'fakeError',
        });
      }
    };

    const checkImportDeclaration = (node: TSESTree.ImportDeclaration) => {
      // This is just to check that defining an `ImportDeclaration` doesn't
      // override `ImportDeclaration` from `detectTestingLibraryUtils`

      if (node.source.value === 'report-me') {
        context.report({
          node,
          messageId: 'fakeError',
        });
      }
    };

    return {
      'CallExpression Identifier': reportRenderIdentifier,
      ImportDeclaration: checkImportDeclaration,
      'Program:exit'() {
        const importNode = helpers.getCustomModuleImportNode();
        if (!importNode) {
          return;
        }

        if (
          importNode.type === AST_NODE_TYPES.ImportDeclaration &&
          importNode.source.value === 'custom-module-forced-report'
        ) {
          context.report({
            node: importNode,
            messageId: 'fakeError',
          });
        }
      },
    };
  },
});
