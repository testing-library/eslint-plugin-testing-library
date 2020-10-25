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
      getIsTestingLibraryImported() {
        if (!customModule) {
          return true;
        }

        return isImportingTestingLibraryModule || isImportingCustomModule;
      },
      canReportErrors() {
        return this.getIsTestingLibraryImported();
      },
    };

    // Instructions for Testing Library detection.
    // `ImportDeclaration` must be first in order to know if Testing Library
    // is imported ASAP.
    const detectionInstructions: TSESLint.RuleListener = {
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

    // The order here is important too: detection instructions must come before
    // than rule instructions to:
    //  - detect Testing Library things before the rule is applied
    //  - be able to prevent the rule about to be applied if necessary
    const allKeys = new Set(
      Object.keys(detectionInstructions).concat(Object.keys(ruleInstructions))
    );

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
