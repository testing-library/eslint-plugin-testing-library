import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isJSXAttribute, isLiteral } from '../node-utils';
import { getFilename } from '../utils';

export const RULE_NAME = 'consistent-data-testid';
export type MessageIds =
	| 'consistentDataTestId'
	| 'consistentDataTestIdCustomMessage';
export type Options = [
	{
		testIdAttribute?: string[] | string;
		testIdPattern: string;
		customMessage?: string;
	},
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
				svelte: false,
				marko: false,
			},
		},
		messages: {
			consistentDataTestId: '`{{attr}}` "{{value}}" should match `{{regex}}`',
			consistentDataTestIdCustomMessage: '`{{message}}`',
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
					customMessage: {
						default: undefined,
						type: 'string',
					},
				},
			},
		],
	},
	defaultOptions: [
		{
			testIdPattern: '',
			testIdAttribute: 'data-testid',
			customMessage: undefined,
		},
	],
	detectionOptions: {
		skipRuleReportingCheck: true,
	},

	create: (context, [options]) => {
		const { testIdPattern, testIdAttribute: attr, customMessage } = options;

		function getFileNameData() {
			const splitPath = getFilename(context).split('/');
			const fileNameWithExtension = splitPath.pop() ?? '';
			if (
				fileNameWithExtension.includes('[') ||
				fileNameWithExtension.includes(']')
			) {
				return { fileName: undefined };
			}
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

		function getErrorMessageId(): MessageIds {
			if (customMessage === undefined) {
				return 'consistentDataTestId';
			}

			return 'consistentDataTestIdCustomMessage';
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
						messageId: getErrorMessageId(),
						data: {
							attr: node.name,
							value,
							regex,
							message: customMessage,
						},
					});
				}
			},
		};
	},
});
