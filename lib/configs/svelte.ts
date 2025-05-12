// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING pnpm run generate:configs

export = {
	plugins: ['testing-library'],
	rules: {
		'testing-library/await-async-events': [
			'error',
			{ eventModule: ['fireEvent', 'userEvent'] },
		],
		'testing-library/await-async-queries': 'error',
		'testing-library/await-async-utils': 'error',
		'testing-library/no-await-sync-queries': 'error',
		'testing-library/no-container': 'error',
		'testing-library/no-debugging-utils': 'warn',
		'testing-library/no-dom-import': ['error', 'svelte'],
		'testing-library/no-global-regexp-flag-in-query': 'error',
		'testing-library/no-manual-cleanup': 'error',
		'testing-library/no-node-access': 'error',
		'testing-library/no-promise-in-fire-event': 'error',
		'testing-library/no-render-in-lifecycle': 'error',
		'testing-library/no-wait-for-multiple-assertions': 'error',
		'testing-library/no-wait-for-side-effects': 'error',
		'testing-library/no-wait-for-snapshot': 'error',
		'testing-library/prefer-find-by': 'error',
		'testing-library/prefer-presence-queries': 'error',
		'testing-library/prefer-query-by-disappearance': 'error',
		'testing-library/prefer-screen-queries': 'error',
		'testing-library/render-result-naming-convention': 'error',
	},
};
