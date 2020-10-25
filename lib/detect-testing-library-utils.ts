import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

export type TestingLibrarySettings = {
  'testing-library/module'?: string;
};

export type TestingLibraryContext<
  TOptions extends readonly unknown[],
  TMessageIds extends string
> = Readonly<
  TSESLint.RuleContext<TMessageIds, TOptions> & {
    settings: TestingLibrarySettings;
  }
>;

export type EnhancedRuleCreate<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends TSESLint.RuleListener = TSESLint.RuleListener
> = (
  context: TestingLibraryContext<TOptions, TMessageIds>,
  optionsWithDefault: Readonly<TOptions>,
  detectionHelpers: Readonly<DetectionHelpers>
) => TRuleListener;

export type DetectionHelpers = {
  getIsTestingLibraryImported: () => boolean;
  canReportErrors: () => boolean;
};

/**
 * Enhances a given rule `create` with helpers to detect Testing Library utils.
 */
export function detectTestingLibraryUtils<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends TSESLint.RuleListener = TSESLint.RuleListener
>(ruleCreate: EnhancedRuleCreate<TOptions, TMessageIds, TRuleListener>) {
  return (
    context: TestingLibraryContext<TOptions, TMessageIds>,
    optionsWithDefault: Readonly<TOptions>
  ): TSESLint.RuleListener => {
    let isImportingTestingLibraryModule = false;
    let isImportingCustomModule = false;

    // Init options based on shared ESLint settings
    const customModule = context.settings['testing-library/module'];

    // Helpers for Testing Library detection.
    const helpers: DetectionHelpers = {
      /**
       * Gets if Testing Library is considered as imported or not.
       *
       * By default, it is ALWAYS considered as imported. This is what we call
       * "aggressive reporting" so we don't miss TL utils reexported from
       * custom modules.
       *
       * However, there is a setting to customize the module where TL utils can
       * be imported from: "testing-library/module". If this setting is enabled,
       * then this method will return `true` ONLY IF a testing-library package
       * or custom module are imported.
       */
      getIsTestingLibraryImported() {
        if (!customModule) {
          return true;
        }

        return isImportingTestingLibraryModule || isImportingCustomModule;
      },

      /**
       * Wraps all conditions that must be met to report rules.
       */
      canReportErrors() {
        return this.getIsTestingLibraryImported();
      },
    };

    // Instructions for Testing Library detection.
    const detectionInstructions: TSESLint.RuleListener = {
      /**
       * This ImportDeclaration rule listener will check if Testing Library related
       * modules are loaded. Since imports happen first thing in a file, it's
       * safe to use `isImportingTestingLibraryModule` and `isImportingCustomModule`
       * since they will have corresponding value already updated when reporting other
       * parts of the file.
       */
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (!isImportingTestingLibraryModule) {
          // check only if testing library import not found yet so we avoid
          // to override isImportingTestingLibraryModule after it's found
          isImportingTestingLibraryModule = /testing-library/g.test(
            node.source.value as string
          );
        }

        if (!isImportingCustomModule) {
          // check only if custom module import not found yet so we avoid
          // to override isImportingCustomModule after it's found
          const importName = String(node.source.value);
          isImportingCustomModule = importName.endsWith(customModule);
        }
      },
    };

    // update given rule to inject Testing Library detection
    const ruleInstructions = ruleCreate(context, optionsWithDefault, helpers);
    const enhancedRuleInstructions: TSESLint.RuleListener = {};

    const allKeys = new Set(
      Object.keys(detectionInstructions).concat(Object.keys(ruleInstructions))
    );

    // Iterate over ALL instructions keys so we can override original rule instructions
    // to prevent their execution if conditions to report errors are not met.
    allKeys.forEach((instruction) => {
      enhancedRuleInstructions[instruction] = (node) => {
        if (instruction in detectionInstructions) {
          detectionInstructions[instruction](node);
        }

        if (helpers.canReportErrors() && ruleInstructions[instruction]) {
          return ruleInstructions[instruction](node);
        }
      };
    });

    return enhancedRuleInstructions;
  };
}
