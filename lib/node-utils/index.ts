import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  TSESLintScope,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

import {
  isArrayExpression,
  isArrowFunctionExpression,
  isBlockStatement,
  isCallExpression,
  isExpressionStatement,
  isImportDeclaration,
  isImportNamespaceSpecifier,
  isImportSpecifier,
  isLiteral,
  isMemberExpression,
  isObjectPattern,
  isProperty,
  isReturnStatement,
  isVariableDeclaration,
} from './is-node-of-type';

export * from './is-node-of-type';

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
  AST_NODE_TYPES.ThisExpression,
  AST_NODE_TYPES.TSNullKeyword,
  AST_NODE_TYPES.TaggedTemplateExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
];

/**
 * Finds the closest CallExpression node for a given node.
 * @param node
 * @param shouldRestrictInnerScope - If true, CallExpression must belong to innermost scope of given node
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

  return findClosestCallExpressionNode(node.parent, shouldRestrictInnerScope);
}

export function findClosestVariableDeclaratorNode(
  node: TSESTree.Node | undefined
): TSESTree.VariableDeclarator | null {
  if (!node) {
    return null;
  }

  if (ASTUtils.isVariableDeclarator(node)) {
    return node;
  }

  return findClosestVariableDeclaratorNode(node.parent);
}

/**
 * TODO: remove this one in favor of {@link findClosestCallExpressionNode}
 */
