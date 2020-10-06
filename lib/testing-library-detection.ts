import { TSESTree } from '@typescript-eslint/experimental-utils';

/**
 * Enhances a given rule with helpers to detect Testing Library utils.
 * @param rule
 * @param context
 */
function testingLibraryDetection(rule: any, context: any, options: any) {
  let isImportingTestingLibrary = false;

  // TODO: init here options based on shared ESLint config

  // helpers for Testing Library detection
  const helpers = {
    getIsImportingTestingLibrary() {
      return isImportingTestingLibrary;
    },
  };

  // instructions for Testing Library detection
  const detectionInstructions = {
    ImportDeclaration(node: TSESTree.ImportDeclaration) {
      isImportingTestingLibrary = /testing-library/g.test(
        node.source.value as string
      );
    },
  };

  // update given rule to inject Testing Library detection
  const ruleInstructions = rule(context, options, helpers);
  const enhancedRuleInstructions = Object.assign({}, ruleInstructions);

  Object.keys(detectionInstructions).forEach((instruction) => {
    enhancedRuleInstructions[instruction] = (node: any) => {
      if (instruction in detectionInstructions) {
        detectionInstructions[instruction](node);
      }

      if (ruleInstructions[instruction]) {
        return ruleInstructions[instruction](node);
      }
    };
  });

  return enhancedRuleInstructions;
}

function detect(rule: any) {
  return testingLibraryDetection.bind(this, rule);
}

export default detect;
