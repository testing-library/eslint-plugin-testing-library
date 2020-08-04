import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export function isCallExpression(
  node: TSESTree.Node
): node is TSESTree.CallExpression {
  return node && node.type === AST_NODE_TYPES.CallExpression;
}

export function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node && node.type === AST_NODE_TYPES.Identifier;
}

export function isMemberExpression(
  node: TSESTree.Node
): node is TSESTree.MemberExpression {
  return node && node.type === AST_NODE_TYPES.MemberExpression;
}

export function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node && node.type === AST_NODE_TYPES.Literal;
}

export function isImportSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportSpecifier {
  return node && node.type === AST_NODE_TYPES.ImportSpecifier;
}

export function isImportDefaultSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportDefaultSpecifier {
  return node && node.type === AST_NODE_TYPES.ImportDefaultSpecifier;
}

export function isBlockStatement(
  node: TSESTree.Node
): node is TSESTree.BlockStatement {
  return node && node.type === AST_NODE_TYPES.BlockStatement;
}

export function isVariableDeclarator(
  node: TSESTree.Node
): node is TSESTree.VariableDeclarator {
  return node && node.type === AST_NODE_TYPES.VariableDeclarator;
}

export function isObjectPattern(
  node: TSESTree.Node
): node is TSESTree.ObjectPattern {
  return node && node.type === AST_NODE_TYPES.ObjectPattern;
}

export function isProperty(node: TSESTree.Node): node is TSESTree.Property {
  return node && node.type === AST_NODE_TYPES.Property;
}

export function isJSXAttribute(
  node: TSESTree.Node
): node is TSESTree.JSXAttribute {
  return node && node.type === AST_NODE_TYPES.JSXAttribute;
}

export function findClosestCallExpressionNode(
  node: TSESTree.Node
): TSESTree.CallExpression {
  if (isCallExpression(node)) {
    return node;
  }

  return findClosestCallExpressionNode(node.parent);
}

export function findClosestCallNode(
  node: TSESTree.Node,
  name: string
): TSESTree.CallExpression {
  if (!node.parent) {
    return null;
  }

  if (
    isCallExpression(node) &&
    isIdentifier(node.callee) &&
    node.callee.name === name
  ) {
    return node;
  } else {
    return findClosestCallNode(node.parent, name);
  }
}

export function isObjectExpression(node: TSESTree.Expression): node is TSESTree.ObjectExpression {
  return node?.type === AST_NODE_TYPES.ObjectExpression
}

export function hasThenProperty(node: TSESTree.Node) {
  return (
    isMemberExpression(node) &&
    isIdentifier(node.property) &&
    node.property.name === 'then'
  );
}

export function isAwaitExpression(
  node: TSESTree.Node
): node is TSESTree.AwaitExpression {
  return node && node.type === AST_NODE_TYPES.AwaitExpression;
}

export function isArrowFunctionExpression(node: TSESTree.Node): node is TSESTree.ArrowFunctionExpression {
  return node && node.type === AST_NODE_TYPES.ArrowFunctionExpression
}

export function isReturnStatement(node: TSESTree.Node): node is TSESTree.ReturnStatement {
  return node && node.type === AST_NODE_TYPES.ReturnStatement
}

export function isAwaited(node: TSESTree.Node) {
  return isAwaitExpression(node) || isArrowFunctionExpression(node) || isReturnStatement(node)
}

export function isPromiseResolved(node: TSESTree.Node) {
  const parent = node.parent;

  // wait(...).then(...)
  if (isCallExpression(parent)) {
    return hasThenProperty(parent.parent);
  }

  // promise.then(...)
  return hasThenProperty(parent);
}

export function getVariableReferences(context: RuleContext<string, []>, node: TSESTree.Node) {
  return (isVariableDeclarator(node) && context.getDeclaredVariables(node)[0].references.slice(1)) || [];
}