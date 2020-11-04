/**
 * @file Fake rule to be able to test createTestingLibraryRule and
 * detectTestingLibraryUtils properly
 */
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../lib/create-testing-library-rule';

export const RULE_NAME = 'fake-rule';
type Options = [];
type MessageIds = 'fakeError' | 'getByError' | 'queryByError';

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
      getByError: 'some error related to getBy reported',
      queryByError: 'some error related to queryBy reported',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],
  create(context, _, helpers) {
    const reportCallExpressionIdentifier = (node: TSESTree.Identifier) => {
      // force "render" to be reported
      if (node.name === 'render') {
        return context.report({ node, messageId: 'fakeError' });
      }

      // force queries to be reported
      if (helpers.isGetByQuery(node)) {
        return context.report({ node, messageId: 'getByError' });
      }

      if (helpers.isQueryByQuery(node)) {
        return context.report({ node, messageId: 'queryByError' });
      }
    };

    const checkImportDeclaration = (node: TSESTree.ImportDeclaration) => {
      // This is just to check that defining an `ImportDeclaration` doesn't
      // override `ImportDeclaration` from `detectTestingLibraryUtils`

      if (node.source.value === 'report-me') {
        context.report({ node, messageId: 'fakeError' });
      }
    };

    return {
      'CallExpression Identifier': reportCallExpressionIdentifier,
      ImportDeclaration: checkImportDeclaration,
      'Program:exit'() {
        const importNode = helpers.getCustomModuleImportNode();
        const importName = helpers.getCustomModuleImportName();
        if (!importNode) {
          return;
        }

        if (importName === 'custom-module-forced-report') {
          context.report({
            node: importNode,
            messageId: 'fakeError',
          });
        }
      },
    };
  },
});
