import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ALL_QUERIES_COMBINATIONS } from '../utils';
import {
  isMemberExpression,
  isObjectPattern,
  isCallExpression,
  isProperty,
  isIdentifier,
} from '../node-utils';

export const RULE_NAME = 'prefer-screen-queries';
export type MessageIds = 'preferScreenQueries';
type Options = [];

const ALL_QUERIES_COMBINATIONS_REGEXP = ALL_QUERIES_COMBINATIONS.join('|');

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using screen while using queries',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      preferScreenQueries:
        'Use screen to query DOM elements, `screen.{{ name }}`',
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    function reportInvalidUsage(node: TSESTree.Identifier) {
      context.report({
        node,
        messageId: 'preferScreenQueries',
        data: {
          name: node.name,
        },
      });
    }

    const queriesRegex = new RegExp(ALL_QUERIES_COMBINATIONS_REGEXP);
    const queriesDestructuredInWithinDeclaration: string[] = [];
    // use an array as within might be used more than once in a test
    const withinDeclaredVariables : string[] = []

    return {
      VariableDeclarator(node) {
        const isWithinFunction = isCallExpression(node.init) && isIdentifier(node.init.callee) && node.init.callee.name === 'within';

        if (!isWithinFunction) {
          return
        }

        if (isObjectPattern(node.id)) {
          // save the destructured query methods
          const identifiers = node.id.properties
            .filter(property => isProperty(property) && isIdentifier(property.key) && queriesRegex.test(property.key.name))
            .map((property: TSESTree.Property) => (property.key as TSESTree.Identifier).name);

          queriesDestructuredInWithinDeclaration.push(...identifiers);
          return
        }

        if (isIdentifier(node.id)) {
          withinDeclaredVariables.push(node.id.name)
        }
      },
      [`CallExpression > Identifier[name=/^${ALL_QUERIES_COMBINATIONS_REGEXP}$/]`](
        node: TSESTree.Identifier
      ) {
        if (
          !queriesDestructuredInWithinDeclaration.some(
            queryName => queryName === node.name
          )
        ) {
          reportInvalidUsage(node);
        }
      },
      [`MemberExpression > Identifier[name=/^${ALL_QUERIES_COMBINATIONS_REGEXP}$/]`](
        node: TSESTree.Identifier
      ) {

        function isIdentifierAllowed(name: string) {
          return ['screen', ...withinDeclaredVariables].includes(name)
        }

        if (
          isIdentifier(node) &&
          isMemberExpression(node.parent) &&
          isCallExpression(node.parent.object) &&
          isIdentifier(node.parent.object.callee) && 
          node.parent.object.callee.name !== 'within'
        ) {
          reportInvalidUsage(node);
          return;
        }
        if (
          isMemberExpression(node.parent) &&
          isIdentifier(node.parent.object) &&
          !isIdentifierAllowed(node.parent.object.name)
        ) {
          reportInvalidUsage(node);
        }
      },
    };
  },
});
