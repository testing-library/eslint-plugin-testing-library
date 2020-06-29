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

const ALL_QUERIES_AND_RETURNING_NODES = [
  ...ALL_QUERIES_METHODS,
  ...ALL_RETURNING_NODES,
];

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct Node access',
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

    function showErrorForNodeAccess(node: TSESTree.MemberExpression) {
      const isLiteralNumber =
        isLiteral(node.property) && typeof node.property.value === 'number';
      const hasForbiddenMethod =
        isIdentifier(node.property) &&
        ALL_RETURNING_NODES.includes(node.property.name);

      (isLiteralNumber || hasForbiddenMethod) &&
        context.report({
          node: node,
          loc: node.loc.start,
          messageId: 'noNodeAccess',
        });
    }

    function checkVariablesWithNodes(node: TSESTree.MemberExpression) {
      const callExpression = node.parent as TSESTree.CallExpression;
      const variableDeclarator = callExpression.parent as TSESTree.VariableDeclarator;
      const methodsNames = ALL_QUERIES_AND_RETURNING_NODES.filter(
        method =>
          isIdentifier(node.property) && node.property.name.includes(method)
      );

      if (methodsNames.length) {
        variablesWithNodes.push(
          isIdentifier(variableDeclarator.id) && variableDeclarator.id.name
        );
      }
    }

    function checkDirectNodeAccess(node: TSESTree.Identifier) {
      if (variablesWithNodes.includes(node.name)) {
        isMemberExpression(node.parent) && showErrorForNodeAccess(node.parent);
      }
    }

    function checkDirectMethodCall(node: TSESTree.CallExpression) {
      const methodsNames = ALL_QUERIES_AND_RETURNING_NODES.filter(
        method =>
          isMemberExpression(node.callee) &&
          isIdentifier(node.callee.property) &&
          node.callee.property.name.includes(method)
      );
      if (methodsNames.length && isMemberExpression(node.parent)) {
        showErrorForNodeAccess(node.parent);
      }
    }

    return {
      ['VariableDeclarator > CallExpression > MemberExpression']: checkVariablesWithNodes,
      ['MemberExpression > Identifier']: checkDirectNodeAccess,
      ['CallExpression']: checkDirectMethodCall,
    };
  },
});
