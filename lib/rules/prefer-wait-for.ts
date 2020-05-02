import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isImportSpecifier,
  isMemberExpression,
  isIdentifier,
  findClosestCallExpressionNode,
} from '../node-utils';

export const RULE_NAME = 'prefer-wait-for';
export type MessageIds = 'preferWaitForMethod' | 'preferWaitForImport';
type Options = [];

const DEPRECATED_METHODS = ['wait', 'waitForElement', 'waitForDomChange'];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use `waitFor` instead of deprecated wait methods',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      preferWaitForMethod:
        '`{{ methodName }}` is deprecated in favour of `waitFor`',
      preferWaitForImport: 'import `waitFor` instead of deprecated async utils',
    },

    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const importNodes: TSESTree.ImportDeclaration[] = [];
    const waitNodes: TSESTree.Identifier[] = [];

    const reportImport = (node: TSESTree.ImportDeclaration) => {
      context.report({
        node: node,
        messageId: 'preferWaitForImport',
        fix(fixer) {
          const excludedImports = [...DEPRECATED_METHODS, 'waitFor'];

          // TODO: refactor `importNodes` to TSESTree.ImportSpecifier[] ? (to not have to traverse the list twice)
          // get all import names excluding all testing library `wait*` utils...
          const newImports = node.specifiers
            .filter(
              specifier =>
                isImportSpecifier(specifier) &&
                !excludedImports.includes(specifier.imported.name)
            )
            .map(
              (specifier: TSESTree.ImportSpecifier) => specifier.imported.name
            );

          // ... and append `waitFor`
          newImports.push('waitFor');

          // build new node with new imports and previous source value
          const newNode = `import { ${newImports.join(',')} } from '${
            node.source.value
          }';`;

          return fixer.replaceText(node, newNode);
        },
      });
    };

    const reportWait = (node: TSESTree.Identifier) => {
      context.report({
        node: node,
        messageId: 'preferWaitForMethod',
        data: {
          methodName: node.name,
        },
        fix(fixer) {
          const callExpressionNode = findClosestCallExpressionNode(node);
          const [arg] = callExpressionNode.arguments;
          const fixers = [];

          if (arg) {
            // if method been fixed already had a callback
            // then we just replace the method name.
            fixers.push(fixer.replaceText(node, 'waitFor'));

            if (node.name === 'waitForDomChange') {
              // if method been fixed is `waitForDomChange`
              // then the arg received was options object so we need to insert
              // empty callback before.
              fixers.push(fixer.insertTextBefore(arg, '() => {}, '));
            }
          } else {
            // if wait method been fixed didn't have any callback
            // then we replace the method name and include an empty callback.
            let methodReplacement = 'waitFor(() => {})';

            // if wait method used like `foo.wait()` then we need to keep the
            // member expression to get `foo.waitFor(() => {})`
            if (
              isMemberExpression(node.parent) &&
              isIdentifier(node.parent.object)
            ) {
              methodReplacement = `${node.parent.object.name}.${methodReplacement}`;
            }
            const newText = methodReplacement;

            fixers.push(fixer.replaceText(callExpressionNode, newText));
          }

          return fixers;
        },
      });
    };

    return {
      'ImportDeclaration[source.value=/testing-library/]'(
        node: TSESTree.ImportDeclaration
      ) {
        const importedNames = node.specifiers
          .filter(
            specifier => isImportSpecifier(specifier) && specifier.imported
          )
          .map(
            (specifier: TSESTree.ImportSpecifier) => specifier.imported.name
          );

        if (
          importedNames.some(importedName =>
            DEPRECATED_METHODS.includes(importedName)
          )
        ) {
          importNodes.push(node);
        }
      },
      'CallExpression Identifier[name=/^(wait|waitForElement|waitForDomChange)$/]'(
        node: TSESTree.Identifier
      ) {
        waitNodes.push(node);
      },
      'Program:exit'() {
        waitNodes.forEach(waitNode => {
          reportWait(waitNode);
        });

        importNodes.forEach(importNode => {
          reportImport(importNode);
        });
      },
    };
  },
});
