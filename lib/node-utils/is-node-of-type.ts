import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import type { TSESTree } from '@typescript-eslint/utils';

// Explicit type for all node-type guards to avoid leaking non-portable inferred types
type NodeGuard<T extends TSESTree.Node> = (
	node: TSESTree.Node | null | undefined
) => node is T;

export const isArrayExpression: NodeGuard<TSESTree.ArrayExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ArrayExpression);

export const isArrowFunctionExpression: NodeGuard<TSESTree.ArrowFunctionExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ArrowFunctionExpression);

export const isBlockStatement: NodeGuard<TSESTree.BlockStatement> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.BlockStatement);

export const isCallExpression: NodeGuard<TSESTree.CallExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.CallExpression);

export const isExpressionStatement: NodeGuard<TSESTree.ExpressionStatement> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ExpressionStatement);

export const isVariableDeclaration: NodeGuard<TSESTree.VariableDeclaration> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.VariableDeclaration);

export const isAssignmentExpression: NodeGuard<TSESTree.AssignmentExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.AssignmentExpression);

export const isChainExpression: NodeGuard<TSESTree.ChainExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ChainExpression);

export const isSequenceExpression: NodeGuard<TSESTree.SequenceExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.SequenceExpression);

export const isImportDeclaration: NodeGuard<TSESTree.ImportDeclaration> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportDeclaration);

export const isImportDefaultSpecifier: NodeGuard<TSESTree.ImportDefaultSpecifier> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportDefaultSpecifier);

export const isTSImportEqualsDeclaration: NodeGuard<TSESTree.TSImportEqualsDeclaration> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.TSImportEqualsDeclaration);

export const isImportExpression: NodeGuard<TSESTree.ImportExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportExpression);

export const isImportNamespaceSpecifier: NodeGuard<TSESTree.ImportNamespaceSpecifier> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportNamespaceSpecifier);

export const isImportSpecifier: NodeGuard<TSESTree.ImportSpecifier> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportSpecifier);

export const isJSXAttribute: NodeGuard<TSESTree.JSXAttribute> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.JSXAttribute);

export const isLiteral: NodeGuard<TSESTree.Literal> = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.Literal
);
export const isTemplateLiteral: NodeGuard<TSESTree.TemplateLiteral> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.TemplateLiteral);

export const isMemberExpression: NodeGuard<TSESTree.MemberExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.MemberExpression);

export const isNewExpression: NodeGuard<TSESTree.NewExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.NewExpression);

export const isObjectExpression: NodeGuard<TSESTree.ObjectExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ObjectExpression);

export const isObjectPattern: NodeGuard<TSESTree.ObjectPattern> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ObjectPattern);

export const isProperty: NodeGuard<TSESTree.Property> = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.Property
);

export const isReturnStatement: NodeGuard<TSESTree.ReturnStatement> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.ReturnStatement);

export const isFunctionExpression: NodeGuard<TSESTree.FunctionExpression> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.FunctionExpression);

export const isFunctionDeclaration: NodeGuard<TSESTree.FunctionDeclaration> =
	ASTUtils.isNodeOfType(AST_NODE_TYPES.FunctionDeclaration);
