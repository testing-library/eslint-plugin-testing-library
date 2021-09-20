import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const isNodeOfType =
  <NodeType extends AST_NODE_TYPES>(nodeType: NodeType) =>
  (
    node: TSESTree.Node | null | undefined
  ): node is TSESTree.Node & { type: NodeType } =>
    node?.type === nodeType;

export const isArrayExpression = isNodeOfType(AST_NODE_TYPES.ArrayExpression);
export const isArrowFunctionExpression = isNodeOfType(
  AST_NODE_TYPES.ArrowFunctionExpression
);
export const isBlockStatement = isNodeOfType(AST_NODE_TYPES.BlockStatement);
export const isCallExpression = isNodeOfType(AST_NODE_TYPES.CallExpression);
export const isExpressionStatement = isNodeOfType(
  AST_NODE_TYPES.ExpressionStatement
);
export const isVariableDeclaration = isNodeOfType(
  AST_NODE_TYPES.VariableDeclaration
);
export const isAssignmentExpression = isNodeOfType(
  AST_NODE_TYPES.AssignmentExpression
);
export const isSequenceExpression = isNodeOfType(
  AST_NODE_TYPES.SequenceExpression
);
export const isImportDeclaration = isNodeOfType(
  AST_NODE_TYPES.ImportDeclaration
);
export const isImportDefaultSpecifier = isNodeOfType(
  AST_NODE_TYPES.ImportDefaultSpecifier
);
export const isImportNamespaceSpecifier = isNodeOfType(
  AST_NODE_TYPES.ImportNamespaceSpecifier
);
export const isImportSpecifier = isNodeOfType(AST_NODE_TYPES.ImportSpecifier);
export const isJSXAttribute = isNodeOfType(AST_NODE_TYPES.JSXAttribute);
export const isLiteral = isNodeOfType(AST_NODE_TYPES.Literal);
export const isMemberExpression = isNodeOfType(AST_NODE_TYPES.MemberExpression);
export const isNewExpression = isNodeOfType(AST_NODE_TYPES.NewExpression);
export const isObjectExpression = isNodeOfType(AST_NODE_TYPES.ObjectExpression);
export const isObjectPattern = isNodeOfType(AST_NODE_TYPES.ObjectPattern);
export const isProperty = isNodeOfType(AST_NODE_TYPES.Property);
export const isReturnStatement = isNodeOfType(AST_NODE_TYPES.ReturnStatement);
export const isFunctionExpression = isNodeOfType(
  AST_NODE_TYPES.FunctionExpression
);
