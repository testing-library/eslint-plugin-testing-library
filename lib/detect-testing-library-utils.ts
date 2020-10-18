import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

export type DetectionHelpers = {
  getIsImportingTestingLibrary: () => boolean;
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
  ): TRuleListener => {
    let isImportingTestingLibrary = false;

    // TODO: init here options based on shared ESLint config

    // helpers for Testing Library detection
    const helpers: DetectionHelpers = {
      getIsImportingTestingLibrary() {
        return isImportingTestingLibrary;
      },
    };

    // instructions for Testing Library detection
    const detectionInstructions: TSESLint.RuleListener = {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        isImportingTestingLibrary = /testing-library/g.test(
          node.source.value as string
        );
      },
    };

    // update given rule to inject Testing Library detection
    const ruleInstructions = ruleCreate(context, optionsWithDefault, helpers);
    const enhancedRuleInstructions = Object.assign({}, ruleInstructions);

    Object.keys(detectionInstructions).forEach((instruction) => {
      (enhancedRuleInstructions as TSESLint.RuleListener)[instruction] = (
        node
      ) => {
        if (instruction in detectionInstructions) {
          detectionInstructions[instruction](node);
        }

        if (ruleInstructions[instruction]) {
          return ruleInstructions[instruction](node);
        }
      };
    });

    return enhancedRuleInstructions;
  };
}
