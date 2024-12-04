import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	isMemberExpression,
	isCallExpression,
	isProperty,
	isObjectExpression,
	getDeepestIdentifierNode,
	isLiteral,
} from '../node-utils';

export const RULE_NAME = 'no-global-regexp-flag-in-query';
export type MessageIds = 'noGlobalRegExpFlagInQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow the use of the global RegExp flag (/g) in queries',
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
				vue: 'error',
				svelte: 'error',
				marko: 'error',
			},
		},
		messages: {
			noGlobalRegExpFlagInQuery:
				'Avoid using the global RegExp flag (/g) in queries',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],
	create(context, _, helpers) {
		/**
		 * Checks if node is reportable (has a regex that contains 'g') and if it is, reports it with `context.report()`.
		 *
		 * @param literalNode Literal node under to be
		 * @returns {Boolean} indicatinf if literal was reported
		 */
		function reportLiteralWithRegex(literalNode: TSESTree.Node) {
			if (
				isLiteral(literalNode) &&
				'regex' in literalNode &&
				literalNode.regex.flags.includes('g')
			) {
				context.report({
					node: literalNode,
					messageId: 'noGlobalRegExpFlagInQuery',
					fix(fixer) {
						const splitter = literalNode.raw.lastIndexOf('/');
						const raw = literalNode.raw.substring(0, splitter);
						const flags = literalNode.raw.substring(splitter + 1);
						const flagsWithoutGlobal = flags.replace('g', '');

						return fixer.replaceText(
							literalNode,
							`${raw}/${flagsWithoutGlobal}`
						);
					},
				});
				return true;
			}
			return false;
		}

		function getArguments(identifierNode: TSESTree.Identifier) {
			if (isCallExpression(identifierNode.parent)) {
				return identifierNode.parent.arguments;
			} else if (
				isMemberExpression(identifierNode.parent) &&
				isCallExpression(identifierNode.parent.parent)
			) {
				return identifierNode.parent.parent.arguments;
			}

			return [];
		}

		// Helper array to store variable nodes that have a literal with regex
		// e.g. `const countRegExp = /count/gi` will be store here
		const variableNodesWithRegexs: TSESTree.VariableDeclarator[] = [];

		function hasRegexInVariable(
			identifier: TSESTree.Identifier
		): TSESTree.VariableDeclarator | undefined {
			return variableNodesWithRegexs.find((varNode) => {
				if (
					ASTUtils.isVariableDeclarator(varNode) &&
					ASTUtils.isIdentifier(varNode.id)
				) {
					return varNode.id.name === identifier.name;
				}
				return undefined;
			});
		}

		return {
			// internal helper function, helps store all variables with regex to `variableNodesWithRegexs`
			// could potentially be refactored to using context.getDeclaredVariables()
			VariableDeclarator(node: TSESTree.Node) {
				if (
					ASTUtils.isVariableDeclarator(node) &&
					isLiteral(node.init) &&
					'regex' in node.init &&
					node.init.regex.flags.includes('g')
				) {
					variableNodesWithRegexs.push(node);
				}
			},
			CallExpression(node) {
				const identifierNode = getDeepestIdentifierNode(node);
				if (!identifierNode || !helpers.isQuery(identifierNode)) {
					return;
				}

				const [firstArg, secondArg] = getArguments(identifierNode);

				const firstArgumentHasError = reportLiteralWithRegex(firstArg);
				if (firstArgumentHasError) {
					return;
				}

				// Case issue #592: a variable that has a regex is passed to testing library query

				if (ASTUtils.isIdentifier(firstArg)) {
					const regexVariableNode = hasRegexInVariable(firstArg);
					if (regexVariableNode !== undefined) {
						context.report({
							node: firstArg,
							messageId: 'noGlobalRegExpFlagInQuery',
							fix(fixer) {
								if (
									ASTUtils.isVariableDeclarator(regexVariableNode) &&
									isLiteral(regexVariableNode.init) &&
									'regex' in regexVariableNode.init &&
									regexVariableNode.init.regex.flags.includes('g')
								) {
									const splitter = regexVariableNode.init.raw.lastIndexOf('/');
									const raw = regexVariableNode.init.raw.substring(0, splitter);
									const flags = regexVariableNode.init.raw.substring(
										splitter + 1
									);
									const flagsWithoutGlobal = flags.replace('g', '');

									return fixer.replaceText(
										regexVariableNode.init,
										`${raw}/${flagsWithoutGlobal}`
									);
								}
								return null;
							},
						});
					}
				}

				if (isObjectExpression(secondArg)) {
					const namePropertyNode = secondArg.properties.find(
						(p) =>
							isProperty(p) &&
							ASTUtils.isIdentifier(p.key) &&
							p.key.name === 'name' &&
							isLiteral(p.value)
					) as TSESTree.Property | undefined;

					if (namePropertyNode) {
						reportLiteralWithRegex(namePropertyNode.value);
					}
				}
			},
		};
	},
});
