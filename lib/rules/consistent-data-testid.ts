import { getDocsUrl } from '../utils';
import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { isJSXAttribute, isLiteral } from '../node-utils';

export const RULE_NAME = 'consistent-data-testid';
export type MessageIds = 'invalidTestId';
type Options = [
  {
    testIdPattern: string;
    testIdAttribute: string;
  }
];

const { getDocsUrl } = require('../utils');

const FILENAME_PLACEHOLDER = '{fileName}';

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures consistent usage of `data-testid`',
      category: 'Best Practices',
      recommended: false,
      url: getDocsUrl('consistent-data-testid'),
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

    return {
      [`JSXIdentifier[name=${attr}]`]: (node: TSESTree.JSXIdentifier) => {
        if (!isJSXAttribute(node.parent) || !isLiteral(node.parent.value)) {
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
              attr,
              value,
              regex,
            },
          });
        }
      },
    };
  },
});
