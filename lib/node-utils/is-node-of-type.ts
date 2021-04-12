import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const isNodeOfType = <NodeOfType extends TSESTree.Node>(
  nodeType: AST_NODE_TYPES
) => (node: TSESTree.Node | null | undefined): node is NodeOfType =>
  node?.type === nodeType;

export const isArrayExpression = isNodeOfType<TSESTree.ArrayExpression>(
  AST_NODE_TYPES.ArrayExpression
);

export const isArrowFunctionExpression = isNodeOfType<TSESTree.ArrowFunctionExpression>(
  AST_NODE_TYPES.ArrowFunctionExpression
);

export const isBlockStatement = isNodeOfType<TSESTree.BlockStatement>(
  AST_NODE_TYPES.BlockStatement
);

export const isCallExpression = isNodeOfType<TSESTree.CallExpression>(
  AST_NODE_TYPES.CallExpression
);

export const isExpressionStatement = isNodeOfType<TSESTree.ExpressionStatement>(
  AST_NODE_TYPES.ExpressionStatement
);

export const isImportDeclaration = isNodeOfType<TSESTree.ImportDeclaration>(
  AST_NODE_TYPES.ImportDeclaration
);

export const isImportDefaultSpecifier = isNodeOfType<TSESTree.ImportDefaultSpecifier>(
  AST_NODE_TYPES.ImportDefaultSpecifier
);

export const isImportNamespaceSpecifier = isNodeOfType<TSESTree.ImportNamespaceSpecifier>(
  AST_NODE_TYPES.ImportNamespaceSpecifier
);

export const isImportSpecifier = isNodeOfType<TSESTree.ImportSpecifier>(
  AST_NODE_TYPES.ImportSpecifier
);

export const isJSXAttribute = isNodeOfType<TSESTree.JSXAttribute>(
  AST_NODE_TYPES.JSXAttribute
);

export const isLiteral = isNodeOfType<TSESTree.Literal>(AST_NODE_TYPES.Literal);

export const isMemberExpression = isNodeOfType<TSESTree.MemberExpression>(
  AST_NODE_TYPES.MemberExpression
);

export const isNewExpression = isNodeOfType<TSESTree.NewExpression>(
  AST_NODE_TYPES.NewExpression
);

export const isObjectExpression = isNodeOfType<TSESTree.ObjectExpression>(
  AST_NODE_TYPES.ObjectExpression
);

export const isObjectPattern = isNodeOfType<TSESTree.ObjectPattern>(
  AST_NODE_TYPES.ObjectPattern
);

export const isProperty = isNodeOfType<TSESTree.Property>(
  AST_NODE_TYPES.Property
);

export const isReturnStatement = isNodeOfType<TSESTree.ReturnStatement>(
  AST_NODE_TYPES.ReturnStatement
);
