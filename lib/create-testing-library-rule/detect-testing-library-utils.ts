import { ASTUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
	findClosestVariableDeclaratorNode,
	findImportSpecifier,
	getAssertNodeInfo,
	getDeepestIdentifierNode,
	getImportModuleName,
	getPropertyIdentifierNode,
	getReferenceNode,
	hasImportMatch,
	ImportModuleNode,
	isCallExpression,
	isImportDeclaration,
	isImportDefaultSpecifier,
	isImportSpecifier,
	isLiteral,
	isMemberExpression,
} from '../node-utils';
import {
	ABSENCE_MATCHERS,
	ALL_QUERIES_COMBINATIONS,
	ASYNC_UTILS,
	DEBUG_UTILS,
	PRESENCE_MATCHERS,
} from '../utils';

const SETTING_OPTION_OFF = 'off';

export type TestingLibrarySettings = {
	'testing-library/utils-module'?:
		| typeof SETTING_OPTION_OFF
		| (string & NonNullable<unknown>);
	'testing-library/custom-renders'?: string[] | typeof SETTING_OPTION_OFF;
	'testing-library/custom-queries'?: string[] | typeof SETTING_OPTION_OFF;
};

export type TestingLibraryContext<
	TMessageIds extends string,
	TOptions extends readonly unknown[],
> = Readonly<
	TSESLint.RuleContext<TMessageIds, TOptions> & {
		settings: TestingLibrarySettings;
	}
>;

export type EnhancedRuleCreate<
	TMessageIds extends string,
	TOptions extends readonly unknown[],
> = (
	context: TestingLibraryContext<TMessageIds, TOptions>,
	optionsWithDefault: Readonly<TOptions>,
	detectionHelpers: Readonly<DetectionHelpers>
) => TSESLint.RuleListener;

// Helpers methods
type GetTestingLibraryImportNodeFn = () => ImportModuleNode | null;
type GetTestingLibraryImportNodesFn = () => ImportModuleNode[];
type GetCustomModuleImportNodeFn = () => ImportModuleNode | null;
type GetTestingLibraryImportNameFn = () => string | undefined;
type GetCustomModuleImportNameFn = () => string | undefined;
type IsTestingLibraryImportedFn = (isStrict?: boolean) => boolean;
type IsGetQueryVariantFn = (node: TSESTree.Identifier) => boolean;
type IsQueryQueryVariantFn = (node: TSESTree.Identifier) => boolean;
type IsFindQueryVariantFn = (node: TSESTree.Identifier) => boolean;
type IsSyncQueryFn = (node: TSESTree.Identifier) => boolean;
type IsAsyncQueryFn = (node: TSESTree.Identifier) => boolean;
type IsQueryFn = (node: TSESTree.Identifier) => boolean;
type IsCustomQueryFn = (node: TSESTree.Identifier) => boolean;
type IsBuiltInQueryFn = (node: TSESTree.Identifier) => boolean;
type IsAsyncUtilFn = (
	node: TSESTree.Identifier,
	validNames?: readonly (typeof ASYNC_UTILS)[number][]
) => boolean;
type IsFireEventMethodFn = (node: TSESTree.Identifier) => boolean;
type IsUserEventMethodFn = (node: TSESTree.Identifier) => boolean;
type IsRenderUtilFn = (node: TSESTree.Identifier) => boolean;
type IsCreateEventUtil = (
	node: TSESTree.CallExpression | TSESTree.Identifier
) => boolean;
type IsRenderVariableDeclaratorFn = (
	node: TSESTree.VariableDeclarator
) => boolean;
type IsDebugUtilFn = (
	identifierNode: TSESTree.Identifier,
	validNames?: ReadonlyArray<(typeof DEBUG_UTILS)[number]>
) => boolean;
type IsPresenceAssertFn = (node: TSESTree.MemberExpression) => boolean;
type IsMatchingAssertFn = (
	node: TSESTree.MemberExpression,
	matcherName: string
) => boolean;
type IsAbsenceAssertFn = (node: TSESTree.MemberExpression) => boolean;
type CanReportErrorsFn = () => boolean;
type FindImportedTestingLibraryUtilSpecifierFn = (
	specifierName: string
) => TSESTree.Identifier | TSESTree.ImportClause | undefined;
type IsNodeComingFromTestingLibraryFn = (
	node: TSESTree.Identifier | TSESTree.MemberExpression
) => boolean;

