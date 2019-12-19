'use strict';

module.exports = {
  meta: {
    docs: {
      description: 'Ensures consistent usage of `data-testid`',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      invalidTestId: '`data-testid` "{{value}}" should match `{{regex}}`',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          testIdPattern: {
            type: 'string',
            default: '',
          },
          excludePaths: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
      },
    ],
  },

  create: function(context) {
    const { options, getFilename } = context;
    const defaultOptions = { testIdPattern: '', excludePaths: [] };
    const ruleOptions = options.length ? options[0] : defaultOptions;

    function getComponentData() {
      const splitPath = getFilename().split('/');
      const exclude = ruleOptions.excludePaths.some(path =>
        splitPath.includes(path)
      );
      const fileNameWithExtension = splitPath.pop();
      const parent = splitPath.pop();
      const fileName = fileNameWithExtension.split('.').shift();

      return {
        componentDescriptor: fileName === 'index' ? parent : fileName,
        exclude,
      };
    }

    function getTestIdValidator({ componentName }) {
      return new RegExp(
        ruleOptions.testIdPattern.replace('{componentName}', componentName)
      );
    }

    return {
      'JSXIdentifier[name=data-testid]': node => {
        const { value } = (node && node.parent && node.parent.value) || {};
        const {
          componentDescriptor: componentName,
          exclude,
        } = getComponentData();
        const regex = getTestIdValidator({ componentName });

        if (!exclude && value && !regex.test(value)) {
          context.report({
            node,
            messageId: 'invalidTestId',
            data: {
              value,
              regex,
            },
          });
        }
      },
    };
  },
};
