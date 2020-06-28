import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { isIdentifier, isMemberExpression, isLiteral } from '../node-utils';
import {
  getDocsUrl,
  ALL_QUERIES_METHODS,
  PROPERTIES_RETURNING_NODES,
  METHODS_RETURNING_NODES,
} from '../utils';

export const RULE_NAME = 'no-node-access';

const ALL_RETURNING_NODES = [
  ...PROPERTIES_RETURNING_NODES,
  ...METHODS_RETURNING_NODES,
];

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of Node methods',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noNodeAccess:
        'Avoid direct Node access. Prefer using the methods from Testing Library."',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const variablesWithNodes: string[] = [];

    function identifyVariablesWithNodes(node: TSESTree.MemberExpression) {
      const methodCalled = ALL_QUERIES_METHODS.filter(
        methodName =>
          isIdentifier(node.property) && node.property.name.includes(methodName)
      );
      const returnsNodeElement = Boolean(methodCalled.length);

      const callExpression = node.parent as TSESTree.CallExpression;
      const variableDeclarator = callExpression.parent as TSESTree.VariableDeclarator;
      const variableName =
        isIdentifier(variableDeclarator.id) && variableDeclarator.id.name;

      if (returnsNodeElement) {
        variablesWithNodes.push(variableName);
      }
    }

    function showErrorForNodeAccess(node: TSESTree.Identifier) {
      if (variablesWithNodes.includes(node.name)) {
        if (
          isMemberExpression(node.parent) &&
          isLiteral(node.parent.property) &&
          typeof node.parent.property.value === 'number'
        ) {
          context.report({
            node: node,
            messageId: 'noNodeAccess',
          });
        }
        isMemberExpression(node.parent) &&
          isIdentifier(node.parent.property) &&
          ALL_RETURNING_NODES.includes(node.parent.property.name) &&
          context.report({
            node: node,
            messageId: 'noNodeAccess',
          });
      }
    }

    return {
      ['VariableDeclarator > CallExpression > MemberExpression']: identifyVariablesWithNodes,
      ['MemberExpression > Identifier']: showErrorForNodeAccess,
    };
  },
});