export function findClosestCallNode(
  node: TSESTree.Node,
  name: string
): TSESTree.CallExpression | null {
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

export function hasThenProperty(node: TSESTree.Node): boolean {
  return (
    isMemberExpression(node) &&
    ASTUtils.isIdentifier(node.property) &&
    node.property.name === 'then'
  );
}

export function hasChainedThen(node: TSESTree.Node): boolean {
  const parent = node.parent;

  // wait(...).then(...)
  if (isCallExpression(parent) && parent.parent) {
    return hasThenProperty(parent.parent);
  }

  // promise.then(...)
  return !!parent && hasThenProperty(parent);
}

export function isPromiseIdentifier(
  node: TSESTree.Node
): node is TSESTree.Identifier & { name: 'Promise' } {
  return ASTUtils.isIdentifier(node) && node.name === 'Promise';
}

export function isPromiseAll(node: TSESTree.CallExpression): boolean {
  return (
    isMemberExpression(node.callee) &&
    isPromiseIdentifier(node.callee.object) &&
    ASTUtils.isIdentifier(node.callee.property) &&
    node.callee.property.name === 'all'
  );
}

export function isPromiseAllSettled(node: TSESTree.CallExpression): boolean {
  return (
    isMemberExpression(node.callee) &&
    isPromiseIdentifier(node.callee.object) &&
    ASTUtils.isIdentifier(node.callee.property) &&
    node.callee.property.name === 'allSettled'
  );
}

/**
 * Determines whether a given node belongs to handled Promise.all or Promise.allSettled
 * array expression.
 */
export function isPromisesArrayResolved(node: TSESTree.Node): boolean {
  const closestCallExpression = findClosestCallExpressionNode(node, true);

  if (!closestCallExpression) {
    return false;
  }

  return (
    !!closestCallExpression.parent &&
    isArrayExpression(closestCallExpression.parent) &&
    isCallExpression(closestCallExpression.parent.parent) &&
    (isPromiseAll(closestCallExpression.parent.parent) ||
      isPromiseAllSettled(closestCallExpression.parent.parent))
  );
}

/**
 * Determines whether an Identifier related to a promise is considered as handled.
 *
 * It will be considered as handled if:
 * - it belongs to the `await` expression
 * - it belongs to the `Promise.all` method
 * - it belongs to the `Promise.allSettled` method
 * - it's chained with the `then` method
 * - it's returned from a function
 * - has `resolves` or `rejects` jest methods
 */
export function isPromiseHandled(nodeIdentifier: TSESTree.Identifier): boolean {
  const closestCallExpressionNode = findClosestCallExpressionNode(
    nodeIdentifier,
    true
  );

  const suspiciousNodes = [nodeIdentifier, closestCallExpressionNode].filter(
    Boolean
  );

  for (const node of suspiciousNodes) {
    if (!node || !node.parent) {
      continue;
    }
    if (ASTUtils.isAwaitExpression(node.parent)) {
      return true;
    }

    if (
      isArrowFunctionExpression(node.parent) ||
      isReturnStatement(node.parent)
    ) {
      return true;
    }

    if (hasClosestExpectResolvesRejects(node.parent)) {
      return true;
    }

    if (hasChainedThen(node)) {
      return true;
    }

    if (isPromisesArrayResolved(node)) {
      return true;
    }
  }

  return false;
}

export function getVariableReferences(
  context: RuleContext<string, []>,
  node: TSESTree.Node
): TSESLint.Scope.Reference[] {
  return (
    (ASTUtils.isVariableDeclarator(node) &&
      context.getDeclaredVariables(node)[0]?.references?.slice(1)) ||
    []
  );
}

interface InnermostFunctionScope extends TSESLintScope.FunctionScope {
  block:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression;
}

export function getInnermostFunctionScope(
  context: RuleContext<string, unknown[]>,
  asyncQueryNode: TSESTree.Identifier
): InnermostFunctionScope | null {
  const innermostScope = ASTUtils.getInnermostScope(
    context.getScope(),
    asyncQueryNode
  );

  if (
    innermostScope?.type === 'function' &&
    ASTUtils.isFunction(innermostScope.block)
  ) {
    return (innermostScope as unknown) as InnermostFunctionScope;
  }

  return null;
}

export function getFunctionReturnStatementNode(
  functionNode:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): TSESTree.Node | null {
  if (isBlockStatement(functionNode.body)) {
    // regular function or arrow function with block
    const returnStatementNode = functionNode.body.body.find((statement) =>
      isReturnStatement(statement)
    ) as TSESTree.ReturnStatement | undefined;

    if (!returnStatementNode) {
      return null;
    }
    return returnStatementNode.argument;
  } else if (functionNode.expression) {
    // arrow function with implicit return
    return functionNode.body;
  }

  return null;
}

/**
 * Gets the property identifier node of a given property node.
 *
 * Not to be confused with {@link getDeepestIdentifierNode}
 *
 * An example:
 * Having `const a = rtl.within('foo').getByRole('button')`:
 *  if we call `getPropertyIdentifierNode` with `rtl` property node,
 *  it will return `rtl` identifier node
 */
export function getPropertyIdentifierNode(
  node: TSESTree.Node
): TSESTree.Identifier | null {
  if (ASTUtils.isIdentifier(node)) {
    return node;
  }

  if (isMemberExpression(node)) {
    return getPropertyIdentifierNode(node.object);
  }

  if (isCallExpression(node)) {
    return getPropertyIdentifierNode(node.callee);
  }

  if (isExpressionStatement(node)) {
    return getPropertyIdentifierNode(node.expression);
  }

  return null;
}

/**
 * Gets the deepest identifier node in the expression from a given node.
 *
 * Opposite of {@link getReferenceNode}
 *
 * An example:
 * Having `const a = rtl.within('foo').getByRole('button')`:
 *  if we call `getDeepestIdentifierNode` with `rtl` node,
 *  it will return `getByRole` identifier
 */
export function getDeepestIdentifierNode(
  node: TSESTree.Node
): TSESTree.Identifier | null {
  if (ASTUtils.isIdentifier(node)) {
    return node;
  }

  if (isMemberExpression(node) && ASTUtils.isIdentifier(node.property)) {
    return node.property;
  }

  if (isCallExpression(node)) {
    return getDeepestIdentifierNode(node.callee);
  }

  if (ASTUtils.isAwaitExpression(node)) {
    return getDeepestIdentifierNode(node.argument);
  }

  return null;
}

/**
 * Gets the farthest node in the expression from a given node.
 *
 * Opposite of {@link getDeepestIdentifierNode}

 * An example:
 * Having `const a = rtl.within('foo').getByRole('button')`:
 *  if we call `getReferenceNode` with `getByRole` identifier,
 *  it will return `rtl` node
 */
export function getReferenceNode(
  node:
    | TSESTree.CallExpression
    | TSESTree.MemberExpression
    | TSESTree.Identifier
): TSESTree.CallExpression | TSESTree.MemberExpression | TSESTree.Identifier {
  if (
    node.parent &&
    (isMemberExpression(node.parent) || isCallExpression(node.parent))
  ) {
    return getReferenceNode(node.parent);
  }

  return node;
}

export function getFunctionName(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): string {
  return (
    ASTUtils.getFunctionNameWithKind(node)
      .match(/('\w+')/g)?.[0]
      .replace(/'/g, '') ?? ''
  );
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
    matcher =
      node.parent && isMemberExpression(node.parent)
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
    node.parent &&
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

/**
 * Gets the Function node which returns the given Identifier.
 */
export function getInnermostReturningFunction(
  context: RuleContext<string, unknown[]>,
  node: TSESTree.Identifier
):
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression
  | undefined {
  const functionScope = getInnermostFunctionScope(context, node);

  if (!functionScope) {
    return;
  }

  const returnStatementNode = getFunctionReturnStatementNode(
    functionScope.block
  );

  if (!returnStatementNode) {
    return;
  }

  const returnStatementIdentifier = getDeepestIdentifierNode(
    returnStatementNode
  );

  if (returnStatementIdentifier?.name !== node.name) {
    return;
  }

  return functionScope.block;
}

export function hasImportMatch(
  importNode: TSESTree.ImportClause | TSESTree.Identifier,
  identifierName: string
): boolean {
  if (ASTUtils.isIdentifier(importNode)) {
    return importNode.name === identifierName;
  }

  return importNode.local.name === identifierName;
}

export function getStatementCallExpression(
  statement: TSESTree.Statement
): TSESTree.CallExpression | undefined {
  if (
    isExpressionStatement(statement) &&
    isCallExpression(statement.expression)
  ) {
    return statement.expression;
  }

  if (isReturnStatement(statement) && isCallExpression(statement.argument)) {
    return statement.argument;
  }

  if (isVariableDeclaration(statement)) {
    for (const declaration of statement.declarations) {
      if (isCallExpression(declaration.init)) {
        return declaration.init;
      }
    }
  }
  return undefined;
}

/**
 * Determines whether a given function node is considered as empty function or not.
 *
 * A function is considered empty if its body is empty.
 *
 * Note that comments don't affect the check.
 *
 * If node given is not a function, `false` will be returned.
 */
export function isEmptyFunction(node: TSESTree.Node): boolean | undefined {
  if (ASTUtils.isFunction(node) && isBlockStatement(node.body)) {
    return node.body.body.length === 0;
  }

  return false;
}

/**
 * Finds the import specifier matching a given name for a given import module node.
 */
export function findImportSpecifier(
  specifierName: string,
  node: ImportModuleNode
): TSESTree.ImportClause | TSESTree.Identifier | undefined {
  if (isImportDeclaration(node)) {
    const namedExport = node.specifiers.find((n) => {
      return (
        isImportSpecifier(n) &&
        [n.imported.name, n.local.name].includes(specifierName)
      );
    });

    // it is "import { foo [as alias] } from 'baz'"
    if (namedExport) {
      return namedExport;
    }

    // it could be "import * as rtl from 'baz'"
    return node.specifiers.find((n) => isImportNamespaceSpecifier(n));
  } else {
    if (!ASTUtils.isVariableDeclarator(node.parent)) {
      return undefined;
    }
    const requireNode = node.parent;

    if (ASTUtils.isIdentifier(requireNode.id)) {
      // this is const rtl = require('foo')
      return requireNode.id;
    }

    // this should be const { something } = require('foo')
    if (!isObjectPattern(requireNode.id)) {
      return undefined;
    }

    const property = requireNode.id.properties.find(
      (n) =>
        isProperty(n) &&
        ASTUtils.isIdentifier(n.key) &&
        n.key.name === specifierName
    );
    if (!property) {
      return undefined;
    }
    return (property as TSESTree.Property).key as TSESTree.Identifier;
  }
}
