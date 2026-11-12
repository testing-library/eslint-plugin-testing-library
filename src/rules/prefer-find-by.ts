import { ASTUtils } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	isArrowFunctionExpression,
	isBlockStatement,
	isCallExpression,
	isExpressionStatement,
	isMemberExpression,
	isObjectExpression,
	isObjectPattern,
	isProperty,
	isVariableDeclaration,
} from '../node-utils';
import { getScope, getSourceCode } from '../utils';

import type { TSESTree, TSESLint } from '@typescript-eslint/utils';

const RULE_NAME = 'prefer-find-by';
export type MessageIds = 'preferFindBy';
type Options = [];

export function getFindByQueryVariant(
	queryMethod: string
): 'findAllBy' | 'findBy' {
	return queryMethod.includes('All') ? 'findAllBy' : 'findBy';
}

function findRenderDefinitionDeclaration(
	scope: TSESLint.Scope.Scope | null,
	query: string
): TSESTree.Identifier | null {
	if (!scope) {
		return null;
	}

	const variable = scope.variables.find(
		(v: TSESLint.Scope.Variable) => v.name === query
	);

	if (variable) {
		return (
			variable.defs
				.map(({ name }) => name)
				.filter(ASTUtils.isIdentifier)
				.find(({ name }) => name === query) ?? null
		);
	}

	return findRenderDefinitionDeclaration(scope.upper, query);
}

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Suggest using `find(All)By*` query instead of `waitFor` + `get(All)By*` to wait for elements',
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
			preferFindBy:
				'Prefer `{{queryVariant}}{{queryMethod}}` query over using `waitFor` + `{{prevQuery}}`',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		const sourceCode = getSourceCode(context);

		/**
		 * Reports the invalid usage of wait* plus getBy/QueryBy methods and automatically fixes the scenario
		 * @param node - The CallExpression node that contains the waitFor method
		 * @param replacementParams - Object with info for error message and autofix:
		 * @param replacementParams.queryVariant - The variant method used to query: findBy/findAllBy.
		 * @param replacementParams.prevQuery - The query originally used inside `waitFor`
		 * @param replacementParams.queryMethod - Suffix string to build the query method (the query-part that comes after the "By"): LabelText, Placeholder, Text, Role, Title, etc.
		 * @param replacementParams.fix - Function that applies the fix to correct the code
		 */
		function reportInvalidUsage(
			node: TSESTree.CallExpression,
			replacementParams: {
				queryVariant: 'findAllBy' | 'findBy';
				queryMethod: string;
				prevQuery: string;
				fix: TSESLint.ReportFixFunction;
			}
		) {
			const { queryMethod, queryVariant, prevQuery, fix } = replacementParams;
			context.report({
				node,
				messageId: 'preferFindBy',
				data: {
					queryVariant,
					queryMethod,
					prevQuery,
				},
				fix,
			});
		}

		function getWrongQueryNameInAssertion(body: TSESTree.CallExpression) {
			if (!isMemberExpression(body.callee)) {
				return null;
			}

			// expect(getByText).toBeInTheDocument() shape
			if (
				isCallExpression(body.callee.object) &&
				isCallExpression(body.callee.object.arguments[0]) &&
				ASTUtils.isIdentifier(body.callee.object.arguments[0].callee)
			) {
				return body.callee.object.arguments[0].callee;
			}

			if (!ASTUtils.isIdentifier(body.callee.property)) {
				return null;
			}

			// expect(screen.getByText).toBeInTheDocument() shape
			if (
				isCallExpression(body.callee.object) &&
				isCallExpression(body.callee.object.arguments[0]) &&
				isMemberExpression(body.callee.object.arguments[0].callee) &&
				ASTUtils.isIdentifier(body.callee.object.arguments[0].callee.property)
			) {
				return body.callee.object.arguments[0].callee.property;
			}

			// expect(screen.getByText).not shape
			if (
				isMemberExpression(body.callee.object) &&
				isCallExpression(body.callee.object.object) &&
				isCallExpression(body.callee.object.object.arguments[0]) &&
				isMemberExpression(body.callee.object.object.arguments[0].callee) &&
				ASTUtils.isIdentifier(
					body.callee.object.object.arguments[0].callee.property
				)
			) {
				return body.callee.object.object.arguments[0].callee.property;
			}

			// expect(getByText).not shape
			if (
				isMemberExpression(body.callee.object) &&
				isCallExpression(body.callee.object.object) &&
				isCallExpression(body.callee.object.object.arguments[0]) &&
				ASTUtils.isIdentifier(body.callee.object.object.arguments[0].callee)
			) {
				return body.callee.object.object.arguments[0].callee;
			}

			return body.callee.property;
		}

		function getWrongQueryName(body: TSESTree.CallExpression) {
			// expect(() => getByText) and expect(() => screen.getByText) shape
			if (
				ASTUtils.isIdentifier(body.callee) &&
				helpers.isSyncQuery(body.callee)
			) {
				return body.callee;
			}

			return getWrongQueryNameInAssertion(body);
		}

		function getCaller(body: TSESTree.CallExpression) {
			if (!isMemberExpression(body.callee)) {
				return null;
			}

			if (ASTUtils.isIdentifier(body.callee.object)) {
				// () => screen.getByText
				return body.callee.object.name;
			}

			if (
				// expect()
				isCallExpression(body.callee.object) &&
				ASTUtils.isIdentifier(body.callee.object.callee) &&
				isCallExpression(body.callee.object.arguments[0]) &&
				isMemberExpression(body.callee.object.arguments[0].callee) &&
				ASTUtils.isIdentifier(body.callee.object.arguments[0].callee.object)
			) {
				return body.callee.object.arguments[0].callee.object.name;
			}

			if (
				// expect().not
				isMemberExpression(body.callee.object) &&
				isCallExpression(body.callee.object.object) &&
				isCallExpression(body.callee.object.object.arguments[0]) &&
				isMemberExpression(body.callee.object.object.arguments[0].callee) &&
				ASTUtils.isIdentifier(
					body.callee.object.object.arguments[0].callee.object
				)
			) {
				return body.callee.object.object.arguments[0].callee.object.name;
			}

			return null;
		}

		function isSyncQuery(body: TSESTree.CallExpression) {
			const isQuery =
				ASTUtils.isIdentifier(body.callee) && helpers.isSyncQuery(body.callee);

			const isWrappedInPresenceAssert =
				isMemberExpression(body.callee) &&
				isCallExpression(body.callee.object) &&
				isCallExpression(body.callee.object.arguments[0]) &&
				ASTUtils.isIdentifier(body.callee.object.arguments[0].callee) &&
				helpers.isSyncQuery(body.callee.object.arguments[0].callee) &&
				helpers.isPresenceAssert(body.callee);

			const isWrappedInNegatedPresenceAssert =
				isMemberExpression(body.callee) &&
				isMemberExpression(body.callee.object) &&
				isCallExpression(body.callee.object.object) &&
				isCallExpression(body.callee.object.object.arguments[0]) &&
				ASTUtils.isIdentifier(body.callee.object.object.arguments[0].callee) &&
				helpers.isSyncQuery(body.callee.object.object.arguments[0].callee) &&
				helpers.isPresenceAssert(body.callee.object);

			return (
				isQuery || isWrappedInPresenceAssert || isWrappedInNegatedPresenceAssert
			);
		}

		function isScreenSyncQuery(body: TSESTree.CallExpression) {
			if (
				!isMemberExpression(body.callee) ||
				!ASTUtils.isIdentifier(body.callee.property)
			) {
				return false;
			}

			if (
				!ASTUtils.isIdentifier(body.callee.object) &&
				!isCallExpression(body.callee.object) &&
				!isMemberExpression(body.callee.object)
			) {
				return false;
			}

			const isWrappedInPresenceAssert =
				helpers.isPresenceAssert(body.callee) &&
				isCallExpression(body.callee.object) &&
				isCallExpression(body.callee.object.arguments[0]) &&
				isMemberExpression(body.callee.object.arguments[0].callee) &&
				ASTUtils.isIdentifier(body.callee.object.arguments[0].callee.object);

			const isWrappedInNegatedPresenceAssert =
				isMemberExpression(body.callee.object) &&
				helpers.isPresenceAssert(body.callee.object) &&
				isCallExpression(body.callee.object.object) &&
				isCallExpression(body.callee.object.object.arguments[0]) &&
				isMemberExpression(body.callee.object.object.arguments[0].callee);

			return (
				helpers.isSyncQuery(body.callee.property) ||
				isWrappedInPresenceAssert ||
				isWrappedInNegatedPresenceAssert
			);
		}

		/**
		 * Returns the node to analyze for the `waitFor` callback.
		 * A block body consisting of a single expression statement
		 * (e.g. `{ expect(getByText('foo')).toBeInTheDocument() }`)
		 * is equivalent to an expression body, so that expression is used.
		 * Otherwise, the callback body is returned as is.
		 */
		function getCallbackBody(node: TSESTree.ArrowFunctionExpression) {
			if (!isBlockStatement(node.body)) {
				return node.body;
			}

			const [statement, ...restStatements] = node.body.body;
			if (restStatements.length === 0 && isExpressionStatement(statement)) {
				return statement.expression;
			}

			return node.body;
		}

		/**
		 * Checks if unwrapping a block body into its single expression
		 * would drop comments placed outside that expression
		 * (e.g. `{ // reason \n expect(getByText('foo')).toBeInTheDocument() }`).
		 */
		function hasCommentsOutsideExpression(
			node: TSESTree.ArrowFunctionExpression,
			expression: TSESTree.Node
		) {
			if (!isBlockStatement(node.body)) {
				return false;
			}

			const [expressionStart, expressionEnd] = expression.range;
			return sourceCode
				.getCommentsInside(node.body)
				.some(
					({ range: [commentStart, commentEnd] }) =>
						commentStart < expressionStart || commentEnd > expressionEnd
				);
		}

		function getQueryArguments(node: TSESTree.CallExpression) {
			if (
				isMemberExpression(node.callee) &&
				isCallExpression(node.callee.object) &&
				isCallExpression(node.callee.object.arguments[0])
			) {
				return node.callee.object.arguments[0].arguments;
			}

			if (
				isMemberExpression(node.callee) &&
				isMemberExpression(node.callee.object) &&
				isCallExpression(node.callee.object.object) &&
				isCallExpression(node.callee.object.object.arguments[0])
			) {
				return node.callee.object.object.arguments[0].arguments;
			}

			return node.arguments;
		}

		return {
			'AwaitExpression > CallExpression'(
				node: TSESTree.CallExpression & { parent: TSESTree.AwaitExpression }
			) {
				if (
					!ASTUtils.isIdentifier(node.callee) ||
					!helpers.isAsyncUtil(node.callee, ['waitFor'])
				) {
					return;
				}
				// ensure the only argument is an arrow function expression
				const argument = node.arguments[0];

				if (!isArrowFunctionExpression(argument)) {
					return;
				}

				const argumentBody = getCallbackBody(argument);

				if (isBlockStatement(argumentBody) && argument.async) {
					const { body } = argumentBody;
					const declarations = body
						.filter(isVariableDeclaration)
						?.flatMap((declaration) => declaration.declarations);

					const findByDeclarator = declarations.find((declaration) => {
						if (
							!ASTUtils.isAwaitExpression(declaration.init) ||
							!isCallExpression(declaration.init.argument)
						) {
							return false;
						}

						const { callee } = declaration.init.argument;
						const node = getDeepestIdentifierNode(callee);
						return node ? helpers.isFindQueryVariant(node) : false;
					});

					const init = ASTUtils.isAwaitExpression(findByDeclarator?.init)
						? findByDeclarator.init.argument
						: null;

					if (!isCallExpression(init)) {
						return;
					}
					const queryIdentifier = getDeepestIdentifierNode(init.callee);

					// ensure the query is a supported async query like findBy*
					if (!queryIdentifier || !helpers.isAsyncQuery(queryIdentifier)) {
						return;
					}

					const fullQueryMethod = queryIdentifier.name;
					const queryMethod = fullQueryMethod.split('By')[1];
					const queryVariant = getFindByQueryVariant(fullQueryMethod);

					if (!queryMethod) {
						// We shouldn't reach this point, but it's a safeguard for TS noUncheckedIndexedAccess
						throw Error('Query method could not be determined.');
					}

					reportInvalidUsage(node, {
						queryMethod,
						queryVariant,
						prevQuery: fullQueryMethod,
						fix(fixer) {
							const { parent: expressionStatement } = node.parent;
							const bodyText = sourceCode
								.getText(argument.body)
								.slice(1, -1)
								.trim();
							const { line, column } = expressionStatement.loc.start;
							const indent = sourceCode.getLines()[line - 1]?.slice(0, column);
							const newText = bodyText
								.split('\n')
								.map((line) => line.trim())
								.join(`\n${indent}`);
							return fixer.replaceText(expressionStatement, newText);
						},
					});
					return;
				}

				if (!isCallExpression(argumentBody)) {
					return;
				}

				// ensure here it's one of the sync methods that we are calling
				if (isScreenSyncQuery(argumentBody)) {
					const caller = getCaller(argumentBody);

					if (!caller) {
						return;
					}

					// shape of () => screen.getByText
					const fullQueryMethodNode = getWrongQueryName(argumentBody);

					if (!fullQueryMethodNode) {
						return;
					}

					const fullQueryMethod = fullQueryMethodNode.name;

					// if there is a second argument to AwaitExpression, it is the options
					const waitOptions = node.arguments[1];
					let waitOptionsSourceCode = '';
					if (isObjectExpression(waitOptions)) {
						waitOptionsSourceCode = `, ${sourceCode.getText(waitOptions)}`;
					}

					const queryVariant = getFindByQueryVariant(fullQueryMethod);
					const callArguments = getQueryArguments(argumentBody);
					const queryMethod = fullQueryMethod.split('By')[1];

					if (!queryMethod) {
						return;
					}
					reportInvalidUsage(node, {
						queryMethod,
						queryVariant,
						prevQuery: fullQueryMethod,
						fix(fixer) {
							if (hasCommentsOutsideExpression(argument, argumentBody)) {
								return null;
							}

							const findByCallText = `${caller}.${queryVariant}${queryMethod}(${callArguments
								.map((callArgNode) => sourceCode.getText(callArgNode))
								.join(', ')}${waitOptionsSourceCode})`;

							if (!isMemberExpression(argumentBody.callee)) return null;

							const { property, object } = argumentBody.callee;
							if (ASTUtils.isVariableDeclarator(node.parent.parent)) {
								if (isIdentifier(property) && helpers.isCustomQuery(property)) {
									return null;
								}
								return fixer.replaceText(node, findByCallText);
							}

							if (!isCallExpression(object)) return null;

							const originalExpect = sourceCode.getText(argumentBody);
							const awaited = `await ${findByCallText}`;
							const newExpect = originalExpect.replace(
								sourceCode.getText(object.arguments[0]),
								awaited
							);
							const output = originalExpect.replace(originalExpect, newExpect);

							return fixer.replaceText(node.parent, output);
						},
					});
					return;
				}

				if (!isSyncQuery(argumentBody)) {
					return;
				}

				// shape of () => getByText
				const fullQueryMethodNode = getWrongQueryName(argumentBody);

				if (!fullQueryMethodNode) {
					return;
				}

				const fullQueryMethod = fullQueryMethodNode.name;

				const queryMethod = fullQueryMethod.split('By')[1];
				const queryVariant = getFindByQueryVariant(fullQueryMethod);
				const callArguments = getQueryArguments(argumentBody);

				if (!queryMethod) {
					// We shouldn't reach this point, but it's a safeguard for TS noUncheckedIndexedAccess
					throw Error('Query method could not be determined.');
				}

				reportInvalidUsage(node, {
					queryMethod,
					queryVariant,
					prevQuery: fullQueryMethod,
					fix(fixer) {
						// we know from above callee is an Identifier
						if (
							helpers.isCustomQuery(
								argumentBody.callee as TSESTree.Identifier
							) ||
							hasCommentsOutsideExpression(argument, argumentBody)
						) {
							return null;
						}
						const findByMethod = `${queryVariant}${queryMethod}`;
						const allFixes: TSESLint.RuleFix[] = [];
						// this updates waitFor with findBy*
						const newCode = `${findByMethod}(${callArguments
							.map((callArgNode) => sourceCode.getText(callArgNode))
							.join(', ')})`;
						allFixes.push(fixer.replaceText(node, newCode));

						// this adds the findBy* declaration - adding it to the list of destructured variables { findBy* } = render()
						const definition = findRenderDefinitionDeclaration(
							getScope(context, fullQueryMethodNode),
							fullQueryMethod
						);
						// I think it should always find it, otherwise code should not be valid (it'd be using undeclared variables)
						if (!definition) {
							return allFixes;
						}
						// check the declaration is part of a destructuring
						if (
							definition.parent &&
							isObjectPattern(definition.parent.parent)
						) {
							const allVariableDeclarations = definition.parent.parent;
							// verify if the findBy* method was already declared
							if (
								allVariableDeclarations.properties.some(
									(p) =>
										isProperty(p) &&
										ASTUtils.isIdentifier(p.key) &&
										p.key.name === findByMethod
								)
							) {
								return allFixes;
							}
							// the last character of a destructuring is always a  "}", so we should replace it with the findBy* declaration
							const textDestructuring = sourceCode.getText(
								allVariableDeclarations
							);
							const text = textDestructuring.replace(
								/(\s*})$/,
								`, ${findByMethod}$1`
							);
							allFixes.push(fixer.replaceText(allVariableDeclarations, text));
						}

						return allFixes;
					},
				});
			},
		};
	},
});
