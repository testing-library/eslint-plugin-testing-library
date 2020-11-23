import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

const ValidLeftHandSideExpressions = [
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.ClassExpression,
  AST_NODE_TYPES.ClassDeclaration,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.ArrayExpression,
  AST_NODE_TYPES.ArrayPattern,
  AST_NODE_TYPES.ClassExpression,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.JSXElement,
  AST_NODE_TYPES.JSXFragment,
  AST_NODE_TYPES.JSXOpeningElement,
  AST_NODE_TYPES.MetaProperty,
  AST_NODE_TYPES.ObjectExpression,
  AST_NODE_TYPES.ObjectPattern,
  AST_NODE_TYPES.Super,
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.ThisExpression,
  AST_NODE_TYPES.TSNullKeyword,
  AST_NODE_TYPES.TaggedTemplateExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
];

export function isCallExpression(
  node: TSESTree.Node | null | undefined
): node is TSESTree.CallExpression {
  return node?.type === AST_NODE_TYPES.CallExpression;
}

export function isNewExpression(
  node: TSESTree.Node
): node is TSESTree.NewExpression {
  return node?.type === 'NewExpression';
}

export function isMemberExpression(
  node: TSESTree.Node
): node is TSESTree.MemberExpression {
  return node?.type === AST_NODE_TYPES.MemberExpression;
}

export function isLiteral(
  node: TSESTree.Node | null | undefined
): node is TSESTree.Literal {
  return node?.type === AST_NODE_TYPES.Literal;
}

export function isImportSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportSpecifier {
  return node?.type === AST_NODE_TYPES.ImportSpecifier;
}

export function isImportNamespaceSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportNamespaceSpecifier {
  return node?.type === AST_NODE_TYPES.ImportNamespaceSpecifier;
}

export function isImportDefaultSpecifier(
  node: TSESTree.Node
): node is TSESTree.ImportDefaultSpecifier {
  return node?.type === AST_NODE_TYPES.ImportDefaultSpecifier;
}

export function isBlockStatement(
  node: TSESTree.Node
): node is TSESTree.BlockStatement {
  return node?.type === AST_NODE_TYPES.BlockStatement;
}

export function isVariableDeclarator(
  node: TSESTree.Node
): node is TSESTree.VariableDeclarator {
  return node?.type === AST_NODE_TYPES.VariableDeclarator;
}

export function isObjectPattern(
  node: TSESTree.Node
): node is TSESTree.ObjectPattern {
  return node?.type === AST_NODE_TYPES.ObjectPattern;
}

export function isProperty(
  node: TSESTree.Node | null | undefined
): node is TSESTree.Property {
  return node?.type === AST_NODE_TYPES.Property;
}

export function isJSXAttribute(
  node: TSESTree.Node
): node is TSESTree.JSXAttribute {
  return node?.type === AST_NODE_TYPES.JSXAttribute;
}

/**
 * Finds the closest CallExpression node for a given node.
 * @param node
 * @param shouldRestrictInnerScope - If true, CallExpression must be directly related to node
 */
export function findClosestCallExpressionNode(
  node: TSESTree.Node,
  shouldRestrictInnerScope = false
): TSESTree.CallExpression | null {
  if (isCallExpression(node)) {
    return node;
  }

  if (!node || !node.parent) {
    return null;
  }

  if (
    shouldRestrictInnerScope &&
    !ValidLeftHandSideExpressions.includes(node.parent.type)
  ) {
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
    ASTUtils.isIdentifier(node.callee) &&
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
    ASTUtils.isIdentifier(node.property) &&
    node.property.name === 'then'
  );
}

export function isArrowFunctionExpression(
  node: TSESTree.Node
): node is TSESTree.ArrowFunctionExpression {
  return node?.type === AST_NODE_TYPES.ArrowFunctionExpression;
}

export function isReturnStatement(
  node: TSESTree.Node
): node is TSESTree.ReturnStatement {
  return node?.type === AST_NODE_TYPES.ReturnStatement;
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
    ASTUtils.isAwaitExpression(node) ||
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
      (ASTUtils.isIdentifier(callNode.callee) &&
        name === callNode.callee.name) ||
      (isMemberExpression(callNode.callee) &&
        ASTUtils.isIdentifier(callNode.callee.property) &&
        name === callNode.callee.property.name)
    );
  });
}

export function isRenderVariableDeclarator(
  node: TSESTree.VariableDeclarator,
  renderFunctions: string[]
): boolean {
  if (node.init) {
    if (ASTUtils.isAwaitExpression(node.init)) {
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
  const isNegated = matcher === 'not';
  if (isNegated) {
    matcher = isMemberExpression(node.parent)
      ? ASTUtils.getPropertyName(node.parent)
      : null;
  }

  if (!matcher) {
    return emptyInfo;
  }

  return { matcher, isNegated };
}

/**
 * Determines whether a node belongs to an async assertion
 * fulfilled by `resolves` or `rejects` properties.
 *
 */
export function hasClosestExpectResolvesRejects(node: TSESTree.Node): boolean {
  if (
    isCallExpression(node) &&
    ASTUtils.isIdentifier(node.callee) &&
    isMemberExpression(node.parent) &&
    node.callee.name === 'expect'
  ) {
    const expectMatcher = node.parent.property;
    return (
      ASTUtils.isIdentifier(expectMatcher) &&
      (expectMatcher.name === 'resolves' || expectMatcher.name === 'rejects')
    );
  }

  if (!node.parent) {
    return false;
  }

  return hasClosestExpectResolvesRejects(node.parent);
}
