import { ESLintUtils } from '@typescript-eslint/utils';

import {
	getDocsUrl,
	TestingLibraryPluginDocs,
	TestingLibraryPluginRuleModule,
} from '../utils';

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
>): TestingLibraryPluginRuleModule<TMessageIds, TOptions> => {
	const rule = ESLintUtils.RuleCreator<TestingLibraryPluginDocs<TOptions>>(
		getDocsUrl
	)({
		...remainingConfig,
		create: detectTestingLibraryUtils<TMessageIds, TOptions>(
			create,
			detectionOptions
		),
	});
	const { docs } = rule.meta;
	if (docs === undefined) {
		throw new Error('Rule metadata must contain `docs` property');
	}

	return { ...rule, meta: { ...rule.meta, docs } };
};
