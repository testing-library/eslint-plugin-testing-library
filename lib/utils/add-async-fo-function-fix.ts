import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export const addAsyncToFunctionFix = (
	fixer: TSESLint.RuleFixer,
	ruleFix: TSESLint.RuleFix,
	functionExpression:
		| TSESTree.ArrowFunctionExpression
		| TSESTree.FunctionDeclaration
		| TSESTree.FunctionExpression
		| null
) => {
	if (functionExpression && !functionExpression.async) {
		/**
		 * Mutate the actual node so if other nodes exist in this
		 * function expression body they don't also try to fix it.
		 */
		functionExpression.async = true;

		return [ruleFix, fixer.insertTextBefore(functionExpression, 'async ')];
	}
	return ruleFix;
};
