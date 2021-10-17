import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isJSXAttribute, isLiteral } from '../node-utils';

export const RULE_NAME = 'consistent-data-testid';
export type MessageIds = 'consistentDataTestId';
export type Options = [
  {
    testIdAttribute?: string[] | string;
    testIdPattern: string;
  }
];

const FILENAME_PLACEHOLDER = '{fileName}';

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures consistent usage of `data-testid`',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
    },
    messages: {
      consistentDataTestId: '`{{attr}}` "{{value}}" should match `{{regex}}`',
    },
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
  detectionOptions: {
    skipRuleReportingCheck: true,
  },

  create: (context, [options]) => {
    const { getFilename } = context;
    const { testIdPattern, testIdAttribute: attr } = options;

    function getFileNameData() {
      const splitPath = getFilename().split('/');
      const fileNameWithExtension = splitPath.pop() ?? '';
      const parent = splitPath.pop();
      const fileName = fileNameWithExtension.split('.').shift();

      return {
        fileName: fileName === 'index' ? parent : fileName,
      };
    }

    function getTestIdValidator(fileName: string) {
      return new RegExp(testIdPattern.replace(FILENAME_PLACEHOLDER, fileName));
    }

    function isTestIdAttribute(name: string): boolean {
      if (typeof attr === 'string') {
        return attr === name;
      } else {
        return attr?.includes(name) ?? false;
      }
    }

    return {
      JSXIdentifier: (node) => {
        if (
          !node.parent ||
          !isJSXAttribute(node.parent) ||
          !isLiteral(node.parent.value) ||
          !isTestIdAttribute(node.name)
        ) {
          return;
        }

        const value = node.parent.value.value;
        const { fileName } = getFileNameData();
        const regex = getTestIdValidator(fileName ?? '');

        if (value && typeof value === 'string' && !regex.test(value)) {
          context.report({
            node,
            messageId: 'consistentDataTestId',
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
