import {
	LIBRARY_MODULES,
	OLD_LIBRARY_MODULES,
	USER_EVENT_MODULE,
} from '../../../lib/utils';
import {
	isCustomTestingLibraryModule,
	isOfficialTestingLibraryModule,
	isTestingLibraryModule,
} from '../../../lib/utils/is-testing-library-module';

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
