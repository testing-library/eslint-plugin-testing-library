import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { getDocsUrl, ASYNC_UTILS } from '../utils';
import { isCallExpression, hasThenProperty } from '../node-utils';

export const RULE_NAME = 'await-async-utils';
export type MessageIds = 'awaitAsyncUtil';
type Options = [];

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

const ASYNC_UTILS_REGEXP = new RegExp(`^(${ASYNC_UTILS.join('|')})$`);

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
    const testingLibraryUtilUsage: TSESTree.Identifier[] = [];
    return {
      [`CallExpression > Identifier[name=${ASYNC_UTILS_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        if (!isAwaited(node.parent.parent) && !isPromiseResolved(node)) {
          testingLibraryUtilUsage.push(node);
        }
      },
      'Program:exit'() {
        testingLibraryUtilUsage.forEach(node => {
          const variableDeclaratorParent = node.parent.parent;

          const references =
            (variableDeclaratorParent.type === 'VariableDeclarator' &&
              context
                .getDeclaredVariables(variableDeclaratorParent)[0]
                .references.slice(1)) ||
            [];

          if (
            references &&
            references.length === 0 &&
            !isAwaited(node.parent.parent) &&
            !isPromiseResolved(node)
          ) {
            context.report({
              node,
              messageId: 'awaitAsyncUtil',
              data: {
                name: node.name,
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
                    name: node.name,
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

function isAwaited(node: TSESTree.Node) {
  return VALID_PARENTS.includes(node.type);
}

function isPromiseResolved(node: TSESTree.Node) {
  const parent = node.parent;

  // wait(...).then(...)
  if (isCallExpression(parent)) {
    return hasThenProperty(parent.parent);
  }

  // promise.then(...)
  return hasThenProperty(parent);
}
