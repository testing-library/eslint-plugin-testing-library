import {
	isCustomTestingLibraryModule,
	isOfficialTestingLibraryModule,
	isTestingLibraryModule,
} from '../../../lib/utils/is-testing-library-module';

const OLD_LIBRARY_MODULES = [
	'dom-testing-library',
	'vue-testing-library',
	'react-testing-library',
] as const;

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

describe('isOfficialTestingLibraryModule', () => {
	it.each([...OLD_LIBRARY_MODULES, ...LIBRARY_MODULES, USER_EVENT_MODULE])(
		'returns true when arg is "%s"',
		(importSourceName) => {
			const result = isOfficialTestingLibraryModule(importSourceName);

			expect(result).toBe(true);
		}
	);

	it.each(['custom-modules', 'hoge-testing-library', '@testing-library/hoge'])(
		'returns false when arg is "%s"',
		(importSourceName) => {
			const result = isOfficialTestingLibraryModule(importSourceName);

			expect(result).toBe(false);
		}
	);
});

describe('isCustomTestingLibraryModule', () => {
	it.each(['test-utils', '../test-utils', '@/test-utils'])(
		'returns true when arg is "%s"',
		(importSourceName) => {
			const result = isCustomTestingLibraryModule(
				importSourceName,
				'test-utils'
			);

			expect(result).toBe(true);
		}
	);

	it.each([
		'custom-modules',
		'react-testing-library',
		'@testing-library/react',
		'test-util',
		'test-utils-module',
	])('returns false when arg is "%s"', (importSourceName) => {
		const result = isCustomTestingLibraryModule(importSourceName, 'test-utils');

		expect(result).toBe(false);
	});
});

describe('isTestingLibraryModule', () => {
	it.each([
		...OLD_LIBRARY_MODULES,
		...LIBRARY_MODULES,
		USER_EVENT_MODULE,
		'test-utils',
		'../test-utils',
		'@/test-utils',
	])('returns true when arg is "%s"', (importSourceName) => {
		const result = isTestingLibraryModule(importSourceName, 'test-utils');

		expect(result).toBe(true);
	});

	it.each([
		'custom-modules',
		'hoge-testing-library',
		'@testing-library/hoge',
		'test-util',
		'test-utils-module',
	])('returns false when arg is "%s"', (importSourceName) => {
		const result = isTestingLibraryModule(importSourceName, 'test-utils');

		expect(result).toBe(false);
	});
});
