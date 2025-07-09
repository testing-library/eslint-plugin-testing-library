import { DefinitionType } from '@typescript-eslint/scope-manager';
import {
	AST_NODE_TYPES,
	ASTUtils,
	TSESLint,
	TSESTree,
} from '@typescript-eslint/utils';

import { TestingLibraryContext } from '../create-testing-library-rule/detect-testing-library-utils';
import {
	isImportDefaultSpecifier,
	isImportExpression,
	isProperty,
	isImportSpecifier,
	isTSImportEqualsDeclaration,
	isCallExpression,
} from '../node-utils';
import {
	AccessorNode,
	getAccessorValue,
	getStringValue,
	isIdentifier,
	isStringNode,
	isSupportedAccessor,
} from '../node-utils/accessors';

import { LIBRARY_MODULES, USER_EVENT_MODULE } from '.';

interface ImportDetails {
	source: string;
	local: string;
	imported: string | null;
}

const describeImportDefAsImport = (
	def: TSESLint.Scope.Definitions.ImportBindingDefinition
): ImportDetails | null => {
	if (isTSImportEqualsDeclaration(def.parent)) {
		return null;
	}

	if (isImportDefaultSpecifier(def.node)) {
		return {
			source: def.parent.source.value,
			imported: null,
			local: def.node.local.name,
		};
	}

	if (!isImportSpecifier(def.node)) {
		return null;
	}

	// we only care about value imports
	if (def.parent.importKind === 'type') {
		return null;
	}

	return {
		source: def.parent.source.value,
		imported:
			'name' in def.node.imported
				? def.node.imported.name
				: def.node.imported.value,
		local: def.node.local.name,
	};
};

const describeVariableDefAsImport = (
	def: TSESLint.Scope.Definitions.VariableDefinition
): ImportDetails | null => {
	if (!def.node.init) return null;

	const sourceNode =
		isCallExpression(def.node.init) &&
		isIdentifier(def.node.init.callee, 'require')
			? def.node.init.arguments[0]
			: ASTUtils.isAwaitExpression(def.node.init) &&
				  isImportExpression(def.node.init.argument)
				? def.node.init.argument.source
				: null;

	if (!sourceNode || !isStringNode(sourceNode)) return null;
	if (!isProperty(def.name.parent)) return null;
	if (!isSupportedAccessor(def.name.parent.key)) return null;

	return {
		source: getStringValue(sourceNode),
		imported: getAccessorValue(def.name.parent.key),
		local: def.name.name,
	};
};

const describePossibleImportDef = (
	def: TSESLint.Scope.Definition
): ImportDetails | null => {
	if (def.type === DefinitionType.Variable) {
		return describeVariableDefAsImport(def);
	}
	if (def.type === DefinitionType.ImportBinding) {
		return describeImportDefAsImport(def);
	}
	return null;
};

const resolveScope = (
	scope: TSESLint.Scope.Scope,
	identifier: string
): ImportDetails | 'local' | null => {
	let currentScope: TSESLint.Scope.Scope | null = scope;
	while (currentScope !== null) {
		const ref = currentScope.set.get(identifier);
		if (ref && ref.defs.length > 0) {
			const def = ref.defs[ref.defs.length - 1];
			const importDetails = describePossibleImportDef(def);

			if (importDetails?.local === identifier) {
				return importDetails;
			}

			return 'local';
		}

		currentScope = currentScope.upper;
	}

	return null;
};

const joinChains = (
	a: AccessorNode[] | null,
	b: AccessorNode[] | null
): AccessorNode[] | null => (a && b ? [...a, ...b] : null);

export const getNodeChain = (node: TSESTree.Node): AccessorNode[] | null => {
	if (isSupportedAccessor(node)) {
		return [node];
	}

	switch (node.type) {
		case AST_NODE_TYPES.MemberExpression:
			return joinChains(getNodeChain(node.object), getNodeChain(node.property));
		case AST_NODE_TYPES.CallExpression:
			return getNodeChain(node.callee);
	}

	return null;
};

interface ResolvedTestingLibraryUserEventFn {
	original: string | null;
	local: string;
}

export const resolveToTestingLibraryFn = <
	TMessageIds extends string,
	TOptions extends readonly unknown[],
>(
	node: TSESTree.CallExpression,
	context: TestingLibraryContext<TMessageIds, TOptions>
): ResolvedTestingLibraryUserEventFn | null => {
	const chain = getNodeChain(node);
	if (!chain?.length) return null;

	const identifier = chain[0];
	const scope = context.sourceCode.getScope(identifier);
	const maybeImport = resolveScope(scope, getAccessorValue(identifier));

	if (maybeImport === 'local' || maybeImport === null) {
		return null;
	}

	const customModuleSetting = context.settings['testing-library/utils-module'];
	if (
		[...LIBRARY_MODULES, USER_EVENT_MODULE, customModuleSetting].some(
			(module) => module === maybeImport.source
		)
	) {
		return {
			original: maybeImport.imported,
			local: maybeImport.local,
		};
	}

	return null;
};
