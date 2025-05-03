import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isCallExpression, getImportModuleName } from '../node-utils';

export const RULE_NAME = 'no-dom-import';
export type MessageIds = 'noDomImport' | 'noDomImportFramework';
type Options = [string];

const DOM_TESTING_LIBRARY_MODULES = [
	'dom-testing-library',
	'@testing-library/dom',
];

const CORRECT_MODULE_NAME_BY_FRAMEWORK: Record<
	'angular' | 'marko' | (string & NonNullable<unknown>),
	string | undefined
> = {
	angular: '@testing-library/angular', // ATL is *always* called `@testing-library/angular`
	marko: '@marko/testing-library', // Marko TL is called `@marko/testing-library`
};
const getCorrectModuleName = (
	moduleName: string,
	framework: string
): string => {
	return (
		CORRECT_MODULE_NAME_BY_FRAMEWORK[framework] ??
		moduleName.replace('dom', framework)
	);
};

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow importing from DOM Testing Library',
			recommendedConfig: {
				dom: false,
				angular: ['error', 'angular'],
				react: ['error', 'react'],
				vue: ['error', 'vue'],
				svelte: ['error', 'svelte'],
				marko: ['error', 'marko'],
			},
		},
		messages: {
			noDomImport:
				'import from DOM Testing Library is restricted, import from corresponding Testing Library framework instead',
			noDomImportFramework:
				'import from DOM Testing Library is restricted, import from {{module}} instead',
		},
		fixable: 'code',
		schema: [{ type: 'string' }],
	},
	defaultOptions: [''],

	create(context, [framework], helpers) {
		function report(
			node: TSESTree.CallExpression | TSESTree.ImportDeclaration,
			moduleName: string
		) {
			if (!framework) {
				return context.report({
					node,
					messageId: 'noDomImport',
				});
			}

			const correctModuleName = getCorrectModuleName(moduleName, framework);
			context.report({
				data: { module: correctModuleName },
				fix(fixer) {
					if (isCallExpression(node)) {
						const name = node.arguments[0] as TSESTree.Literal;

						// Replace the module name with the raw module name as we can't predict which punctuation the user is going to use
						return fixer.replaceText(
							name,
							name.raw.replace(moduleName, correctModuleName)
						);
					} else {
						const name = node.source;
						return fixer.replaceText(
							name,
							name.raw.replace(moduleName, correctModuleName)
						);
					}
				},
				messageId: 'noDomImportFramework',
				node,
			});
		}

		return {
			'Program:exit'() {
				let importName: string | undefined;
				const allImportNodes = helpers.getAllTestingLibraryImportNodes();

				allImportNodes.forEach((importNode) => {
					importName = getImportModuleName(importNode);

					const domModuleName = DOM_TESTING_LIBRARY_MODULES.find(
						(module) => module === importName
					);

					if (!domModuleName) {
						return;
					}

					report(importNode, domModuleName);
				});
			},
		};
	},
});
