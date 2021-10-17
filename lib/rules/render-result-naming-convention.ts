import { ASTUtils, TSESTree } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  getDeepestIdentifierNode,
  getFunctionName,
  getInnermostReturningFunction,
  isObjectPattern,
} from '../node-utils';

export const RULE_NAME = 'render-result-naming-convention';
export type MessageIds = 'renderResultNamingConvention';

type Options = [];

const ALLOWED_VAR_NAMES = ['view', 'utils'];
const ALLOWED_VAR_NAMES_TEXT = ALLOWED_VAR_NAMES.map(
  (name) => `\`${name}\``
).join(', ');

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a valid naming for return value from `render`',
      recommendedConfig: {
        dom: false,
        angular: 'error',
        react: 'error',
        vue: 'error',
      },
    },
    messages: {
      renderResultNamingConvention: `\`{{ renderResultName }}\` is not a recommended name for \`render\` returned value. Instead, you should destructure it, or name it using one of: ${ALLOWED_VAR_NAMES_TEXT}`,
    },
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    const renderWrapperNames: string[] = [];

    function detectRenderWrapper(node: TSESTree.Identifier): void {
      const innerFunction = getInnermostReturningFunction(context, node);

      if (innerFunction) {
        renderWrapperNames.push(getFunctionName(innerFunction));
      }
    }

    return {
      CallExpression(node) {
        const callExpressionIdentifier = getDeepestIdentifierNode(node);

        if (!callExpressionIdentifier) {
          return;
        }

        if (helpers.isRenderUtil(callExpressionIdentifier)) {
          detectRenderWrapper(callExpressionIdentifier);
        }
      },
      VariableDeclarator(node) {
        if (!node.init) {
          return;
        }
        const initIdentifierNode = getDeepestIdentifierNode(node.init);

        if (!initIdentifierNode) {
          return;
        }

        if (
          !helpers.isRenderVariableDeclarator(node) &&
          !renderWrapperNames.includes(initIdentifierNode.name)
        ) {
          return;
        }

        // check if destructuring return value from render
        if (isObjectPattern(node.id)) {
          return;
        }

        const renderResultName = ASTUtils.isIdentifier(node.id) && node.id.name;

        if (!renderResultName) {
          return;
        }

        const isAllowedRenderResultName =
          ALLOWED_VAR_NAMES.includes(renderResultName);

        // check if return value var name is allowed
        if (isAllowedRenderResultName) {
          return;
        }

        context.report({
          node,
          messageId: 'renderResultNamingConvention',
          data: {
            renderResultName,
          },
        });
      },
    };
  },
});
