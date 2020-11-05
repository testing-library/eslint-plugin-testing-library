import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export function isCallExpression(
  node: TSESTree.Node | null | undefined
): node is TSESTree.CallExpression {
  return node?.type === AST_NODE_TYPES.CallExpression;
}

export function isNewExpression(
  node: TSESTree.Node
): node is TSESTree.NewExpression {
  return node && node.type === 'NewExpression';
}

// TODO: remove this one and use ASTUtils one instead
export function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node && node.type === AST_NODE_TYPES.Identifier;
}

export function isMemberExpression(
  node: TSESTree.Node
): node is TSESTree.MemberExpression {
  return node && node.type === AST_NODE_TYPES.MemberExpression;
}

export function isLiteral(
  node: TSESTree.Node | null | undefined
): node is TSESTree.Literal {
  return node?.type === AST_NODE_TYPES.Literal;
}

export function isImportSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportSpecifier {
  return node && node.type === AST_NODE_TYPES.ImportSpecifier;
}

export function isImportNamespaceSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportNamespaceSpecifier {
  return node?.type === AST_NODE_TYPES.ImportNamespaceSpecifier;
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

export function isProperty(
  node: TSESTree.Node | null | undefined
): node is TSESTree.Property {
  return node?.type === AST_NODE_TYPES.Property;
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

  if (!node.parent) {
    return null;
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

export function isObjectExpression(
  node: TSESTree.Expression
): node is TSESTree.ObjectExpression {
  return node?.type === AST_NODE_TYPES.ObjectExpression;
}

export function hasThenProperty(node: TSESTree.Node): boolean {
  return (
    isMemberExpression(node) &&
    isIdentifier(node.property) &&
    node.property.name === 'then'
  );
}

// TODO: remove this one and use ASTUtils one instead
export function isAwaitExpression(
  node: TSESTree.Node
): node is TSESTree.AwaitExpression {
  return node && node.type === AST_NODE_TYPES.AwaitExpression;
}

export function isArrowFunctionExpression(
  node: TSESTree.Node
): node is TSESTree.ArrowFunctionExpression {
  return node && node.type === AST_NODE_TYPES.ArrowFunctionExpression;
}

export function isReturnStatement(
  node: TSESTree.Node
): node is TSESTree.ReturnStatement {
  return node && node.type === AST_NODE_TYPES.ReturnStatement;
}

export function isArrayExpression(
  node: TSESTree.Node
): node is TSESTree.ArrayExpression {
  return node?.type === AST_NODE_TYPES.ArrayExpression;
}

export function isImportDeclaration(
  node: TSESTree.Node | null | undefined
): node is TSESTree.ImportDeclaration {
  return node?.type === AST_NODE_TYPES.ImportDeclaration;
}

export function isAwaited(node: TSESTree.Node): boolean {
  return (
    isAwaitExpression(node) ||
    isArrowFunctionExpression(node) ||
    isReturnStatement(node)
  );
}

export function isPromiseResolved(node: TSESTree.Node): boolean {
  const parent = node.parent;

  // wait(...).then(...)
  if (isCallExpression(parent)) {
    return hasThenProperty(parent.parent);
  }

  // promise.then(...)
  return hasThenProperty(parent);
}

export function getVariableReferences(
  context: RuleContext<string, []>,
  node: TSESTree.Node
): TSESLint.Scope.Reference[] {
  return (
    (isVariableDeclarator(node) &&
      context.getDeclaredVariables(node)[0]?.references?.slice(1)) ||
    []
  );
}

export function isRenderFunction(
  callNode: TSESTree.CallExpression,
  renderFunctions: string[]
): boolean {
  // returns true for `render` and e.g. `customRenderFn`
  // as well as `someLib.render` and `someUtils.customRenderFn`
  return renderFunctions.some((name) => {
    return (
      (isIdentifier(callNode.callee) && name === callNode.callee.name) ||
      (isMemberExpression(callNode.callee) &&
        isIdentifier(callNode.callee.property) &&
        name === callNode.callee.property.name)
    );
  });
}

export function isRenderVariableDeclarator(
  node: TSESTree.VariableDeclarator,
  renderFunctions: string[]
): boolean {
  if (node.init) {
    if (isAwaitExpression(node.init)) {
      return (
        node.init.argument &&
        isRenderFunction(
          node.init.argument as TSESTree.CallExpression,
          renderFunctions
        )
      );
    } else {
      return (
        isCallExpression(node.init) &&
        isRenderFunction(node.init, renderFunctions)
      );
    }
  }

  return false;
}

// TODO: extract into types file?
export type ImportModuleNode =
  | TSESTree.ImportDeclaration
  | TSESTree.CallExpression;

export function getImportModuleName(
  node: ImportModuleNode | undefined | null
): string | undefined {
  // import node of shape: import { foo } from 'bar'
  if (isImportDeclaration(node) && typeof node.source.value === 'string') {
    return node.source.value;
  }

  // import node of shape: const { foo } = require('bar')
  if (
    isCallExpression(node) &&
    isLiteral(node.arguments[0]) &&
    typeof node.arguments[0].value === 'string'
  ) {
    return node.arguments[0].value;
  }
}

type AssertNodeInfo = {
  matcher: string | null;
  isNegated: boolean;
};
/**
 * Extracts matcher info from MemberExpression node representing an assert.
 */
export function getAssertNodeInfo(
  node: TSESTree.MemberExpression
): AssertNodeInfo {
  const emptyInfo = { matcher: null, isNegated: false } as AssertNodeInfo;

  if (
    !isCallExpression(node.object) ||
    !ASTUtils.isIdentifier(node.object.callee)
  ) {
    return emptyInfo;
  }

  if (node.object.callee.name !== 'expect') {
    return emptyInfo;
  }

  let matcher = ASTUtils.getPropertyName(node);
  let isNegated = false;
  if (matcher === 'not') {
    matcher = isMemberExpression(node.parent)
      ? ASTUtils.getPropertyName(node.parent)
      : null;
    isNegated = true;
  }

  if (!matcher) {
    return emptyInfo;
  }

  return { matcher, isNegated };
}
