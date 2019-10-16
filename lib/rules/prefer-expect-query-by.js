'use strict';

const { getDocsUrl } = require('../utils');

const AST_NODE_TYPES = {
  Identifier: 'Identifier',
  MemberExpression: 'MemberExpression',
};

function isIdentifier(node) {
  return node.type === AST_NODE_TYPES.Identifier;
}

function isMemberExpression(node) {
  return node.type === AST_NODE_TYPES.MemberExpression;
}

function isUsingWrongQueries(node) {
  return node.name.startsWith('getBy') || node.name.startsWith('getAllBy');
}

function isNotNullOrUndefined(input) {
  return input != null;
}

function mapNodesForWrongGetByQuery(node) {
  const nodeArguments = node.arguments;
  return nodeArguments
    .map(arg => {
      if (!arg.callee) {
        return null;
      }
      // Example: `expect(rendered.getBy*)`
      if (isMemberExpression(arg.callee)) {
        const node = arg.callee.property;
        if (isIdentifier(node) && isUsingWrongQueries(node)) {
          return node;
        }
        return null;
      }

      // Example: `expect(getBy*)`
      if (isIdentifier(arg.callee) && isUsingWrongQueries(arg.callee)) {
        return arg.callee;
      }

      return null;
    })
    .filter(isNotNullOrUndefined);
}

function hasExpectWithWrongGetByQuery(node) {
  if (
    node.callee &&
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === 'expect' &&
    node.arguments
  ) {
    const nodesGetBy = mapNodesForWrongGetByQuery(node);
    return nodesGetBy.length > 0;
  }
  return false;
}

module.exports = {
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow using getBy* queries in expect calls',
      recommended: 'error',
      url: getDocsUrl('prefer-expect-query-by'),
    },
    messages: {
      expectQueryBy:
        'Using `expect(getBy*)` is not recommended, use `expect(queryBy*)` instead.',
    },
    schema: [],
    type: 'suggestion',
    fixable: null,
  },

  create: context => ({
    CallExpression(node) {
      if (hasExpectWithWrongGetByQuery(node)) {
        // const nodesGetBy = mapNodesForWrongGetByQuery(node);
        context.report({
          node: node.callee,
          messageId: 'expectQueryBy',
          // TODO: we keep the autofixing disabled for now, until we figure out
          // a better way to amend for the edge cases.
          // See also the related discussion: https://github.com/Belco90/eslint-plugin-testing-library/pull/22#discussion_r335394402
          // fix(fixer) {
          //   return fixer.replaceText(
          //     nodesGetBy[0],
          //     nodesGetBy[0].name.replace(/^(get(All)?(.*))$/, 'query$2$3')
          //   );
          // },
        });
      }
    },
  }),
};
