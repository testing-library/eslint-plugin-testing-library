import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isVariableDeclarator,
  hasThenProperty,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
} from '../node-utils';

export const RULE_NAME = 'await-async-query';
export type MessageIds = 'awaitAsyncQuery';
type Options = [];

const VALID_PARENTS = [
  'AwaitExpression',
  'ArrowFunctionExpression',
  'ReturnStatement',
];

const ASYNC_QUERIES_REGEXP = /^find(All)?By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce async queries to have proper `await`',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      awaitAsyncQuery: '`{{ name }}` must have `await` operator',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const testingLibraryQueryUsage: {
      node: TSESTree.Identifier | TSESTree.MemberExpression;
      queryName: string;
    }[] = [];
    const isQueryUsage = (
      node: TSESTree.Identifier | TSESTree.MemberExpression
    ) =>
      !isAwaited(node.parent.parent) &&
      !isPromiseResolved(node) &&
      !hasClosestExpectResolvesRejects(node);

    return {
      [`CallExpression > Identifier[name=${ASYNC_QUERIES_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        if (isQueryUsage(node)) {
          testingLibraryQueryUsage.push({ node, queryName: node.name });
        }
      },
      [`MemberExpression > Identifier[name=${ASYNC_QUERIES_REGEXP}]`](
        node: TSESTree.Identifier
      ) {
        // Perform checks in parent MemberExpression instead of current identifier
        const parent = node.parent as TSESTree.MemberExpression;
        if (isQueryUsage(parent)) {
          testingLibraryQueryUsage.push({ node: parent, queryName: node.name });
        }
      },
      'Program:exit'() {
        testingLibraryQueryUsage.forEach(({ node, queryName }) => {
          const variableDeclaratorParent = node.parent.parent;

          const references =
            (isVariableDeclarator(variableDeclaratorParent) &&
              context
                .getDeclaredVariables(variableDeclaratorParent)[0]
                .references.slice(1)) ||
            [];

          if (references && references.length === 0) {
            context.report({
              node,
              messageId: 'awaitAsyncQuery',
              data: {
                name: queryName,
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
                  messageId: 'awaitAsyncQuery',
                  data: {
                    name: queryName,
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

  // findByText("foo").then(...)
  if (isCallExpression(parent)) {
    return hasThenProperty(parent.parent);
  }

  // promise.then(...)
  return hasThenProperty(parent);
}

function hasClosestExpectResolvesRejects(node: TSESTree.Node): boolean {
  if (!node.parent) {
    return false;
  }

  if (
    isCallExpression(node) &&
    isIdentifier(node.callee) &&
    isMemberExpression(node.parent) &&
    node.callee.name === 'expect'
  ) {
    const expectMatcher = node.parent.property;
    return (
      isIdentifier(expectMatcher) &&
      (expectMatcher.name === 'resolves' || expectMatcher.name === 'rejects')
    );
  } else {
    return hasClosestExpectResolvesRejects(node.parent);
  }
}
