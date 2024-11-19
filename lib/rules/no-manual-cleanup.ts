import { ASTUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getImportModuleName,
	getVariableReferences,
	ImportModuleNode,
	isImportDeclaration,
	isImportDefaultSpecifier,
	isImportSpecifier,
	isMemberExpression,
	isObjectPattern,
	isProperty,
} from '../node-utils';
import { getDeclaredVariables } from '../utils';

export const RULE_NAME = 'no-manual-cleanup';
export type MessageIds = 'noManualCleanup';
type Options = [];

const CLEANUP_LIBRARY_REGEXP =
	/(@testing-library\/(preact|react|svelte|vue))|@marko\/testing-library/;

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow the use of `cleanup`',
			recommendedConfig: {
				dom: false,
				angular: false,
				react: 'error',
				vue: 'error',
				marko: false,
			},
		},
		messages: {
			noManualCleanup:
				"`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		function reportImportReferences(references: TSESLint.Scope.Reference[]) {
			for (const reference of references) {
				const utilsUsage = reference.identifier.parent;

				if (
					utilsUsage &&
					isMemberExpression(utilsUsage) &&
					ASTUtils.isIdentifier(utilsUsage.property) &&
					utilsUsage.property.name === 'cleanup'
				) {
					context.report({
						node: utilsUsage.property,
						messageId: 'noManualCleanup',
					});
				}
			}
		}

		function reportCandidateModule(moduleNode: ImportModuleNode) {
			if (isImportDeclaration(moduleNode)) {
				// case: import utils from 'testing-library-module'
				if (isImportDefaultSpecifier(moduleNode.specifiers[0])) {
					const { references } = getDeclaredVariables(context, moduleNode)[0];

					reportImportReferences(references);
				}

				// case: import { cleanup } from 'testing-library-module'
				const cleanupSpecifier = moduleNode.specifiers.find(
					(specifier) =>
						isImportSpecifier(specifier) &&
						ASTUtils.isIdentifier(specifier.imported) &&
						specifier.imported.name === 'cleanup'
				);

				if (cleanupSpecifier) {
					context.report({
						node: cleanupSpecifier,
						messageId: 'noManualCleanup',
					});
				}
			} else {
				const declaratorNode = moduleNode.parent as TSESTree.VariableDeclarator;

				if (isObjectPattern(declaratorNode.id)) {
					// case: const { cleanup } = require('testing-library-module')
					const cleanupProperty = declaratorNode.id.properties.find(
						(property) =>
							isProperty(property) &&
							ASTUtils.isIdentifier(property.key) &&
							property.key.name === 'cleanup'
					);

					if (cleanupProperty) {
						context.report({
							node: cleanupProperty,
							messageId: 'noManualCleanup',
						});
					}
				} else {
					// case: const utils = require('testing-library-module')
					const references = getVariableReferences(context, declaratorNode);
					reportImportReferences(references);
				}
			}
		}

		return {
			'Program:exit'() {
				const customModuleImportNode = helpers.getCustomModuleImportNode();

				for (const testingLibraryImportNode of helpers.getAllTestingLibraryImportNodes()) {
					const testingLibraryImportName = getImportModuleName(
						testingLibraryImportNode
					);

					if (testingLibraryImportName?.match(CLEANUP_LIBRARY_REGEXP)) {
						reportCandidateModule(testingLibraryImportNode);
					}
				}

				if (customModuleImportNode) {
					reportCandidateModule(customModuleImportNode);
				}
			},
		};
	},
});
