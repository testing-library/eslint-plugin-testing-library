import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  isImportSpecifier,
  isMemberExpression,
  findClosestCallExpressionNode,
  isCallExpression,
  isImportNamespaceSpecifier,
  isObjectPattern,
  isProperty,
} from '../node-utils';

export const RULE_NAME = 'prefer-wait-for';
export type MessageIds =
  | 'preferWaitForImport'
  | 'preferWaitForMethod'
  | 'preferWaitForRequire';
type Options = [];

const DEPRECATED_METHODS = ['wait', 'waitForElement', 'waitForDomChange'];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use `waitFor` instead of deprecated wait methods',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      preferWaitForMethod:
        '`{{ methodName }}` is deprecated in favour of `waitFor`',
      preferWaitForImport: 'import `waitFor` instead of deprecated async utils',
      preferWaitForRequire:
        'require `waitFor` instead of deprecated async utils',
    },

    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    let addWaitFor = false;

    const reportRequire = (node: TSESTree.ObjectPattern) => {
      context.report({
        node,
        messageId: 'preferWaitForRequire',
        fix(fixer) {
          const excludedImports = [...DEPRECATED_METHODS, 'waitFor'];

          const newAllRequired = node.properties
            .filter(
              (s) =>
                isProperty(s) &&
                ASTUtils.isIdentifier(s.key) &&
                !excludedImports.includes(s.key.name)
            )
            .map(
              (s) => ((s as TSESTree.Property).key as TSESTree.Identifier).name
            );

          newAllRequired.push('waitFor');

          return fixer.replaceText(node, `{ ${newAllRequired.join(',')} }`);
        },
      });
    };

    const reportImport = (node: TSESTree.ImportDeclaration) => {
      context.report({
        node,
        messageId: 'preferWaitForImport',
        fix(fixer) {
          const excludedImports = [...DEPRECATED_METHODS, 'waitFor'];

          // get all import names excluding all testing library `wait*` utils...
          const newImports = node.specifiers
            .map(
              (specifier) =>
                isImportSpecifier(specifier) &&
                !excludedImports.includes(specifier.imported.name) &&
                specifier.imported.name
            )
            .filter(Boolean) as string[];

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

    const reportWait = (node: TSESTree.Identifier | TSESTree.JSXIdentifier) => {
      context.report({
        node,
        messageId: 'preferWaitForMethod',
        data: {
          methodName: node.name,
        },
        fix(fixer) {
          const callExpressionNode = findClosestCallExpressionNode(node);
          if (!callExpressionNode) {
            return null;
          }
          const [arg] = callExpressionNode.arguments;
          const fixers = [];

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
              ASTUtils.isIdentifier(node.parent.object)
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
      'CallExpression > MemberExpression'(node: TSESTree.MemberExpression) {
        const isDeprecatedMethod =
          ASTUtils.isIdentifier(node.property) &&
          DEPRECATED_METHODS.includes(node.property.name);
        if (!isDeprecatedMethod) {
          // the method does not match a deprecated method
          return;
        }
        if (!helpers.isNodeComingFromTestingLibrary(node)) {
          // the method does not match from the imported elements from TL (even from custom)
          return;
        }
        addWaitFor = true;
        reportWait(node.property as TSESTree.Identifier); // compiler is not picking up correctly, it should have inferred it is an identifier
      },
      'CallExpression > Identifier'(node: TSESTree.Identifier) {
        if (!DEPRECATED_METHODS.includes(node.name)) {
          return;
        }

        if (!helpers.isNodeComingFromTestingLibrary(node)) {
          return;
        }
        addWaitFor = true;
        reportWait(node);
      },
      'Program:exit'() {
        if (!addWaitFor) {
          return;
        }
        // now that all usages of deprecated methods were replaced, remove the extra imports
        const testingLibraryNode =
          helpers.getCustomModuleImportNode() ??
          helpers.getTestingLibraryImportNode();
        if (isCallExpression(testingLibraryNode)) {
          const parent =
            testingLibraryNode.parent as TSESTree.VariableDeclarator;
          if (!isObjectPattern(parent.id)) {
            // if there is no destructuring, there is nothing to replace
            return;
          }
          reportRequire(parent.id);
        } else if (testingLibraryNode) {
          if (
            testingLibraryNode.specifiers.length === 1 &&
            isImportNamespaceSpecifier(testingLibraryNode.specifiers[0])
          ) {
            // if we import everything, there is nothing to replace
            return;
          }
          reportImport(testingLibraryNode);
        }
      },
    };
  },
});
