import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import {
  isCallExpression,
  isMemberExpression,
  isObjectExpression,
  isObjectPattern,
  isProperty,
} from '../node-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'prefer-screen-queries';
export type MessageIds = 'preferScreenQueries';
type Options = [];

const ALLOWED_RENDER_PROPERTIES_FOR_DESTRUCTURING = [
  'container',
  'baseElement',
];

function usesContainerOrBaseElement(node: TSESTree.CallExpression) {
  const secondArgument = node.arguments[1];
  return (
    isObjectExpression(secondArgument) &&
    secondArgument.properties.some(
      (property) =>
        isProperty(property) &&
        ASTUtils.isIdentifier(property.key) &&
        ALLOWED_RENDER_PROPERTIES_FOR_DESTRUCTURING.includes(property.key.name)
    )
  );
}

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using screen while using queries',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      preferScreenQueries:
        'Use screen to query DOM elements, `screen.{{ name }}`',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    function reportInvalidUsage(node: TSESTree.Identifier) {
      context.report({
        node,
        messageId: 'preferScreenQueries',
        data: {
          name: node.name,
        },
      });
    }

    const queriesDestructuredInWithinDeclaration: string[] = [];
    // use an array as within might be used more than once in a test
    const withinDeclaredVariables: string[] = [];

    return {
      VariableDeclarator(node) {
        if (
          !isCallExpression(node.init) ||
          !ASTUtils.isIdentifier(node.init.callee)
        ) {
          return;
        }
        const isWithinFunction = node.init.callee.name === 'within';
        const usesRenderOptions =
          helpers.isRenderUtil(node.init.callee) &&
          usesContainerOrBaseElement(node.init);

        if (!isWithinFunction && !usesRenderOptions) {
          return;
        }

        if (isObjectPattern(node.id)) {
          // save the destructured query methods
          const identifiers = node.id.properties
            .filter(
              (property) =>
                isProperty(property) &&
                ASTUtils.isIdentifier(property.key) &&
                helpers.isQuery(property.key)
            )
            .map(
              (property: TSESTree.Property) =>
                (property.key as TSESTree.Identifier).name
            );

          queriesDestructuredInWithinDeclaration.push(...identifiers);
          return;
        }

        if (ASTUtils.isIdentifier(node.id)) {
          withinDeclaredVariables.push(node.id.name);
        }
      },
      'CallExpression > Identifier'(node: TSESTree.Identifier) {
        if (!helpers.isQuery(node)) {
          return;
        }

        if (
          !queriesDestructuredInWithinDeclaration.some(
            (queryName) => queryName === node.name
          )
        ) {
          reportInvalidUsage(node);
        }
      },
      'MemberExpression > Identifier'(node: TSESTree.Identifier) {
        function isIdentifierAllowed(name: string) {
          return ['screen', ...withinDeclaredVariables].includes(name);
        }

        if (!helpers.isQuery(node)) {
          return;
        }

        if (
          ASTUtils.isIdentifier(node) &&
          isMemberExpression(node.parent) &&
          isCallExpression(node.parent.object) &&
          ASTUtils.isIdentifier(node.parent.object.callee) &&
          node.parent.object.callee.name !== 'within' &&
          helpers.isRenderUtil(node.parent.object.callee) &&
          !usesContainerOrBaseElement(node.parent.object)
        ) {
          reportInvalidUsage(node);
          return;
        }

        if (
          isMemberExpression(node.parent) &&
          ASTUtils.isIdentifier(node.parent.object) &&
          !isIdentifierAllowed(node.parent.object.name)
        ) {
          reportInvalidUsage(node);
        }
      },
    };
  },
});
