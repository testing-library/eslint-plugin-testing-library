import { ESLintUtils } from '@typescript-eslint/utils';

import { getDocsUrl, TestingLibraryPluginDocs } from '../utils';

import {
	DetectionOptions,
	detectTestingLibraryUtils,
	EnhancedRuleCreate,
} from './detect-testing-library-utils';

export const createTestingLibraryRule = <
	TOptions extends readonly unknown[],
	TMessageIds extends string,
>({
	create,
	detectionOptions = {},
	...remainingConfig
}: Readonly<
	Omit<
		ESLintUtils.RuleWithMetaAndName<
			TOptions,
			TMessageIds,
			TestingLibraryPluginDocs<TOptions>
		>,
		'create'
	> & {
		create: EnhancedRuleCreate<TMessageIds, TOptions>;
		detectionOptions?: Partial<DetectionOptions>;
	}
>) =>
	ESLintUtils.RuleCreator<TestingLibraryPluginDocs<TOptions>>(getDocsUrl)({
		...remainingConfig,
		create: detectTestingLibraryUtils<TMessageIds, TOptions>(
			create,
			detectionOptions
		),
	});
