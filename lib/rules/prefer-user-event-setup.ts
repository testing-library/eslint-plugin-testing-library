import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';

import type { TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'prefer-user-event-setup';

export type MessageIds = 'preferUserEventSetup';
export type Options = [];

const USER_EVENT_PACKAGE = '@testing-library/user-event';
const USER_EVENT_NAME = 'userEvent';
const SETUP_METHOD_NAME = 'setup';

// All userEvent methods that should use setup()
const USER_EVENT_METHODS = [
	'clear',
	'click',
	'copy',
	'cut',
	'dblClick',
	'deselectOptions',
	'hover',
	'keyboard',
	'pointer',
	'paste',
	'selectOptions',
	'tripleClick',
	'type',
	'unhover',
	'upload',
	'tab',
] as const;

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Suggest using userEvent with setup() instead of direct methods',
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
			preferUserEventSetup:
				'Prefer using userEvent with setup() instead of direct {{method}}() call. Use: const user = userEvent.setup(); await user.{{method}}(...)',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context) {
		// Track variables assigned from userEvent.setup()
		const userEventSetupVars = new Set<string>();

		// Track functions that return userEvent.setup() instances
		const setupFunctions = new Map<string, Set<string>>();

		// Track imported userEvent identifier (could be aliased)
		let userEventIdentifier: string | null = null;

		function isUserEventSetupCall(node: TSESTree.Node): boolean {
			return (
				node.type === AST_NODE_TYPES.CallExpression &&
				node.callee.type === AST_NODE_TYPES.MemberExpression &&
				node.callee.object.type === AST_NODE_TYPES.Identifier &&
				node.callee.object.name === userEventIdentifier &&
				node.callee.property.type === AST_NODE_TYPES.Identifier &&
				node.callee.property.name === SETUP_METHOD_NAME
			);
		}

		function isDirectUserEventMethodCall(
			node: TSESTree.MemberExpression
		): boolean {
			return (
				node.object.type === AST_NODE_TYPES.Identifier &&
				node.object.name === userEventIdentifier &&
				node.property.type === AST_NODE_TYPES.Identifier &&
				USER_EVENT_METHODS.includes(
					node.property.name as (typeof USER_EVENT_METHODS)[number]
				)
			);
		}

		return {
			// Track userEvent imports
			ImportDeclaration(node: TSESTree.ImportDeclaration) {
				if (node.source.value === USER_EVENT_PACKAGE) {
					// Default import: import userEvent from '@testing-library/user-event'
					const defaultImport = node.specifiers.find(
						(spec) => spec.type === AST_NODE_TYPES.ImportDefaultSpecifier
					);
					if (defaultImport) {
						userEventIdentifier = defaultImport.local.name;
					}

					// Named import: import { userEvent } from '@testing-library/user-event'
					const namedImport = node.specifiers.find(
						(spec) =>
							spec.type === AST_NODE_TYPES.ImportSpecifier &&
							spec.imported.type === AST_NODE_TYPES.Identifier &&
							spec.imported.name === USER_EVENT_NAME
					);
					if (
						namedImport &&
						namedImport.type === AST_NODE_TYPES.ImportSpecifier
					) {
						userEventIdentifier = namedImport.local.name;
					}
				}
			},

			// Track variables assigned from userEvent.setup()
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				if (!userEventIdentifier || !node.init) return;

				// Direct assignment: const user = userEvent.setup()
				if (
					isUserEventSetupCall(node.init) &&
					node.id.type === AST_NODE_TYPES.Identifier
				) {
					userEventSetupVars.add(node.id.name);
				}

				// Destructuring from a setup function
				if (
					node.id.type === AST_NODE_TYPES.ObjectPattern &&
					node.init.type === AST_NODE_TYPES.CallExpression &&
					node.init.callee.type === AST_NODE_TYPES.Identifier
				) {
					const functionName = node.init.callee.name;
					const setupProps = setupFunctions.get(functionName);

					if (setupProps) {
						for (const prop of node.id.properties) {
							if (
								prop.type === AST_NODE_TYPES.Property &&
								prop.key.type === AST_NODE_TYPES.Identifier &&
								setupProps.has(prop.key.name) &&
								prop.value.type === AST_NODE_TYPES.Identifier
							) {
								userEventSetupVars.add(prop.value.name);
							}
						}
					}
				}
			},

			// Track functions that return objects with userEvent.setup()
			// Note: This simplified implementation only checks direct return statements
			// in the function body, not nested functions or complex flows
			FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
				if (!userEventIdentifier || !node.id) return;

				// For simplicity, only check direct return statements in the function body
				if (node.body && node.body.type === AST_NODE_TYPES.BlockStatement) {
					for (const statement of node.body.body) {
						if (statement.type === AST_NODE_TYPES.ReturnStatement) {
							const ret = statement;
							if (
								ret.argument &&
								ret.argument.type === AST_NODE_TYPES.ObjectExpression
							) {
								const props = new Set<string>();
								for (const prop of ret.argument.properties) {
									if (
										prop.type === AST_NODE_TYPES.Property &&
										prop.key.type === AST_NODE_TYPES.Identifier &&
										prop.value &&
										isUserEventSetupCall(prop.value)
									) {
										props.add(prop.key.name);
									}
								}
								if (props.size > 0) {
									setupFunctions.set(node.id.name, props);
								}
							}
						}
					}
				}
			},

			// Check for direct userEvent method calls
			CallExpression(node: TSESTree.CallExpression) {
				if (!userEventIdentifier) return;

				if (
					node.callee.type === AST_NODE_TYPES.MemberExpression &&
					isDirectUserEventMethodCall(node.callee)
				) {
					const methodName = (node.callee.property as TSESTree.Identifier).name;

					// Check if this is called on a setup instance
					const isSetupInstance =
						node.callee.object.type === AST_NODE_TYPES.Identifier &&
						userEventSetupVars.has(node.callee.object.name);

					if (!isSetupInstance) {
						context.report({
							node: node.callee,
							messageId: 'preferUserEventSetup',
							data: {
								method: methodName,
							},
						});
					}
				}
			},
		};
	},
});
