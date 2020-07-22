import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, hasTestingLibraryImportModule } from '../utils';
import {
  isCallExpression,
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
      description: 'Enforce a valid naming for return value from `render`',
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
    let renderAlias: string | undefined;
    let wildcardImportName: string | undefined;

    return {
      // check named imports
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
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        const isValidRenderDeclarator = isRenderVariableDeclarator(node, [
          ...renderFunctions,
          renderAlias,
        ]);

        if (!isValidRenderDeclarator || isObjectPattern(node.id)) {
          return;
        }

        const renderResultName = isIdentifier(node.id) && node.id.name;

        const renderFunctionName =
          isCallExpression(node.init) &&
          isIdentifier(node.init.callee) &&
          node.init.callee.name;

        const isTestingLibraryRender =
          !!renderAlias || renderFunctions.includes(renderFunctionName);
        const isAllowedRenderResultName = ALLOWED_VAR_NAMES.includes(
          renderResultName
        );

        if (!isTestingLibraryRender || isAllowedRenderResultName) {
          return;
        }

        context.report({
          node,
          messageId: 'invalidRenderResultName',
          data: {
            varName: renderResultName,
          },
        });
      },
    };
  },
});
