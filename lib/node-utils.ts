import { TSESTree } from '@typescript-eslint/experimental-utils';

export function isCallExpression(
  node: TSESTree.Node
): node is TSESTree.CallExpression {
  return node && node.type === 'CallExpression';
}

export function isAwaitExpression(
  node: TSESTree.Node
): node is TSESTree.AwaitExpression {
  return node && node.type === 'AwaitExpression';
}

export function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node && node.type === 'Identifier';
}

export function isMemberExpression(
  node: TSESTree.Node
): node is TSESTree.MemberExpression {
  return node && node.type === 'MemberExpression';
}

export function isLiteral(node: TSESTree.Node): node is TSESTree.Literal {
  return node && node.type === 'Literal';
}

export function isImportSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportSpecifier {
  return node && node.type === 'ImportSpecifier';
}

export function isImportDefaultSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportDefaultSpecifier {
  return node && node.type === 'ImportDefaultSpecifier';
}

export function isBlockStatement(
  node: TSESTree.Node
): node is TSESTree.BlockStatement {
  return node && node.type === 'BlockStatement';
}

export function isVariableDeclarator(
  node: TSESTree.Node
): node is TSESTree.VariableDeclarator {
  return node && node.type === 'VariableDeclarator';
}

export function isObjectPattern(
  node: TSESTree.Node
): node is TSESTree.ObjectPattern {
  return node && node.type === 'ObjectPattern';
}

export function isProperty(node: TSESTree.Node): node is TSESTree.Property {
  return node && node.type === 'Property';
}

export function isJSXAttribute(
  node: TSESTree.Node
): node is TSESTree.JSXAttribute {
  return node && node.type === 'JSXAttribute';
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

export function findClosestCalleName(
  node: TSESTree.Node
): string {
  if (!node.parent) {
    return '';
  }

  if (
    isCallExpression(node) &&
    isIdentifier(node.callee)
  ) {
    return node.callee.name;
  } else {
    return findClosestCalleName(node.parent);
  }
}

export function hasThenProperty(node: TSESTree.Node) {
  return (
    isMemberExpression(node) &&
    isIdentifier(node.property) &&
    node.property.name === 'then'
  );
}
