import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export const addAsyncToFunctionFix = (
	fixer: TSESLint.RuleFixer,
	ruleFix: TSESLint.RuleFix,
	functionExpression:
		| TSESTree.ArrowFunctionExpression
		| TSESTree.FunctionDeclaration
		| TSESTree.FunctionExpression
		| null,
	/**
	 * Node or token to place `async` before. Defaults to the function.
	 * Method function nodes start at `(`, so callers pass the method name,
	 * the `[` of a computed key, or the generator `*` token instead.
	 */
	nodeToInsertAsyncBefore?: TSESTree.Node | TSESTree.Token | null
) => {
	if (functionExpression && !functionExpression.async) {
		/**
		 * Mutate the actual node so if other nodes exist in this
		 * function expression body they don't also try to fix it.
		 */
		functionExpression.async = true;

		return [
			ruleFix,
			fixer.insertTextBefore(
				nodeToInsertAsyncBefore ?? functionExpression,
				'async '
			),
		];
	}
	return ruleFix;
};
