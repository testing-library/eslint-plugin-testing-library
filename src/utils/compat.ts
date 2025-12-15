import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

/* istanbul ignore next */
export const getFilename = (
	context: TSESLint.RuleContext<string, unknown[]>
) => {
	return context.filename ?? context.getFilename();
};

/* istanbul ignore next */
export const getSourceCode = (
	context: TSESLint.RuleContext<string, unknown[]>
) => {
	return context.sourceCode ?? context.getSourceCode();
};

/* istanbul ignore next */
export const getScope = (
	context: TSESLint.RuleContext<string, unknown[]>,
	node: TSESTree.Node
) => {
	return getSourceCode(context).getScope?.(node) ?? context.getScope();
};

/* istanbul ignore next */
export const getDeclaredVariables = (
	context: TSESLint.RuleContext<string, unknown[]>,
	node: TSESTree.Node
) => {
	return (
		getSourceCode(context).getDeclaredVariables?.(node) ??
		context.getDeclaredVariables(node)
	);
};
