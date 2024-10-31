import { ESLintUtils, TSESLint } from '@typescript-eslint/utils';

import { getDocsUrl, TestingLibraryRuleMeta } from '../utils';

import {
	DetectionOptions,
	detectTestingLibraryUtils,
	EnhancedRuleCreate,
} from './detect-testing-library-utils';

export const createTestingLibraryRule = <
	TOptions extends readonly unknown[],
	TMessageIds extends string,
	TRuleListener extends TSESLint.RuleListener = TSESLint.RuleListener,
>({
	create,
	detectionOptions = {},
	meta,
	...remainingConfig
}: Readonly<{
	name: string;
	meta: TestingLibraryRuleMeta<TMessageIds, TOptions>;
	defaultOptions: Readonly<TOptions>;
	detectionOptions?: Partial<DetectionOptions>;
	create: EnhancedRuleCreate<TOptions, TMessageIds, TRuleListener>;
}>): TSESLint.RuleModule<TMessageIds, TOptions> =>
	ESLintUtils.RuleCreator(getDocsUrl)({
		...remainingConfig,
		create: detectTestingLibraryUtils<TOptions, TMessageIds, TRuleListener>(
			create,
			detectionOptions
		),
		meta: {
			...meta,
			docs: {
				...meta.docs,
				// We're using our own recommendedConfig meta to tell our build tools
				// if the rule is recommended on a config basis
				recommended: undefined,
			},
		},
	});
