import { createTestingLibraryRule } from '../create-testing-library-rule';
import { getDeepestIdentifierNode, isObjectPattern } from '../node-utils';
import { ASTUtils } from '@typescript-eslint/experimental-utils';

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
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      renderResultNamingConvention: `\`{{ renderResultName }}\` is not a recommended name for \`render\` returned value. Instead, you should destructure it, or name it using one of: ${ALLOWED_VAR_NAMES_TEXT}`,
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create(context, _, helpers) {
    return {
      VariableDeclarator(node) {
        const initIdentifierNode = getDeepestIdentifierNode(node.init);

        if (!initIdentifierNode) {
          return;
        }

        if (!helpers.isRenderUtil(initIdentifierNode)) {
          return;
        }

        // check if destructuring return value from render
        if (isObjectPattern(node.id)) {
          return;
        }

        const renderResultName = ASTUtils.isIdentifier(node.id) && node.id.name;

        const isAllowedRenderResultName = ALLOWED_VAR_NAMES.includes(
          renderResultName
        );

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
