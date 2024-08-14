import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';

declare module '@typescript-eslint/utils/dist/ts-eslint/Rule' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface RuleContext<TMessageIds extends string, TOptions extends readonly unknown[]> {
    /**
     * The filename associated with the source.
     */
    filename: string;

    /**
     * A SourceCode object that you can use to work with the source that
     * was passed to ESLint.
     */
    sourceCode: Readonly<TSESLint.SourceCode>;
  }
}

declare module '@typescript-eslint/utils/dist/ts-eslint/SourceCode' {
  export interface SourceCode {
    /**
     * Returns the scope of the given node.
     * This information can be used track references to variables.
     * @since 8.37.0
     */
    getScope(node: TSESTree.Node): TSESLint.Scope.Scope;
    /**
     * Returns an array of the ancestors of the given node, starting at
     * the root of the AST and continuing through the direct parent of the current node.
     * This array does not include the currently-traversed node itself.
     * @since 8.38.0
     */
    getAncestors(node: TSESTree.Node): TSESTree.Node[];
    /**
     * Returns a list of variables declared by the given node.
     * This information can be used to track references to variables.
     * @since 8.38.0
     */
    getDeclaredVariables(
      node: TSESTree.Node,
    ): readonly TSESLint.Scope.Variable[];
  }
}

/* istanbul ignore next */
export const getFilename = (
  context: TSESLint.RuleContext<string, unknown[]>,
) => {
  return context.filename ?? context.getFilename();
};

/* istanbul ignore next */
export const getSourceCode = (
  context: TSESLint.RuleContext<string, unknown[]>,
) => {
  return context.sourceCode ?? context.getSourceCode();
};

/* istanbul ignore next */
export const getScope = (
  context: TSESLint.RuleContext<string, unknown[]>,
  node: TSESTree.Node,
) => {
  return getSourceCode(context).getScope?.(node) ?? context.getScope();
};

/* istanbul ignore next */
export const getAncestors = (
  context: TSESLint.RuleContext<string, unknown[]>,
  node: TSESTree.Node,
) => {
  return getSourceCode(context).getAncestors?.(node) ?? context.getAncestors();
};

/* istanbul ignore next */
export const getDeclaredVariables = (
  context: TSESLint.RuleContext<string, unknown[]>,
  node: TSESTree.Node,
) => {
  return (
    getSourceCode(context).getDeclaredVariables?.(node) ??
    context.getDeclaredVariables(node)
  );
};
