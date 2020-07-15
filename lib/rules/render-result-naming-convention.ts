import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isIdentifier,
  isObjectPattern,
  isRenderVariableDeclarator,
} from '../node-utils';

export const RULE_NAME = 'render-result-naming-convention';

const ALLOWED_VAR_NAMES = ['view', 'utils'];
const ALLOWED_VAR_NAMES_TEXT = ALLOWED_VAR_NAMES.map(
  name => '`' + name + '`'
).join(', ');

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'TODO',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      invalidRenderResultName: `\`{{ varName }}\` is not a recommended name for \`render\` returned value. Instead, you should destructure it, or call it using one of the valid choices: ${ALLOWED_VAR_NAMES_TEXT}`,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          renderFunctions: {
            type: 'array',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      renderFunctions: [],
    },
  ],

  create(context, [options]) {
    const { renderFunctions } = options;
    let renderResultName = null;

    return {
      VariableDeclarator(node) {
        if (
          isRenderVariableDeclarator(node, renderFunctions) &&
          !isObjectPattern(node.id)
        ) {
          renderResultName = isIdentifier(node.id) && node.id.name;

          if (!ALLOWED_VAR_NAMES.includes(renderResultName)) {
            context.report({
              node,
              messageId: 'invalidRenderResultName',
              data: {
                varName: renderResultName,
              },
            });
          }
        }
      },
    };
  },
});
