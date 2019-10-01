'use strict';

const { getDocsUrl } = require('../utils');

const DOM_TESTING_LIBRARY_MODULES = [
  'dom-testing-library',
  '@testing-library/dom',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow importing from DOM Testing Library',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('no-dom-import'),
    },
    messages: {
      noDomImport:
        'import from DOM Testing Library is restricted, import from corresponding Testing Library framework instead',
      noDomImportFramework:
        'import from DOM Testing Library is restricted, import from {{module}} instead',
    },
    fixable: 'code',
    schema: [
      {
        type: 'string',
      },
    ],
  },

  create: function(context) {
    const framework = context.options[0];

    return {
      ImportDeclaration(node) {
        const domModuleName = DOM_TESTING_LIBRARY_MODULES.find(
          module => module === node.source.value
        );

        if (domModuleName) {
          report(context, node, domModuleName);
        }
      },

      [`CallExpression > Identifier[name="require"]`](node) {
        const { arguments: args } = node.parent;

        const literalNodeDomModuleName = args.find(args =>
          DOM_TESTING_LIBRARY_MODULES.includes(args.value)
        );

        if (literalNodeDomModuleName) {
          report(context, node, literalNodeDomModuleName.value);
        }
      },
    };

    function report(context, node, moduleName) {
      if (framework) {
        const isRequire = node.name === 'require';
        const correctModuleName = moduleName.replace('dom', framework);
        context.report({
          node,
          messageId: 'noDomImportFramework',
          data: {
            module: correctModuleName,
          },
          fix(fixer) {
            if (isRequire) {
              const name = node.parent.arguments[0];
              // Replace the module name with the raw module name as we can't predict which punctuation the user is going to use
              return fixer.replaceText(
                name,
                name.raw.replace(moduleName, correctModuleName)
              );
            } else {
              const name = node.source;
              return fixer.replaceText(
                name,
                name.raw.replace(moduleName, correctModuleName)
              );
            }
          },
        });
      } else {
        context.report({
          node,
          messageId: 'noDomImport',
        });
      }
    }
  },
};
