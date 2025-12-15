import {
	getPathIgnorePattern,
	getRepositories,
} from 'eslint-remote-tester-repositories';
import { parser } from 'typescript-eslint';

import testingLibraryPlugin from './lib';

import type { Config } from 'eslint-remote-tester';

const eslintRemoteTesterConfig: Config = {
	repositories: getRepositories({ randomize: true }),
	pathIgnorePattern: getPathIgnorePattern(),
	extensions: ['js', 'jsx', 'ts', 'tsx'],
	concurrentTasks: 3,
	cache: false,
	logLevel: 'info',
	eslintConfig: [
		{
			plugins: { 'testing-library': testingLibraryPlugin },
			rules: {
				...Object.fromEntries(
					Object.keys(testingLibraryPlugin.rules).map((rule) => [
						`testing-library/${rule}`,
						'error',
					])
				),

				// Rules with required options without default values
				'testing-library/consistent-data-testid': [
					'error',
					{ testIdPattern: '^{fileName}(__([A-Z]+[a-z]_?)+)_$' },
				],
			},
		},
		{ languageOptions: { parser } },
	] as Config['eslintConfig'],
};

export default eslintRemoteTesterConfig;
