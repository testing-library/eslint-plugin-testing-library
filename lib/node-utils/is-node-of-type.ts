import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

export const isArrayExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ArrayExpression,
);
export const isArrowFunctionExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ArrowFunctionExpression,
);
export const isBlockStatement = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.BlockStatement,
);
export const isCallExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.CallExpression,
);
export const isExpressionStatement = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ExpressionStatement,
);
export const isVariableDeclaration = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.VariableDeclaration,
);
export const isAssignmentExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.AssignmentExpression,
);
export const isSequenceExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.SequenceExpression,
);
export const isImportDeclaration = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ImportDeclaration,
);
export const isImportDefaultSpecifier = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ImportDefaultSpecifier,
);
export const isImportNamespaceSpecifier = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ImportNamespaceSpecifier,
);
export const isImportSpecifier = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ImportSpecifier,
);
export const isJSXAttribute = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.JSXAttribute,
);
export const isLiteral = ASTUtils.isNodeOfType(AST_NODE_TYPES.Literal);
export const isMemberExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.MemberExpression,
);
export const isNewExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.NewExpression,
);
export const isObjectExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ObjectExpression,
);
export const isObjectPattern = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ObjectPattern,
);
export const isProperty = ASTUtils.isNodeOfType(AST_NODE_TYPES.Property);
export const isReturnStatement = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.ReturnStatement,
);
export const isFunctionExpression = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.FunctionExpression,
);
export const isFunctionDeclaration = ASTUtils.isNodeOfType(
	AST_NODE_TYPES.FunctionDeclaration,
);
