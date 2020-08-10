import { getDocsUrl } from '../utils';
import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { isJSXAttribute, isLiteral } from '../node-utils';

export const RULE_NAME = 'consistent-data-testid';
export type MessageIds = 'invalidTestId';
type Options = [
  {
    testIdPattern: string;
    testIdAttribute?: string | string[];
  }
];

const FILENAME_PLACEHOLDER = '{fileName}';

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
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
            default: 'data-testid',
            oneOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      testIdPattern: '',
      testIdAttribute: 'data-testid',
    },
  ],

  create(context, [options]) {
    const { getFilename } = context;
    const { testIdPattern, testIdAttribute: attr } = options;

    function getFileNameData() {
      const splitPath = getFilename().split('/');
      const fileNameWithExtension = splitPath.pop();
      const parent = splitPath.pop();
      const fileName = fileNameWithExtension.split('.').shift();

      return {
        fileName: fileName === 'index' ? parent : fileName,
      };
    }

    function getTestIdValidator(fileName: string) {
      return new RegExp(testIdPattern.replace(FILENAME_PLACEHOLDER, fileName));
    }

    function isTestIdAttribute(name: string) {
      if (typeof attr === 'string') {
        return attr === name;
      } else {
        return attr.includes(name);
      }
    }

    return {
      [`JSXIdentifier`]: (node: TSESTree.JSXIdentifier) => {
        if (
          !isJSXAttribute(node.parent) ||
          !isLiteral(node.parent.value) ||
          !isTestIdAttribute(node.name)
        ) {
          return;
        }

        const value = node.parent.value.value;
        const { fileName } = getFileNameData();
        const regex = getTestIdValidator(fileName);

        if (value && typeof value === 'string' && !regex.test(value)) {
          context.report({
            node,
            messageId: 'invalidTestId',
            data: {
              attr: node.name,
              value,
              regex,
            },
          });
        }
      },
    };
  },
});
