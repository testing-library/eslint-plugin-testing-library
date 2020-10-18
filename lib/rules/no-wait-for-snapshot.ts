import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ASYNC_UTILS, LIBRARY_MODULES } from '../utils';
import {
  findClosestCallExpressionNode,
  isMemberExpression,
} from '../node-utils';

export const RULE_NAME = 'no-wait-for-snapshot';
export type MessageIds = 'noWaitForSnapshot';
type Options = [];

const ASYNC_UTILS_REGEXP = new RegExp(`^(${ASYNC_UTILS.join('|')})$`);
const SNAPSHOT_REGEXP = /^(toMatchSnapshot|toMatchInlineSnapshot)$/;

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures no snapshot is generated inside of a `waitFor` call',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      noWaitForSnapshot:
        "A snapshot can't be generated inside of a `{{ name }}` call",
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
    const snapshotUsage: TSESTree.Identifier[] = [];

    return {
      'ImportDeclaration > ImportSpecifier,ImportNamespaceSpecifier'(
        node: TSESTree.Node
      ) {
        const parent = node.parent as TSESTree.ImportDeclaration;

        if (!LIBRARY_MODULES.includes(parent.source.value.toString())) {
          return;
        }

        let name;
        if (node.type === 'ImportSpecifier') {
          name = node.imported.name;
        }

        if (node.type === 'ImportNamespaceSpecifier') {
          name = node.local.name;
        }

        importedAsyncUtils.push(name);
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
      [`Identifier[name=${SNAPSHOT_REGEXP}]`](node: TSESTree.Identifier) {
        snapshotUsage.push(node);
      },
      'Program:exit'() {
        const testingLibraryUtilUsage = asyncUtilsUsage.filter((usage) => {
          if (isMemberExpression(usage.node)) {
            const object = usage.node.object as TSESTree.Identifier;

            return importedAsyncUtils.includes(object.name);
          }

          return importedAsyncUtils.includes(usage.name);
        });

        function getClosestAsyncUtil(
          asyncUtilUsage: {
            node: TSESTree.Identifier | TSESTree.MemberExpression;
            name: string;
          },
          node: TSESTree.Node
        ) {
          let callExpression = findClosestCallExpressionNode(node);
          while (callExpression != null) {
            if (callExpression.callee === asyncUtilUsage.node)
              return asyncUtilUsage;
            callExpression = findClosestCallExpressionNode(
              callExpression.parent
            );
          }
          return null;
        }

        snapshotUsage.forEach((node) => {
          testingLibraryUtilUsage.forEach((asyncUtilUsage) => {
            const closestAsyncUtil = getClosestAsyncUtil(asyncUtilUsage, node);
            if (closestAsyncUtil != null) {
              let name;
              if (isMemberExpression(closestAsyncUtil.node)) {
                name = (closestAsyncUtil.node.property as TSESTree.Identifier)
                  .name;
              } else {
                name = closestAsyncUtil.name;
              }
              context.report({
                node,
                messageId: 'noWaitForSnapshot',
                data: { name },
              });
            }
          });
        });
      },
    };
  },
});
