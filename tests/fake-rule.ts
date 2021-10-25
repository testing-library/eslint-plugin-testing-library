/**
 * @file Fake rule to be able to test createTestingLibraryRule and
 * detectTestingLibraryUtils properly
 */
import { TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../lib/create-testing-library-rule';

export const RULE_NAME = 'fake-rule';
type Options = [];
type MessageIds =
  | 'absenceAssertError'
  | 'asyncUtilError'
  | 'customQueryError'
  | 'fakeError'
  | 'findByError'
  | 'getByError'
  | 'presenceAssertError'
  | 'queryByError'
  | 'renderError'
  | 'userEventError';

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Fake rule to test rule maker and detection helpers',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      fakeError: 'fake error reported',
      renderError: 'some error related to render util reported',
      asyncUtilError:
        'some error related to {{ utilName }} async util reported',
      getByError: 'some error related to getBy reported',
      queryByError: 'some error related to queryBy reported',
      findByError: 'some error related to findBy reported',
      customQueryError: 'some error related to a customQuery reported',
      userEventError: 'some error related to userEvent reported',
      presenceAssertError: 'some error related to presence assert reported',
      absenceAssertError: 'some error related to absence assert reported',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context, _, helpers) {
    const reportCallExpressionIdentifier = (node: TSESTree.Identifier) => {
      // force "render" to be reported
      if (helpers.isRenderUtil(node)) {
        return context.report({ node, messageId: 'renderError' });
      }

      // force async utils to be reported
      if (helpers.isAsyncUtil(node)) {
        return context.report({
          node,
          messageId: 'asyncUtilError',
          data: { utilName: node.name },
        });
      }

      if (helpers.isUserEventMethod(node)) {
        return context.report({ node, messageId: 'userEventError' });
      }

      // force queries to be reported
      if (helpers.isCustomQuery(node)) {
        return context.report({ node, messageId: 'customQueryError' });
      }

      if (helpers.isGetQueryVariant(node)) {
        return context.report({ node, messageId: 'getByError' });
      }

      if (helpers.isQueryQueryVariant(node)) {
        return context.report({ node, messageId: 'queryByError' });
      }

      if (helpers.isFindQueryVariant(node)) {
        return context.report({ node, messageId: 'findByError' });
      }

      return undefined;
    };

    const reportMemberExpression = (node: TSESTree.MemberExpression) => {
      if (helpers.isPresenceAssert(node)) {
        return context.report({ node, messageId: 'presenceAssertError' });
      }

      if (helpers.isAbsenceAssert(node)) {
        return context.report({ node, messageId: 'absenceAssertError' });
      }

      return undefined;
    };

    const reportImportDeclaration = (node: TSESTree.ImportDeclaration) => {
      // This is just to check that defining an `ImportDeclaration` doesn't
      // override `ImportDeclaration` from `detectTestingLibraryUtils`
      if (node.source.value === 'report-me') {
        context.report({ node, messageId: 'fakeError' });
      }
    };

    return {
      'CallExpression Identifier': reportCallExpressionIdentifier,
      MemberExpression: reportMemberExpression,
      ImportDeclaration: reportImportDeclaration,
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
