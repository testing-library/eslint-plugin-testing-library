import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl, hasTestingLibraryImportModule } from '../utils';
import {
  isCallExpression,
  isIdentifier,
  isImportSpecifier,
  isMemberExpression,
  isObjectPattern,
  isRenderVariableDeclarator,
} from '../node-utils';

export const RULE_NAME = 'render-result-naming-convention';
export type MessageIds = 'renderResultNamingConvention';
type Options = [{ renderFunctions?: string[] }];

const ALLOWED_VAR_NAMES = ['view', 'utils'];
const ALLOWED_VAR_NAMES_TEXT = ALLOWED_VAR_NAMES.map(
  (name) => `\`${name}\``
).join(', ');

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a valid naming for return value from `render`',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      renderResultNamingConvention: `\`{{ varName }}\` is not a recommended name for \`render\` returned value. Instead, you should destructure it, or call it using one of the valid choices: ${ALLOWED_VAR_NAMES_TEXT}`,
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
          (node) => isImportSpecifier(node) && node.imported.name === 'render'
        );

        if (!renderImport) {
          return;
        }

        renderAlias = renderImport.local.name;
      },
      // check wildcard imports
      'ImportDeclaration ImportNamespaceSpecifier'(
        node: TSESTree.ImportNamespaceSpecifier
      ) {
        if (
          !hasTestingLibraryImportModule(
            node.parent as TSESTree.ImportDeclaration
          )
        ) {
          return;
        }

        wildcardImportName = node.local.name;
      },
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        // check if destructuring return value from render
        if (isObjectPattern(node.id)) {
          return;
        }

        const isValidRenderDeclarator = isRenderVariableDeclarator(node, [
          ...renderFunctions,
          renderAlias,
        ]);
        const isValidWildcardImport = !!wildcardImportName;

        // check if is a Testing Library related import
        if (!isValidRenderDeclarator && !isValidWildcardImport) {
          return;
        }

        const renderFunctionName =
          isCallExpression(node.init) &&
          isIdentifier(node.init.callee) &&
          node.init.callee.name;

        const renderFunctionObjectName =
          isCallExpression(node.init) &&
          isMemberExpression(node.init.callee) &&
          isIdentifier(node.init.callee.property) &&
          isIdentifier(node.init.callee.object) &&
          node.init.callee.property.name === 'render' &&
          node.init.callee.object.name;

        const isRenderAlias = !!renderAlias;
        const isCustomRender = renderFunctions.includes(renderFunctionName);
        const isWildCardRender =
          renderFunctionObjectName &&
          renderFunctionObjectName === wildcardImportName;

        // check if is a qualified render function
        if (!isRenderAlias && !isCustomRender && !isWildCardRender) {
          return;
        }

        const renderResultName = isIdentifier(node.id) && node.id.name;
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
            varName: renderResultName,
          },
        });
      },
    };
  },
});
