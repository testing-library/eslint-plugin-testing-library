import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  isMemberExpression,
  isCallExpression,
  isProperty,
  isObjectExpression,
  getDeepestIdentifierNode,
  isLiteral,
} from '../node-utils';

export const RULE_NAME = 'no-global-regexp-flag-in-query';
export type MessageIds = 'noGlobalRegExpFlagInQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of the global RegExp flag (/g) in queries',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      noGlobalRegExpFlagInQuery:
        'Avoid using the global RegExp flag (/g) in queries',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context, _, helpers) {
    function report(literalNode: TSESTree.Node) {
      if (
        isLiteral(literalNode) &&
        'regex' in literalNode &&
        literalNode.regex.flags.includes('g')
      ) {
        context.report({
          node: literalNode,
          messageId: 'noGlobalRegExpFlagInQuery',
          fix(fixer) {
            const splitter = literalNode.raw.lastIndexOf('/');
            const raw = literalNode.raw.substring(0, splitter);
            const flags = literalNode.raw.substring(splitter + 1);
            const flagsWithoutGlobal = flags.replace('g', '');

            return fixer.replaceText(
              literalNode,
              `${raw}/${flagsWithoutGlobal}`
            );
          },
        });
        return true;
      }
      return false;
    }

    return {
      CallExpression(node) {
        const identifierNode = getDeepestIdentifierNode(node);
        if (!identifierNode || !helpers.isQuery(identifierNode)) {
          return;
        }

        const [firstArg, secondArg] = isCallExpression(identifierNode.parent)
          ? identifierNode.parent.arguments
          : isMemberExpression(identifierNode.parent) &&
            isCallExpression(identifierNode.parent.parent)
          ? identifierNode.parent.parent.arguments
          : [];

        if (!report(firstArg)) {
          if (isObjectExpression(secondArg)) {
            const namePropertyNode = secondArg.properties.find(
              (p) =>
                isProperty(p) &&
                ASTUtils.isIdentifier(p.key) &&
                p.key.name === 'name' &&
                isLiteral(p.value)
            ) as TSESTree.ObjectLiteralElement & { value: TSESTree.Literal };
            report(namePropertyNode.value);
          }
        }
      },
    };
  },
});
