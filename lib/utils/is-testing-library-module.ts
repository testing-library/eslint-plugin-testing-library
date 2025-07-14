import { TestingLibrarySettings } from '../create-testing-library-rule/detect-testing-library-utils';

import { LIBRARY_MODULES, OLD_LIBRARY_MODULES, USER_EVENT_MODULE } from '.';

export const isOfficialTestingLibraryModule = (importSourceName: string) =>
	[...OLD_LIBRARY_MODULES, ...LIBRARY_MODULES, USER_EVENT_MODULE].includes(
		importSourceName
	);

export const isCustomTestingLibraryModule = (
	importSourceName: string,
	customModuleSetting: TestingLibrarySettings['testing-library/utils-module']
) =>
	typeof customModuleSetting === 'string' &&
	importSourceName.endsWith(customModuleSetting);

export const isTestingLibraryModule = (
	importSourceName: string,
	customModuleSetting?: TestingLibrarySettings['testing-library/utils-module']
) =>
	isOfficialTestingLibraryModule(importSourceName) ||
	isCustomTestingLibraryModule(importSourceName, customModuleSetting);
