'use strict';

const FILENAME_PLACEHOLDER = '{fileName}';

module.exports = {
  meta: {
    docs: {
      description: 'Ensures consistent usage of `data-testid`',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      invalidTestId: '`{{attr}}` "{{value}}" should match `{{regex}}`',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        default: {},
        additionalProperties: false,
        required: ['testIdPattern'],
        properties: {
          testIdPattern: {
            type: 'string',
          },
          testIdAttribute: {
            type: 'string',
            default: 'data-testid',
          },
        },
      },
    ],
  },

  create: function(context) {
    const { options, getFilename } = context;
    const { testIdPattern, testIdAttribute: attr } = options[0];

    function getFileNameData() {
      const splitPath = getFilename().split('/');
      const fileNameWithExtension = splitPath.pop();
      const parent = splitPath.pop();
      const fileName = fileNameWithExtension.split('.').shift();

      return {
        fileName: fileName === 'index' ? parent : fileName,
      };
    }

    function getTestIdValidator({ fileName }) {
      return new RegExp(testIdPattern.replace(FILENAME_PLACEHOLDER, fileName));
    }

    return {
      [`JSXIdentifier[name=${attr}]`]: node => {
        const value =
          node && node.parent && node.parent.value && node.parent.value.value;
        const { fileName } = getFileNameData();
        const regex = getTestIdValidator({ fileName });

        if (value && !regex.test(value)) {
          context.report({
            node,
            messageId: 'invalidTestId',
            data: {
              attr,
              value,
              regex,
            },
          });
        }
      },
    };
  },
};
