import { TSESLint } from '@typescript-eslint/utils';
import { version as eslintVersion } from 'eslint/package.json';
import * as semver from 'semver';

export const usingFlatConfig = semver.major(eslintVersion) >= 9;

declare module '@typescript-eslint/utils/dist/ts-eslint' {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	export namespace FlatConfig {
		export interface LinterOptions {
			/**
			 * A Boolean value indicating if inline configuration is allowed.
			 */
			noInlineConfig?: boolean;
			/**
			 * A severity string indicating if and how unused disable and enable
			 * directives should be tracked and reported. For legacy compatibility, `true`
			 * is equivalent to `"warn"` and `false` is equivalent to `"off"`.
			 * @default "off"
			 */
			reportUnusedDisableDirectives?:
				| TSESLint.Linter.Severity
				| TSESLint.Linter.SeverityString
				| boolean;
		}

		export interface Config {
			/**
			 * An string to identify the configuration object. Used in error messages and inspection tools.
			 */
			name?: string;
			/**
			 * An array of glob patterns indicating the files that the configuration object should apply to.
			 * If not specified, the configuration object applies to all files matched by any other configuration object.
			 */
			files?: (string | string[])[];
			/**
			 * An array of glob patterns indicating the files that the configuration object should not apply to.
			 * If not specified, the configuration object applies to all files matched by files.
			 */
			ignores?: string[];
			/**
			 * An object containing settings related to how JavaScript is configured for linting.
			 */
			languageOptions?: LanguageOptions;
			/**
			 * An object containing settings related to the linting process.
			 */
			linterOptions?: LinterOptions;
			/**
			 * An object containing a name-value mapping of plugin names to plugin objects.
			 * When `files` is specified, these plugins are only available to the matching files.
			 */
			plugins?: unknown;
			/**
			 * Either an object containing `preprocess()` and `postprocess()` methods or
			 * a string indicating the name of a processor inside of a plugin
			 * (i.e., `"pluginName/processorName"`).
			 */
			processor?: string | TSESLint.Linter.Processor;
			/**
			 * An object containing the configured rules.
			 * When `files` or `ignores` are specified, these rule configurations are only available to the matching files.
			 */
			rules?: TSESLint.Linter.RulesRecord;
			/**
			 * An object containing name-value pairs of information that should be available to all rules.
			 */
			settings?: TSESLint.SharedConfigurationSettings;
		}

		export type ParserOptions = TSESLint.Linter.ParserOptions;

		export interface LanguageOptions {
			/**
			 * The version of ECMAScript to support.
			 * May be any year (i.e., `2022`) or version (i.e., `5`).
			 * Set to `"latest"` for the most recent supported version.
			 * @default "latest"
			 */
			ecmaVersion?: Required<TSESLint.ParserOptions>['ecmaVersion'];
			/**
			 * An object specifying additional objects that should be added to the global scope during linting.
			 */
			globals?:
				| Record<string, 'readonly' | 'writable' | 'off' | true>
				| undefined;
			/**
			 * An object containing a `parse()` method or a `parseForESLint()` method.
			 * @default
			 * ```
			 * // https://github.com/eslint/espree
			 * require('espree')
			 * ```
			 */
			parser?: unknown;
			/**
			 * An object specifying additional options that are passed directly to the parser.
			 * The available options are parser-dependent.
			 */
			parserOptions?: ParserOptions | undefined;
			/**
			 * The type of JavaScript source code.
			 * Possible values are `"script"` for traditional script files, `"module"` for ECMAScript modules (ESM), and `"commonjs"` for CommonJS files.
			 * @default
			 * ```
			 * // for `.js` and `.mjs` files
			 * "module"
			 * // for `.cjs` files
			 * "commonjs"
			 * ```
			 */
			sourceType?: Required<TSESLint.ParserOptions>['sourceType'];
		}
	}
}

export class FlatCompatRuleTester extends TSESLint.RuleTester {
	public constructor(testerConfig?: TSESLint.RuleTesterConfig) {
		super(FlatCompatRuleTester._flatCompat(testerConfig));
	}

	public override run<
		TMessageIds extends string,
		TOptions extends readonly unknown[]
	>(
		ruleName: string,
		rule: TSESLint.RuleModule<TMessageIds, TOptions>,
		tests: TSESLint.RunTests<TMessageIds, TOptions>
	) {
		super.run(ruleName, rule, {
			valid: tests.valid.map((t) => FlatCompatRuleTester._flatCompat(t)),
			invalid: tests.invalid.map((t) => FlatCompatRuleTester._flatCompat(t)),
		});
	}

	/* istanbul ignore next */
	private static _flatCompat<
		T extends
			| undefined
			| TSESLint.RuleTesterConfig
			| string
			| TSESLint.ValidTestCase<unknown[]>
			| TSESLint.InvalidTestCase<string, unknown[]>
	>(config: T): T {
		if (!config || !usingFlatConfig || typeof config === 'string') {
			return config;
		}

		const obj: TSESLint.FlatConfig.Config & {
			languageOptions: TSESLint.FlatConfig.LanguageOptions & {
				parserOptions: TSESLint.FlatConfig.ParserOptions;
			};
		} = {
			languageOptions: { parserOptions: {} },
		};

		for (const [key, value] of Object.entries(config)) {
			if (key === 'parser') {
				obj.languageOptions.parser = require(value as string);

				continue;
			}

			if (key === 'parserOptions') {
				for (const [option, val] of Object.entries(
					value as { [s: string]: unknown }
				)) {
					if (option === 'ecmaVersion' || option === 'sourceType') {
						// @ts-expect-error: TS thinks the value could the opposite type of whatever option is
						obj.languageOptions[option] =
							val as TSESLint.FlatConfig.LanguageOptions[
								| 'ecmaVersion'
								| 'sourceType'];

						continue;
					}

					obj.languageOptions.parserOptions[option] = val;
				}

				continue;
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			obj[key as keyof typeof obj] = value;
		}

		return obj as unknown as T;
	}
}
