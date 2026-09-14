import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallNode,
	isMemberExpression,
	isProperty,
} from '../node-utils';
import { getScope } from '../utils';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'prefer-presence-queries';
export type MessageIds = 'wrongAbsenceQuery' | 'wrongPresenceQuery';
export type Options = [
	{
		presence?: boolean;
		absence?: boolean;
	},
];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		docs: {
			description:
				'Ensure appropriate `get*`/`query*` queries are used with their respective matchers',
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
			wrongPresenceQuery:
				'Use `getBy*` queries rather than `queryBy*` for checking element is present',
			wrongAbsenceQuery:
				'Use `queryBy*` queries rather than `getBy*` for checking element is NOT present',
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					presence: {
						type: 'boolean',
					},
					absence: {
						type: 'boolean',
					},
				},
			},
		],
		type: 'suggestion',
	},
	defaultOptions: [
		{
			presence: true,
			absence: true,
		},
	],

	create(context, [{ absence = true, presence = true }], helpers) {
		function getDestructuredQueryIdentifier(
			node: TSESTree.Identifier
		): TSESTree.Identifier | 'unsafe' | null {
			const variable = ASTUtils.findVariable(
				getScope(context, node),
				node.name
			);
			const variableDefinition = variable?.defs[0];
			const identifier = variableDefinition?.name;

			if (!variable || !identifier || !ASTUtils.isIdentifier(identifier)) {
				return null;
			}

			const property = identifier.parent;

			if (
				!isProperty(property) ||
				!ASTUtils.isIdentifier(property.key) ||
				!ASTUtils.isIdentifier(property.value) ||
				property.key.name !== node.name ||
				property.value.name !== node.name
			) {
				return null;
			}

			const references = variable.references.filter(
				(reference) => reference.identifier !== identifier
			);

			return references.length === 1 ? identifier : 'unsafe';
		}

		function fixQueryName(
			fixer: TSESLint.RuleFixer,
			node: TSESTree.Identifier,
			newQueryName: string
		): TSESLint.RuleFix[] | null {
			const fixes = [fixer.replaceText(node, newQueryName)];
			const destructuredQueryIdentifier = getDestructuredQueryIdentifier(node);

			if (destructuredQueryIdentifier === 'unsafe') {
				return null;
			}

			if (destructuredQueryIdentifier) {
				fixes.push(
					fixer.replaceText(destructuredQueryIdentifier, newQueryName)
				);
			}

			return fixes;
		}

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				const expectCallNode = findClosestCallNode(node, 'expect');
				const withinCallNode = findClosestCallNode(node, 'within');

				if (!isMemberExpression(expectCallNode?.parent)) {
					return;
				}

				// Sync queries (getBy and queryBy) are corresponding ones used
				// to check presence or absence. If none found, stop the rule.
				if (!helpers.isSyncQuery(node)) {
					return;
				}

				const isPresenceQuery = helpers.isGetQueryVariant(node);
				const expectStatement = expectCallNode.parent;
				const isPresenceAssert = helpers.isPresenceAssert(expectStatement);
				const isAbsenceAssert = helpers.isAbsenceAssert(expectStatement);

				if (!isPresenceAssert && !isAbsenceAssert) {
					return;
				}

				if (
					presence &&
					(withinCallNode || isPresenceAssert) &&
					!isPresenceQuery
				) {
					const newQueryName = node.name.replace(/^query/, 'get');

					context.report({
						node,
						messageId: 'wrongPresenceQuery',
						fix: (fixer) => fixQueryName(fixer, node, newQueryName),
					});
				} else if (
					!withinCallNode &&
					absence &&
					isAbsenceAssert &&
					isPresenceQuery
				) {
					const newQueryName = node.name.replace(/^get/, 'query');
					context.report({
						node,
						messageId: 'wrongAbsenceQuery',
						fix: (fixer) => fixQueryName(fixer, node, newQueryName),
					});
				}
			},
		};
	},
});
