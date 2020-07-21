import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, hasTestingLibraryImportModule } from '../utils';
import {
  isIdentifier,
  isImportSpecifier,
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
    let renderResultName: string | null = null;
    let renderAlias: string | undefined;

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (!hasTestingLibraryImportModule(node)) {
          return;
        }
        const renderImport = node.specifiers.find(
          node => isImportSpecifier(node) && node.imported.name === 'render'
        );

        if (!renderImport) {
          return;
        }

        renderAlias = renderImport.local.name;
      },
      VariableDeclarator(node) {
        if (
          isRenderVariableDeclarator(node, renderFunctions) &&
          !isObjectPattern(node.id)
        ) {
          renderResultName = isIdentifier(node.id) && node.id.name;
          const isTestingLibraryRenderAlias = !!renderAlias;
          const isAllowedRenderResultName = ALLOWED_VAR_NAMES.includes(
            renderResultName
          );

          if (isTestingLibraryRenderAlias && !isAllowedRenderResultName) {
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
