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
      description: 'Disallow the use of methods for direct Node access.',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noNodeAccess:
        'Avoid direct Node access. Prefer using the methods from Testing Library.',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const variablesWithNodes: string[] = [];

    function identifyVariablesWithNodes(node: TSESTree.MemberExpression) {
      const callExpression = node.parent as TSESTree.CallExpression;
      const variableDeclarator = callExpression.parent as TSESTree.VariableDeclarator;
      const methodsNames = ALL_QUERIES_METHODS.filter(
        method =>
          isIdentifier(node.property) && node.property.name.includes(method)
      );

      if (methodsNames.length) {
        variablesWithNodes.push(
          isIdentifier(variableDeclarator.id) && variableDeclarator.id.name
        );
      }
    }

    function showErrorForNodeAccess(node: TSESTree.Identifier) {
      if (variablesWithNodes.includes(node.name)) {
        if (isMemberExpression(node.parent)) {
          const isLiteralNumber =
            isLiteral(node.parent.property) &&
            typeof node.parent.property.value === 'number';
          const hasForbiddenMethod =
            isIdentifier(node.parent.property) &&
            ALL_RETURNING_NODES.includes(node.parent.property.name);

          if (isLiteralNumber || hasForbiddenMethod) {
            context.report({
              node: node,
              messageId: 'noNodeAccess',
            });
          }
        }
      }
    }

    return {
      ['VariableDeclarator > CallExpression > MemberExpression']: identifyVariablesWithNodes,
      ['MemberExpression > Identifier']: showErrorForNodeAccess,
    };
  },
});
