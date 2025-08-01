export * from './compat';
export * from './file-import';
export * from './types';
export * from './resolve-to-testing-library-fn';

const combineQueries = (
	variants: readonly string[],
	methods: readonly string[]
): string[] => {
	const combinedQueries: string[] = [];
	variants.forEach((variant) => {
		const variantPrefix = variant.replace('By', '');
		methods.forEach((method) => {
			combinedQueries.push(`${variantPrefix}${method}`);
		});
	});

	return combinedQueries;
};

const getDocsUrl = (ruleName: string): string =>
	`https://github.com/testing-library/eslint-plugin-testing-library/tree/main/docs/rules/${ruleName}.md`;

const LIBRARY_MODULES = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/preact',
	'@testing-library/vue',
	'@testing-library/svelte',
	'@marko/testing-library',
] as const;

const USER_EVENT_MODULE = '@testing-library/user-event';

const OLD_LIBRARY_MODULES = [
	'dom-testing-library',
	'vue-testing-library',
	'react-testing-library',
] as const;

const SYNC_QUERIES_VARIANTS = [
	'getBy',
	'getAllBy',
	'queryBy',
	'queryAllBy',
] as const;
const ASYNC_QUERIES_VARIANTS = ['findBy', 'findAllBy'] as const;
const ALL_QUERIES_VARIANTS = [
	...SYNC_QUERIES_VARIANTS,
	...ASYNC_QUERIES_VARIANTS,
] as const;

const ALL_QUERIES_METHODS = [
	'ByLabelText',
	'ByPlaceholderText',
	'ByText',
	'ByAltText',
	'ByTitle',
	'ByDisplayValue',
	'ByRole',
	'ByTestId',
] as const;

const SYNC_QUERIES_COMBINATIONS = combineQueries(
	SYNC_QUERIES_VARIANTS,
	ALL_QUERIES_METHODS
);

const ASYNC_QUERIES_COMBINATIONS = combineQueries(
	ASYNC_QUERIES_VARIANTS,
	ALL_QUERIES_METHODS
);

const ALL_QUERIES_COMBINATIONS = [
	...SYNC_QUERIES_COMBINATIONS,
	...ASYNC_QUERIES_COMBINATIONS,
] as const;

const ASYNC_UTILS = ['waitFor', 'waitForElementToBeRemoved'] as const;

const DEBUG_UTILS = [
	'debug',
	'logTestingPlaygroundURL',
	'prettyDOM',
	'logRoles',
	'logDOM',
	'prettyFormat',
] as const;

const EVENTS_SIMULATORS = ['fireEvent', 'userEvent'] as const;

const TESTING_FRAMEWORK_SETUP_HOOKS = ['beforeEach', 'beforeAll'] as const;

const PROPERTIES_RETURNING_NODES = [
	'activeElement',
	'children',
	'childElementCount',
	'firstChild',
	'firstElementChild',
	'fullscreenElement',
	'lastChild',
	'lastElementChild',
	'nextElementSibling',
	'nextSibling',
	'parentElement',
	'parentNode',
	'pointerLockElement',
	'previousElementSibling',
	'previousSibling',
	'rootNode',
	'scripts',
] as const;

const METHODS_RETURNING_NODES = [
	'closest',
	'getElementById',
	'getElementsByClassName',
	'getElementsByName',
	'getElementsByTagName',
	'getElementsByTagNameNS',
	'querySelector',
	'querySelectorAll',
] as const;

const EVENT_HANDLER_METHODS = ['click', 'select', 'submit'] as const;

const ALL_RETURNING_NODES = [
	...PROPERTIES_RETURNING_NODES,
	...METHODS_RETURNING_NODES,
] as const;

const PRESENCE_MATCHERS = [
	'toBeOnTheScreen',
	'toBeInTheDocument',
	'toBeTruthy',
	'toBeDefined',
] as const;
const ABSENCE_MATCHERS = ['toBeNull', 'toBeFalsy'] as const;

export {
	combineQueries,
	getDocsUrl,
	SYNC_QUERIES_VARIANTS,
	ASYNC_QUERIES_VARIANTS,
	ALL_QUERIES_VARIANTS,
	ALL_QUERIES_METHODS,
	SYNC_QUERIES_COMBINATIONS,
	ASYNC_QUERIES_COMBINATIONS,
	ALL_QUERIES_COMBINATIONS,
	ASYNC_UTILS,
	DEBUG_UTILS,
	EVENTS_SIMULATORS,
	TESTING_FRAMEWORK_SETUP_HOOKS,
	LIBRARY_MODULES,
	PROPERTIES_RETURNING_NODES,
	METHODS_RETURNING_NODES,
	ALL_RETURNING_NODES,
	PRESENCE_MATCHERS,
	ABSENCE_MATCHERS,
	EVENT_HANDLER_METHODS,
	USER_EVENT_MODULE,
	OLD_LIBRARY_MODULES,
};