export interface DetectionHelpers {
	getTestingLibraryImportNode: GetTestingLibraryImportNodeFn;
	getAllTestingLibraryImportNodes: GetTestingLibraryImportNodesFn;
	getCustomModuleImportNode: GetCustomModuleImportNodeFn;
	getTestingLibraryImportName: GetTestingLibraryImportNameFn;
	getCustomModuleImportName: GetCustomModuleImportNameFn;
	isTestingLibraryImported: IsTestingLibraryImportedFn;
	isTestingLibraryUtil: (node: TSESTree.Identifier) => boolean;
	isGetQueryVariant: IsGetQueryVariantFn;
	isQueryQueryVariant: IsQueryQueryVariantFn;
	isFindQueryVariant: IsFindQueryVariantFn;
	isSyncQuery: IsSyncQueryFn;
	isAsyncQuery: IsAsyncQueryFn;
	isQuery: IsQueryFn;
	isCustomQuery: IsCustomQueryFn;
	isBuiltInQuery: IsBuiltInQueryFn;
	isAsyncUtil: IsAsyncUtilFn;
	isFireEventUtil: (node: TSESTree.Identifier) => boolean;
	isUserEventUtil: (node: TSESTree.Identifier) => boolean;
	isFireEventMethod: IsFireEventMethodFn;
	isUserEventMethod: IsUserEventMethodFn;
	isRenderUtil: IsRenderUtilFn;
	isCreateEventUtil: IsCreateEventUtil;
	isRenderVariableDeclarator: IsRenderVariableDeclaratorFn;
	isDebugUtil: IsDebugUtilFn;
	isActUtil: (node: TSESTree.Identifier) => boolean;
	isPresenceAssert: IsPresenceAssertFn;
	isAbsenceAssert: IsAbsenceAssertFn;
	isMatchingAssert: IsMatchingAssertFn;
	canReportErrors: CanReportErrorsFn;
	findImportedTestingLibraryUtilSpecifier: FindImportedTestingLibraryUtilSpecifierFn;
	isNodeComingFromTestingLibrary: IsNodeComingFromTestingLibraryFn;
}

const USER_EVENT_PACKAGE = '@testing-library/user-event';
const REACT_DOM_TEST_UTILS_PACKAGE = 'react-dom/test-utils';
const FIRE_EVENT_NAME = 'fireEvent';
const CREATE_EVENT_NAME = 'createEvent';
const USER_EVENT_NAME = 'userEvent';
const RENDER_NAME = 'render';

export type DetectionOptions = {
	/**
	 * If true, force `detectTestingLibraryUtils` to skip `canReportErrors`
	 * so it doesn't opt-out rule listener.
	 *
	 * Useful when some rule apply to files other than testing ones
	 * (e.g. `consistent-data-testid`)
	 */
	skipRuleReportingCheck: boolean;
};

/**
 * Enhances a given rule `create` with helpers to detect Testing Library utils.
 */
export function detectTestingLibraryUtils<
	TMessageIds extends string,
	TOptions extends readonly unknown[],
