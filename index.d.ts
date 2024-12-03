import type { Linter, Rule } from 'eslint';

declare const plugin: {
	meta: {
		name: string;
		version: string;
	};
	configs: {
		angular: Linter.LegacyConfig;
		dom: Linter.LegacyConfig;
		marko: Linter.LegacyConfig;
		react: Linter.LegacyConfig;
		vue: Linter.LegacyConfig;
		'flat/angular': Linter.Config<Linter.RulesRecord>;
		'flat/dom': Linter.Config<Linter.RulesRecord>;
		'flat/marko': Linter.Config<Linter.RulesRecord>;
		'flat/react': Linter.Config<Linter.RulesRecord>;
		'flat/vue': Linter.Config<Linter.RulesRecord>;
	};
	rules: {
		[key: string]: Rule.RuleModule;
	};
};

export = plugin;
