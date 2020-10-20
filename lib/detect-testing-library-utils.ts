import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

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
>(
  ruleCreate: (
    context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
    optionsWithDefault: Readonly<TOptions>,
    detectionHelpers: Readonly<DetectionHelpers>
  ) => TRuleListener
) {
  return (
    context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
    optionsWithDefault: Readonly<TOptions>
  ): TSESLint.RuleListener => {
    let isImportingTestingLibrary = false;

    // TODO: init here options based on shared ESLint config

    // Helpers for Testing Library detection.
    const helpers: DetectionHelpers = {
      getIsTestingLibraryImported() {
        return isImportingTestingLibrary;
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
        isImportingTestingLibrary = /testing-library/g.test(
          node.source.value as string
        );
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