>(
	ruleCreate: EnhancedRuleCreate<TMessageIds, TOptions>,
	{ skipRuleReportingCheck = false }: Partial<DetectionOptions> = {}
) {
	return (
		context: TestingLibraryContext<TMessageIds, TOptions>,
		optionsWithDefault: Readonly<TOptions>
	): TSESLint.RuleListener => {
		const importedTestingLibraryNodes: ImportModuleNode[] = [];
		let importedCustomModuleNode: ImportModuleNode | null = null;
		let importedUserEventLibraryNode: ImportModuleNode | null = null;
		let importedReactDomTestUtilsNode: ImportModuleNode | null = null;

		// Init options based on shared ESLint settings
		const customModuleSetting =
			context.settings['testing-library/utils-module'];
		const customRendersSetting =
			context.settings['testing-library/custom-renders'];
		const customQueriesSetting =
			context.settings['testing-library/custom-queries'];

		/**
		 * Small method to extract common checks to determine whether a node is
		 * related to Testing Library or not.
		 *
		 * To determine whether a node is a valid Testing Library util, there are
		 * two conditions to match:
		 * - it's named in a particular way (decided by given callback)
		 * - it's imported from valid Testing Library module (depends on aggressive
		 *    reporting)
		 */
		function isPotentialTestingLibraryFunction(
			node: TSESTree.Identifier | null | undefined,
			isPotentialFunctionCallback: (
				identifierNodeName: string,
				originalNodeName?: string
			) => boolean
		): boolean {
			if (!node) {
				return false;
			}

			const referenceNode = getReferenceNode(node);
			const referenceNodeIdentifier = getPropertyIdentifierNode(referenceNode);

			if (!referenceNodeIdentifier) {
				return false;
			}

			const importedUtilSpecifier = getTestingLibraryImportedUtilSpecifier(
				referenceNodeIdentifier
			);

			const originalNodeName =
				isImportSpecifier(importedUtilSpecifier) &&
				ASTUtils.isIdentifier(importedUtilSpecifier.imported) &&
				importedUtilSpecifier.local.name !== importedUtilSpecifier.imported.name
					? importedUtilSpecifier.imported.name
					: undefined;

			if (!isPotentialFunctionCallback(node.name, originalNodeName)) {
				return false;
			}

			if (isAggressiveModuleReportingEnabled()) {
				return true;
			}

			return isNodeComingFromTestingLibrary(referenceNodeIdentifier);
		}

		/**
		 * Determines whether aggressive module reporting is enabled or not.
		 *
		 * This aggressive reporting mechanism is considered as enabled when custom
		 * module is not set, so we need to assume everything matching Testing
		 * Library utils is related to Testing Library no matter from where module
		 * they are coming from. Otherwise, this aggressive reporting mechanism is
		 * opted-out in favour to report only those utils coming from Testing
		 * Library package or custom module set up on settings.
		 */
		const isAggressiveModuleReportingEnabled = () => !customModuleSetting;

		/**
		 * Determines whether aggressive render reporting is enabled or not.
		 *
		 * This aggressive reporting mechanism is considered as enabled when custom
		 * renders are not set, so we need to assume every method containing
		 * "render" is a valid Testing Library `render`. Otherwise, this aggressive
		 * reporting mechanism is opted-out in favour to report only `render` or
		 * names set up on custom renders setting.
		 */
		const isAggressiveRenderReportingEnabled = (): boolean => {
			const isSwitchedOff = customRendersSetting === SETTING_OPTION_OFF;
			const hasCustomOptions =
				Array.isArray(customRendersSetting) && customRendersSetting.length > 0;

			return !isSwitchedOff && !hasCustomOptions;
		};

		/**
		 * Determines whether Aggressive Reporting for queries is enabled or not.
		 *
		 * This Aggressive Reporting mechanism is considered as enabled when custom-queries setting is not set,
		 * so the plugin needs to report both built-in and custom queries.
		 * Otherwise, this Aggressive Reporting mechanism is opted-out in favour of reporting only built-in queries + those
		 * indicated in custom-queries setting.
		 */
		const isAggressiveQueryReportingEnabled = (): boolean => {
			const isSwitchedOff = customQueriesSetting === SETTING_OPTION_OFF;
			const hasCustomOptions =
				Array.isArray(customQueriesSetting) && customQueriesSetting.length > 0;

			return !isSwitchedOff && !hasCustomOptions;
		};

		const getCustomModule = (): string | undefined => {
			if (
				!isAggressiveModuleReportingEnabled() &&
				customModuleSetting !== SETTING_OPTION_OFF
			) {
				return customModuleSetting;
			}
			return undefined;
		};

		const getCustomRenders = (): string[] => {
			if (
				!isAggressiveRenderReportingEnabled() &&
				customRendersSetting !== SETTING_OPTION_OFF
			) {
				return customRendersSetting as string[];
			}

			return [];
		};

		const getCustomQueries = (): string[] => {
			if (
				!isAggressiveQueryReportingEnabled() &&
				customQueriesSetting !== SETTING_OPTION_OFF
			) {
				return customQueriesSetting as string[];
			}

			return [];
		};

		// Helpers for Testing Library detection.
		const getTestingLibraryImportNode: GetTestingLibraryImportNodeFn = () => {
			return importedTestingLibraryNodes[0];
		};

		const getAllTestingLibraryImportNodes: GetTestingLibraryImportNodesFn =
			() => {
				return importedTestingLibraryNodes;
			};

		const getCustomModuleImportNode: GetCustomModuleImportNodeFn = () => {
			return importedCustomModuleNode;
		};

		const getTestingLibraryImportName: GetTestingLibraryImportNameFn = () => {
			return getImportModuleName(importedTestingLibraryNodes[0]);
		};

		const getCustomModuleImportName: GetCustomModuleImportNameFn = () => {
			return getImportModuleName(importedCustomModuleNode);
		};

		/**
		 * Determines whether Testing Library utils are imported or not for
		 * current file being analyzed.
		 *
		 * By default, it is ALWAYS considered as imported. This is what we call
		 * "aggressive reporting" so we don't miss TL utils reexported from
		 * custom modules.
		 *
		 * However, there is a setting to customize the module where TL utils can
		 * be imported from: "testing-library/utils-module". If this setting is enabled,
		 * then this method will return `true` ONLY IF a testing-library package
		 * or custom module are imported.
		 */
		const isTestingLibraryImported: IsTestingLibraryImportedFn = (
			isStrict = false
		) => {
			const isSomeModuleImported =
				importedTestingLibraryNodes.length !== 0 || !!importedCustomModuleNode;

			return (
				(!isStrict && isAggressiveModuleReportingEnabled()) ||
				isSomeModuleImported
			);
		};

		/**
		 * Determines whether a given node is a reportable query,
		 * either a built-in or a custom one.
		 *
		 * Depending on Aggressive Query Reporting setting, custom queries will be
		 * reportable or not.
		 */
		const isQuery: IsQueryFn = (node) => {
			const hasQueryPattern = /^(get|query|find)(All)?By.+$/.test(node.name);
			if (!hasQueryPattern) {
				return false;
			}

			if (isAggressiveQueryReportingEnabled()) {
				return true;
			}

			const customQueries = getCustomQueries();
			const isBuiltInQuery = ALL_QUERIES_COMBINATIONS.includes(node.name);
			const isReportableCustomQuery = customQueries.some((pattern) =>
				new RegExp(pattern).test(node.name)
			);
			return isBuiltInQuery || isReportableCustomQuery;
		};

		/**
		 * Determines whether a given node is `get*` query variant or not.
		 */
		const isGetQueryVariant: IsGetQueryVariantFn = (node) => {
			return isQuery(node) && node.name.startsWith('get');
		};

		/**
		 * Determines whether a given node is `query*` query variant or not.
		 */
		const isQueryQueryVariant: IsQueryQueryVariantFn = (node) => {
			return isQuery(node) && node.name.startsWith('query');
		};

		/**
		 * Determines whether a given node is `find*` query variant or not.
		 */
		const isFindQueryVariant: IsFindQueryVariantFn = (node) => {
			return isQuery(node) && node.name.startsWith('find');
		};

		/**
		 * Determines whether a given node is sync query or not.
		 */
		const isSyncQuery: IsSyncQueryFn = (node) => {
			return isGetQueryVariant(node) || isQueryQueryVariant(node);
		};

		/**
		 * Determines whether a given node is async query or not.
		 */
		const isAsyncQuery: IsAsyncQueryFn = (node) => {
			return isFindQueryVariant(node);
		};

		const isCustomQuery: IsCustomQueryFn = (node) => {
			return isQuery(node) && !ALL_QUERIES_COMBINATIONS.includes(node.name);
		};

		const isBuiltInQuery = (node: TSESTree.Identifier): boolean => {
			return isQuery(node) && ALL_QUERIES_COMBINATIONS.includes(node.name);
		};

		/**
		 * Determines whether a given node is a valid async util or not.
		 *
		 * A node will be interpreted as a valid async util based on two conditions:
		 * the name matches with some Testing Library async util, and the node is
		 * coming from Testing Library module.
		 *
		 * The latter depends on Aggressive module reporting:
		 * if enabled, then it doesn't matter from where the given node was imported
		 * from as it will be considered part of Testing Library.
		 * Otherwise, it means `custom-module` has been set up, so only those nodes
		 * coming from Testing Library will be considered as valid.
		 */
		const isAsyncUtil: IsAsyncUtilFn = (node, validNames = ASYNC_UTILS) => {
			return isPotentialTestingLibraryFunction(
				node,
				(identifierNodeName, originalNodeName) => {
					return (
						(validNames as string[]).includes(identifierNodeName) ||
						(!!originalNodeName &&
							(validNames as string[]).includes(originalNodeName))
					);
				}
			);
		};

		/**
		 * Determines whether a given node is fireEvent util itself or not.
		 *
		 * Not to be confused with {@link isFireEventMethod}
		 */
		const isFireEventUtil = (node: TSESTree.Identifier): boolean => {
			return isPotentialTestingLibraryFunction(
				node,
				(identifierNodeName, originalNodeName) => {
					return [identifierNodeName, originalNodeName].includes('fireEvent');
				}
			);
		};

		/**
		 * Determines whether a given node is userEvent util itself or not.
		 *
		 * Not to be confused with {@link isUserEventMethod}
		 */
		const isUserEventUtil = (node: TSESTree.Identifier): boolean => {
			const userEvent = findImportedUserEventSpecifier();
			let userEventName: string | undefined;

			if (userEvent) {
				userEventName = userEvent.name;
			} else if (isAggressiveModuleReportingEnabled()) {
				userEventName = USER_EVENT_NAME;
			}

			if (!userEventName) {
				return false;
			}

			return node.name === userEventName;
		};

		/**
		 * Determines whether a given node is fireEvent method or not
		 */
		// eslint-disable-next-line complexity
		const isFireEventMethod: IsFireEventMethodFn = (node) => {
			const fireEventUtil =
				findImportedTestingLibraryUtilSpecifier(FIRE_EVENT_NAME);
			let fireEventUtilName: string | undefined;

			if (fireEventUtil) {
				fireEventUtilName = ASTUtils.isIdentifier(fireEventUtil)
					? fireEventUtil.name
					: fireEventUtil.local.name;
			} else if (isAggressiveModuleReportingEnabled()) {
				fireEventUtilName = FIRE_EVENT_NAME;
			}

			if (!fireEventUtilName) {
				return false;
			}

			const parentMemberExpression: TSESTree.MemberExpression | undefined =
				node.parent && isMemberExpression(node.parent)
					? node.parent
					: undefined;

			const parentCallExpression: TSESTree.CallExpression | undefined =
				node.parent && isCallExpression(node.parent) ? node.parent : undefined;

			if (!parentMemberExpression && !parentCallExpression) {
				return false;
			}

			// check fireEvent('method', node) usage
			if (parentCallExpression) {
				return [fireEventUtilName, FIRE_EVENT_NAME].includes(node.name);
			}

			// we know it's defined at this point, but TS seems to think it is not
			// so here I'm enforcing it once in order to avoid using "!" operator every time
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const definedParentMemberExpression = parentMemberExpression!;

			// check fireEvent.click() usage
			const regularCall =
				ASTUtils.isIdentifier(definedParentMemberExpression.object) &&
				isCallExpression(definedParentMemberExpression.parent) &&
				definedParentMemberExpression.object.name === fireEventUtilName &&
				node.name !== FIRE_EVENT_NAME &&
				node.name !== fireEventUtilName;

			// check testingLibraryUtils.fireEvent.click() usage
			const wildcardCall =
				isMemberExpression(definedParentMemberExpression.object) &&
				ASTUtils.isIdentifier(definedParentMemberExpression.object.object) &&
				definedParentMemberExpression.object.object.name ===
					fireEventUtilName &&
				ASTUtils.isIdentifier(definedParentMemberExpression.object.property) &&
				definedParentMemberExpression.object.property.name ===
					FIRE_EVENT_NAME &&
				node.name !== FIRE_EVENT_NAME &&
				node.name !== fireEventUtilName;

			// check testingLibraryUtils.fireEvent('click')
			const wildcardCallWithCallExpression =
				ASTUtils.isIdentifier(definedParentMemberExpression.object) &&
				definedParentMemberExpression.object.name === fireEventUtilName &&
				ASTUtils.isIdentifier(definedParentMemberExpression.property) &&
				definedParentMemberExpression.property.name === FIRE_EVENT_NAME &&
				!isMemberExpression(definedParentMemberExpression.parent) &&
				node.name === FIRE_EVENT_NAME &&
				node.name !== fireEventUtilName;

			return regularCall || wildcardCall || wildcardCallWithCallExpression;
		};

		const isUserEventMethod: IsUserEventMethodFn = (node) => {
			const userEvent = findImportedUserEventSpecifier();
			let userEventName: string | undefined;

			if (userEvent) {
				userEventName = userEvent.name;
			} else if (isAggressiveModuleReportingEnabled()) {
				userEventName = USER_EVENT_NAME;
			}

			if (!userEventName) {
				return false;
			}

			const parentMemberExpression: TSESTree.MemberExpression | undefined =
				node.parent && isMemberExpression(node.parent)
					? node.parent
					: undefined;

			if (!parentMemberExpression) {
				return false;
			}

			// make sure that given node it's not userEvent object itself
			if (
				[userEventName, USER_EVENT_NAME].includes(node.name) ||
				(ASTUtils.isIdentifier(parentMemberExpression.object) &&
					parentMemberExpression.object.name === node.name)
			) {
				return false;
			}

			// check userEvent.click() usage
			return (
				ASTUtils.isIdentifier(parentMemberExpression.object) &&
				parentMemberExpression.object.name === userEventName
			);
		};

		/**
		 * Determines whether a given node is a valid render util or not.
		 *
		 * A node will be interpreted as a valid render based on two conditions:
		 * the name matches with a valid "render" option, and the node is coming
		 * from Testing Library module. This depends on:
		 *
		 * - Aggressive render reporting: if enabled, then every node name
		 * containing "render" will be assumed as Testing Library render util.
		 * Otherwise, it means `custom-modules` has been set up, so only those nodes
		 * named as "render" or some of the `custom-modules` options will be
		 * considered as Testing Library render util.
		 * - Aggressive module reporting: if enabled, then it doesn't matter from
		 * where the given node was imported from as it will be considered part of
		 * Testing Library. Otherwise, it means `custom-module` has been set up, so
		 * only those nodes coming from Testing Library will be considered as valid.
		 */
		const isRenderUtil: IsRenderUtilFn = (node) =>
			isPotentialTestingLibraryFunction(
				node,
				(identifierNodeName, originalNodeName) => {
					if (isAggressiveRenderReportingEnabled()) {
						return identifierNodeName.toLowerCase().includes(RENDER_NAME);
					}

					return [RENDER_NAME, ...getCustomRenders()].some(
						(validRenderName) =>
							validRenderName === identifierNodeName ||
							(Boolean(originalNodeName) &&
								validRenderName === originalNodeName)
					);
				}
			);

		const isCreateEventUtil: IsCreateEventUtil = (node) => {
			const isCreateEventCallback = (
				identifierNodeName: string,
				originalNodeName?: string
			) => [identifierNodeName, originalNodeName].includes(CREATE_EVENT_NAME);
			if (
				isCallExpression(node) &&
				isMemberExpression(node.callee) &&
				ASTUtils.isIdentifier(node.callee.object)
			) {
				return isPotentialTestingLibraryFunction(
					node.callee.object,
					isCreateEventCallback
				);
			}

			if (
				isCallExpression(node) &&
				isMemberExpression(node.callee) &&
				isMemberExpression(node.callee.object) &&
				ASTUtils.isIdentifier(node.callee.object.property)
			) {
				return isPotentialTestingLibraryFunction(
					node.callee.object.property,
					isCreateEventCallback
				);
			}
			const identifier = getDeepestIdentifierNode(node);
			return isPotentialTestingLibraryFunction(
				identifier,
				isCreateEventCallback
			);
		};

		const isRenderVariableDeclarator: IsRenderVariableDeclaratorFn = (node) => {
			if (!node.init) {
				return false;
			}
			const initIdentifierNode = getDeepestIdentifierNode(node.init);

			if (!initIdentifierNode) {
				return false;
			}

			return isRenderUtil(initIdentifierNode);
		};

		const isDebugUtil: IsDebugUtilFn = (
			identifierNode,
			validNames = DEBUG_UTILS
		) => {
			const isBuiltInConsole =
				isMemberExpression(identifierNode.parent) &&
				ASTUtils.isIdentifier(identifierNode.parent.object) &&
				identifierNode.parent.object.name === 'console';

			return (
				!isBuiltInConsole &&
				isPotentialTestingLibraryFunction(
					identifierNode,
					(identifierNodeName, originalNodeName) => {
						return (
							(validNames as string[]).includes(identifierNodeName) ||
							(!!originalNodeName &&
								(validNames as string[]).includes(originalNodeName))
						);
					}
				)
			);
		};

		/**
		 * Determines whether a given node is some reportable `act` util.
		 *
		 * An `act` is reportable if some of these conditions is met:
		 * - it's related to Testing Library module (this depends on Aggressive Reporting)
		 * - it's related to React DOM Test Utils
		 */
		const isActUtil = (node: TSESTree.Identifier): boolean => {
			const isTestingLibraryAct = isPotentialTestingLibraryFunction(
				node,
				(identifierNodeName, originalNodeName) => {
					return [identifierNodeName, originalNodeName]
						.filter(Boolean)
						.includes('act');
				}
			);

			const isReactDomTestUtilsAct = (() => {
				if (!importedReactDomTestUtilsNode) {
					return false;
				}
				const referenceNode = getReferenceNode(node);
				const referenceNodeIdentifier =
					getPropertyIdentifierNode(referenceNode);
				if (!referenceNodeIdentifier) {
					return false;
				}

				const importedUtilSpecifier = findImportSpecifier(
					node.name,
					importedReactDomTestUtilsNode
				);
				if (!importedUtilSpecifier) {
					return false;
				}

				const importDeclaration = (() => {
					if (isImportDeclaration(importedUtilSpecifier.parent)) {
						return importedUtilSpecifier.parent;
					}

					const variableDeclarator = findClosestVariableDeclaratorNode(
						importedUtilSpecifier
					);

					if (isCallExpression(variableDeclarator?.init)) {
						return variableDeclarator?.init;
					}

					return undefined;
				})();
				if (!importDeclaration) {
					return false;
				}

				const importDeclarationName = getImportModuleName(importDeclaration);
				if (!importDeclarationName) {
					return false;
				}

				if (importDeclarationName !== REACT_DOM_TEST_UTILS_PACKAGE) {
					return false;
				}

				return hasImportMatch(
					importedUtilSpecifier,
					referenceNodeIdentifier.name
				);
			})();

			return isTestingLibraryAct || isReactDomTestUtilsAct;
		};

		const isTestingLibraryUtil = (node: TSESTree.Identifier): boolean => {
			return (
				isAsyncUtil(node) ||
				isQuery(node) ||
				isRenderUtil(node) ||
				isFireEventMethod(node) ||
				isUserEventMethod(node) ||
				isActUtil(node) ||
				isCreateEventUtil(node)
			);
		};

		/**
		 * Determines whether a given MemberExpression node is a presence assert
		 *
		 * Presence asserts could have shape of:
		 *  - expect(element).toBeInTheDocument()
		 *  - expect(element).not.toBeNull()
		 */
		const isPresenceAssert: IsPresenceAssertFn = (node) => {
			const { matcher, isNegated } = getAssertNodeInfo(node);

			if (!matcher) {
				return false;
			}

			return isNegated
				? ABSENCE_MATCHERS.includes(matcher)
				: PRESENCE_MATCHERS.includes(matcher);
		};

		/**
		 * Determines whether a given MemberExpression node is an absence assert
		 *
		 * Absence asserts could have shape of:
		 *  - expect(element).toBeNull()
		 *  - expect(element).not.toBeInTheDocument()
		 */
		const isAbsenceAssert: IsAbsenceAssertFn = (node) => {
			const { matcher, isNegated } = getAssertNodeInfo(node);

			if (!matcher) {
				return false;
			}

			return isNegated
				? PRESENCE_MATCHERS.includes(matcher)
				: ABSENCE_MATCHERS.includes(matcher);
		};

		const isMatchingAssert: IsMatchingAssertFn = (node, matcherName) => {
			const { matcher } = getAssertNodeInfo(node);

			if (!matcher) {
				return false;
			}

			return matcher === matcherName;
		};

		/**
		 * Finds the import util specifier related to Testing Library for a given name.
		 */
		const findImportedTestingLibraryUtilSpecifier: FindImportedTestingLibraryUtilSpecifierFn =
			(
				specifierName
			): TSESTree.Identifier | TSESTree.ImportClause | undefined => {
				const node =
					getCustomModuleImportNode() ?? getTestingLibraryImportNode();

				if (!node) {
					return undefined;
				}

				return findImportSpecifier(specifierName, node);
			};

		const findImportedUserEventSpecifier: () => TSESTree.Identifier | null =
			() => {
				if (!importedUserEventLibraryNode) {
					return null;
				}

				if (isImportDeclaration(importedUserEventLibraryNode)) {
					const userEventIdentifier =
						importedUserEventLibraryNode.specifiers.find((specifier) =>
							isImportDefaultSpecifier(specifier)
						);

					if (userEventIdentifier) {
						return userEventIdentifier.local;
					}
				} else {
					if (
						!ASTUtils.isVariableDeclarator(importedUserEventLibraryNode.parent)
					) {
						return null;
					}

					const requireNode = importedUserEventLibraryNode.parent;
					if (!ASTUtils.isIdentifier(requireNode.id)) {
						return null;
					}

					return requireNode.id;
				}

				return null;
			};

		const getTestingLibraryImportedUtilSpecifier = (
			node: TSESTree.Identifier | TSESTree.MemberExpression
		): TSESTree.Identifier | TSESTree.ImportClause | undefined => {
			const identifierName: string | undefined =
				getPropertyIdentifierNode(node)?.name;

			if (!identifierName) {
				return undefined;
			}

			return findImportedTestingLibraryUtilSpecifier(identifierName);
		};

		/**
		 * Determines if file inspected meets all conditions to be reported by rules or not.
		 */
		const canReportErrors: CanReportErrorsFn = () => {
			return skipRuleReportingCheck || isTestingLibraryImported();
		};

		/**
		 * Determines whether a node is imported from a valid Testing Library module
		 *
		 * This method will try to find any import matching the given node name,
		 * and also make sure the name is a valid match in case it's been renamed.
		 */
		const isNodeComingFromTestingLibrary: IsNodeComingFromTestingLibraryFn = (
			node
		) => {
			const importNode = getTestingLibraryImportedUtilSpecifier(node);

			if (!importNode) {
				return false;
			}

			const referenceNode = getReferenceNode(node);
			const referenceNodeIdentifier = getPropertyIdentifierNode(referenceNode);
			if (!referenceNodeIdentifier) {
				return false;
			}

			const importDeclaration = (() => {
				if (isImportDeclaration(importNode.parent)) {
					return importNode.parent;
				}

				const variableDeclarator =
					findClosestVariableDeclaratorNode(importNode);

				if (isCallExpression(variableDeclarator?.init)) {
					return variableDeclarator?.init;
				}

				return undefined;
			})();

			if (!importDeclaration) {
				return false;
			}

			const importDeclarationName = getImportModuleName(importDeclaration);
			if (!importDeclarationName) {
				return false;
			}

			const identifierName: string | undefined =
				getPropertyIdentifierNode(node)?.name;

			if (!identifierName) {
				return false;
			}

			const hasImportElementMatch = hasImportMatch(importNode, identifierName);
			const hasImportModuleMatch =
				/testing-library/g.test(importDeclarationName) ||
				(typeof customModuleSetting === 'string' &&
					importDeclarationName.endsWith(customModuleSetting));

			return hasImportElementMatch && hasImportModuleMatch;
		};

		const helpers: DetectionHelpers = {
			getTestingLibraryImportNode,
			getAllTestingLibraryImportNodes,
			getCustomModuleImportNode,
			getTestingLibraryImportName,
			getCustomModuleImportName,
			isTestingLibraryImported,
			isTestingLibraryUtil,
			isGetQueryVariant,
			isQueryQueryVariant,
			isFindQueryVariant,
			isSyncQuery,
			isAsyncQuery,
			isQuery,
			isCustomQuery,
			isBuiltInQuery,
			isAsyncUtil,
			isFireEventUtil,
			isUserEventUtil,
			isFireEventMethod,
			isUserEventMethod,
			isRenderUtil,
			isCreateEventUtil,
			isRenderVariableDeclarator,
			isDebugUtil,
			isActUtil,
			isPresenceAssert,
			isMatchingAssert,
			isAbsenceAssert,
			canReportErrors,
			findImportedTestingLibraryUtilSpecifier,
			isNodeComingFromTestingLibrary,
		};

		// Instructions for Testing Library detection.
		const detectionInstructions: TSESLint.RuleListener = {
			/**
			 * This ImportDeclaration rule listener will check if Testing Library related
			 * modules are imported. Since imports happen first thing in a file, it's
			 * safe to use `isImportingTestingLibraryModule` and `isImportingCustomModule`
			 * since they will have corresponding value already updated when reporting other
			 * parts of the file.
			 */
			ImportDeclaration(node: TSESTree.ImportDeclaration) {
				if (typeof node.source.value !== 'string') {
					return;
				}
				// check only if testing library import not found yet so we avoid
				// to override importedTestingLibraryNodes after it's found
				if (/testing-library/g.test(node.source.value)) {
					importedTestingLibraryNodes.push(node);
				}

				// check only if custom module import not found yet so we avoid
				// to override importedCustomModuleNode after it's found
				const customModule = getCustomModule();
				if (
					customModule &&
					!importedCustomModuleNode &&
					node.source.value.endsWith(customModule)
				) {
					importedCustomModuleNode = node;
				}

				// check only if user-event import not found yet so we avoid
				// to override importedUserEventLibraryNode after it's found
				if (
					!importedUserEventLibraryNode &&
					node.source.value === USER_EVENT_PACKAGE
				) {
					importedUserEventLibraryNode = node;
				}

				// check only if react-dom/test-utils import not found yet so we avoid
				// to override importedReactDomTestUtilsNode after it's found
				if (
					!importedUserEventLibraryNode &&
					node.source.value === REACT_DOM_TEST_UTILS_PACKAGE
				) {
					importedReactDomTestUtilsNode = node;
				}
			},

			// Check if Testing Library related modules are loaded with required.
			[`CallExpression > Identifier[name="require"]`](
				node: TSESTree.Identifier
			) {
				const callExpression = node.parent as TSESTree.CallExpression;
				const { arguments: args } = callExpression;

				if (
					args.some(
						(arg) =>
							isLiteral(arg) &&
							typeof arg.value === 'string' &&
							/testing-library/g.test(arg.value)
					)
				) {
					importedTestingLibraryNodes.push(callExpression);
				}

				const customModule = getCustomModule();
				if (
					!importedCustomModuleNode &&
					args.some(
						(arg) =>
							customModule &&
							isLiteral(arg) &&
							typeof arg.value === 'string' &&
							arg.value.endsWith(customModule)
					)
				) {
					importedCustomModuleNode = callExpression;
				}

				if (
					!importedCustomModuleNode &&
					args.some(
						(arg) =>
							isLiteral(arg) &&
							typeof arg.value === 'string' &&
							arg.value === USER_EVENT_PACKAGE
					)
				) {
					importedUserEventLibraryNode = callExpression;
				}

				if (
					!importedReactDomTestUtilsNode &&
					args.some(
						(arg) =>
							isLiteral(arg) &&
							typeof arg.value === 'string' &&
							arg.value === REACT_DOM_TEST_UTILS_PACKAGE
					)
				) {
					importedReactDomTestUtilsNode = callExpression;
				}
			},
		};

		// update given rule to inject Testing Library detection
		const ruleInstructions = ruleCreate(context, optionsWithDefault, helpers);
		const enhancedRuleInstructions: TSESLint.RuleListener = {};

		const allKeys = new Set(
			Object.keys(detectionInstructions).concat(Object.keys(ruleInstructions))
		);

		// Iterate over ALL instructions keys so we can override original rule instructions
		// to prevent their execution if conditions to report errors are not met.
		allKeys.forEach((instruction) => {
			enhancedRuleInstructions[instruction] = (node) => {
				if (instruction in detectionInstructions) {
					detectionInstructions[instruction]?.(node);
				}

				if (canReportErrors() && ruleInstructions[instruction]) {
					return ruleInstructions[instruction]?.(node);
				}

				return undefined;
			};
		});

		return enhancedRuleInstructions;
	};
}
