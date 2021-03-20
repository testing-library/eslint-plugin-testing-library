import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { isMemberExpression, isObjectPattern, isProperty } from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-container';
export type MessageIds = 'noContainer';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of container methods',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noContainer:
        'Avoid using container methods. Prefer using the methods from Testing Library, such as "getByRole()"',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, [], helpers) {
    const destructuredContainerPropNames: string[] = [];
    let renderWrapperName: string = null;
    let containerName: string = null;
    let containerCallsMethod = false;

    function showErrorIfChainedContainerMethod(
      innerNode: TSESTree.MemberExpression
    ) {
      if (isMemberExpression(innerNode)) {
        if (ASTUtils.isIdentifier(innerNode.object)) {
          const isContainerName = innerNode.object.name === containerName;
          const isRenderWrapper = innerNode.object.name === renderWrapperName;

          containerCallsMethod =
            ASTUtils.isIdentifier(innerNode.property) &&
            innerNode.property.name === 'container' &&
            isRenderWrapper;

          if (isContainerName || containerCallsMethod) {
            context.report({
              node: innerNode,
              messageId: 'noContainer',
            });
          }
        }
        showErrorIfChainedContainerMethod(
          innerNode.object as TSESTree.MemberExpression
        );
      }
    }

    return {
      VariableDeclarator(node) {
        if (!helpers.isRenderVariableDeclarator(node)) {
          return;
        }

        if (isObjectPattern(node.id)) {
          const containerIndex = node.id.properties.findIndex(
            (property) =>
              isProperty(property) &&
              ASTUtils.isIdentifier(property.key) &&
              property.key.name === 'container'
          );

          const nodeValue =
            containerIndex !== -1 && node.id.properties[containerIndex].value;

          if (ASTUtils.isIdentifier(nodeValue)) {
            containerName = nodeValue.name;
          } else {
            isObjectPattern(nodeValue) &&
              nodeValue.properties.forEach(
                (property) =>
                  isProperty(property) &&
                  ASTUtils.isIdentifier(property.key) &&
                  destructuredContainerPropNames.push(property.key.name)
              );
          }
        } else {
          renderWrapperName = ASTUtils.isIdentifier(node.id) && node.id.name;
        }
      },

      CallExpression(node) {
        if (isMemberExpression(node.callee)) {
          showErrorIfChainedContainerMethod(node.callee);
        } else {
          ASTUtils.isIdentifier(node.callee) &&
            destructuredContainerPropNames.includes(node.callee.name) &&
            context.report({
              node,
              messageId: 'noContainer',
            });
        }
      },
    };
  },
});
