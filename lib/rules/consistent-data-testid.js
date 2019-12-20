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
        },
      },
    ],
  },

  create: function(context) {
    const { options, getFilename } = context;
    const defaultOptions = { testIdPattern: '', excludePaths: [] };
    const ruleOptions = options.length ? options[0] : defaultOptions;

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
      return new RegExp(
        ruleOptions.testIdPattern.replace('{fileName}', fileName)
      );
    }

    return {
      'JSXIdentifier[name=data-testid]': node => {
        const { value } = (node && node.parent && node.parent.value) || {};
        const { fileName } = getFileNameData();
        const regex = getTestIdValidator({ fileName });

        if (value && !regex.test(value)) {
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
