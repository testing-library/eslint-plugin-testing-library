import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';

export const RULE_NAME = 'render-result-naming-convention';
type MessageIds = 'renderResultNamingConvention';
type Options = [];

const ALLOWED_VAR_NAMES = ['view', 'utils'];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'TODO',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      renderResultNamingConvention: `\`{{ varName }}\` is not a recommended name for \`render\` returned value. Instead, you should destructure it, or call it using one of the valid choices: ${ALLOWED_VAR_NAMES.map(
        name => `\`${name}\``
      ).join(', ')}`,
    },
    fixable: null,
    schema: [],
  },
  defaultOptions: [],

  create() {
    return {};
  },
});
