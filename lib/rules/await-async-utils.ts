import {
  ESLintUtils,
  TSESTree,
  ASTUtils,
} from '@typescript-eslint/experimental-utils';

import { getDocsUrl, ASYNC_UTILS, LIBRARY_MODULES } from '../utils';
import {
  isAwaited,
  isPromiseResolved,
  getVariableReferences,
  isMemberExpression,
  isImportSpecifier,
  isImportNamespaceSpecifier,
  isCallExpression,
  isArrayExpression,
} from '../node-utils';

export const RULE_NAME = 'await-async-utils';
export type MessageIds = 'awaitAsyncUtil';
type Options = [];

const ASYNC_UTILS_REGEXP = new RegExp(`^(${ASYNC_UTILS.join('|')})$`);

// verifies the CallExpression is Promise.all()
function isPromiseAll(node: TSESTree.CallExpression) {
  return (
    isMemberExpression(node.callee) &&
    ASTUtils.isIdentifier(node.callee.object) &&
    node.callee.object.name === 'Promise' &&
    ASTUtils.isIdentifier(node.callee.property) &&
    node.callee.property.name === 'all'
  );
}

// verifies the node is part of an array used in a CallExpression
function isInPromiseAll(node: TSESTree.Node) {
  const parent = node.parent;
  return (
    isCallExpression(parent) &&
    isArrayExpression(parent.parent) &&
    isCallExpression(parent.parent.parent) &&
    isPromiseAll(parent.parent.parent)
  );
}

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async utils to be awaited properly',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      awaitAsyncUtil: 'Promise returned from `{{ name }}` must be handled',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const asyncUtilsUsage: Array<{
      node: TSESTree.Identifier | TSESTree.MemberExpression;
      name: string;
    }> = [];
    const importedAsyncUtils: string[] = [];

    return {
      'ImportDeclaration > ImportSpecifier,ImportNamespaceSpecifier'(
        node: TSESTree.Node
      ) {
        const parent = node.parent as TSESTree.ImportDeclaration;

        if (!LIBRARY_MODULES.includes(parent.source.value.toString())) {
          return;
        }

        if (isImportSpecifier(node)) {
          importedAsyncUtils.push(node.imported.name);
        }

        if (isImportNamespaceSpecifier(node)) {
          importedAsyncUtils.push(node.local.name);
        }
      },
      [`CallExpression > Identifier[name=${ASYNC_UTILS_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        asyncUtilsUsage.push({ node, name: node.name });
      },
      [`CallExpression > MemberExpression > Identifier[name=${ASYNC_UTILS_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        const memberExpression = node.parent as TSESTree.MemberExpression;
        const identifier = memberExpression.object as TSESTree.Identifier;
        const memberExpressionName = identifier.name;

        asyncUtilsUsage.push({
          node: memberExpression,
          name: memberExpressionName,
        });
      },
      'Program:exit'() {
        const testingLibraryUtilUsage = asyncUtilsUsage.filter((usage) => {
          if (isMemberExpression(usage.node)) {
            const object = usage.node.object as TSESTree.Identifier;

            return importedAsyncUtils.includes(object.name);
          }

          return importedAsyncUtils.includes(usage.name);
        });

        testingLibraryUtilUsage.forEach(({ node, name }) => {
          const references = getVariableReferences(context, node.parent.parent);

          if (
            references &&
            references.length === 0 &&
            !isAwaited(node.parent.parent) &&
            !isPromiseResolved(node) &&
            !isInPromiseAll(node)
          ) {
            context.report({
              node,
              messageId: 'awaitAsyncUtil',
              data: {
                name,
              },
            });
          } else {
            for (const reference of references) {
              const referenceNode = reference.identifier;
              if (
                !isAwaited(referenceNode.parent) &&
                !isPromiseResolved(referenceNode)
              ) {
                context.report({
                  node,
                  messageId: 'awaitAsyncUtil',
                  data: {
                    name,
                  },
                });

                break;
              }
            }
          }
        });
      },
    };
  },
});
