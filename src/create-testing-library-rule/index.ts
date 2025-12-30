import { ESLintUtils } from '@typescript-eslint/utils';

import { getDocsUrl } from '../utils';
import { detectTestingLibraryUtils } from './detect-testing-library-utils';

import type {
	TestingLibraryPluginDocs,
	TestingLibraryPluginRuleModule,
} from '../utils';
import type {
	DetectionOptions,
	EnhancedRuleCreate,
} from './detect-testing-library-utils';

type TestingLibraryPluginRuleModuleWithName<
	TMessageIds extends string,
	TOptions extends readonly unknown[],
> = TestingLibraryPluginRuleModule<TMessageIds, TOptions> &
	Required<Pick<TestingLibraryPluginRuleModule<TMessageIds, TOptions>, 'name'>>;

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
>): TestingLibraryPluginRuleModuleWithName<TMessageIds, TOptions> => {
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
