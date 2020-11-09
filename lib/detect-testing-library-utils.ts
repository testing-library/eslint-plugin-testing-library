import {
  ASTUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  getImportModuleName,
  getAssertNodeInfo,
  isLiteral,
  ImportModuleNode,
  isImportDeclaration,
  isImportNamespaceSpecifier,
  isImportSpecifier,
  isProperty,
} from './node-utils';
import { ABSENCE_MATCHERS, PRESENCE_MATCHERS } from './utils';

export type TestingLibrarySettings = {
  'testing-library/module'?: string;
  'testing-library/filename-pattern'?: string;
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
  getTestingLibraryImportNode: () => ImportModuleNode | null;
  getCustomModuleImportNode: () => ImportModuleNode | null;
  getTestingLibraryImportName: () => string | undefined;
  getCustomModuleImportName: () => string | undefined;
  getIsTestingLibraryImported: () => boolean;
  getIsValidFilename: () => boolean;
  isGetByQuery: (node: TSESTree.Identifier) => boolean;
  isQueryByQuery: (node: TSESTree.Identifier) => boolean;
  isSyncQuery: (node: TSESTree.Identifier) => boolean;
  isPresenceAssert: (node: TSESTree.MemberExpression) => boolean;
  isAbsenceAssert: (node: TSESTree.MemberExpression) => boolean;
  canReportErrors: () => boolean;
  findImportedUtilSpecifier: (
    specifierName: string
  ) => TSESTree.ImportClause | TSESTree.Identifier | undefined;
};

const DEFAULT_FILENAME_PATTERN = '^.*\\.(test|spec)\\.[jt]sx?$';

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
    let importedTestingLibraryNode: ImportModuleNode | null = null;
    let importedCustomModuleNode: ImportModuleNode | null = null;

    // Init options based on shared ESLint settings
    const customModule = context.settings['testing-library/module'];
    const filenamePattern =
      context.settings['testing-library/filename-pattern'] ??
      DEFAULT_FILENAME_PATTERN;

    // Helpers for Testing Library detection.
    const helpers: DetectionHelpers = {
      getTestingLibraryImportNode() {
        return importedTestingLibraryNode;
      },
      getCustomModuleImportNode() {
        return importedCustomModuleNode;
      },
      getTestingLibraryImportName() {
        return getImportModuleName(importedTestingLibraryNode);
      },
      getCustomModuleImportName() {
        return getImportModuleName(importedCustomModuleNode);
      },
      /**
       * Determines whether Testing Library utils are imported or not for
       * current file being analyzed.
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

        return !!importedTestingLibraryNode || !!importedCustomModuleNode;
      },

      /**
       * Determines whether filename is valid or not for current file
       * being analyzed based on "testing-library/filename-pattern" setting.
       */
      getIsValidFilename() {
        const fileName = context.getFilename();
        return !!fileName.match(filenamePattern);
      },

      /**
       * Determines whether a given node is `getBy*` or `getAllBy*` query variant or not.
       */
      isGetByQuery(node) {
        return !!node.name.match(/^get(All)?By.+$/);
      },

      /**
       * Determines whether a given node is `queryBy*` or `queryAllBy*` query variant or not.
       */
      isQueryByQuery(node) {
        return !!node.name.match(/^query(All)?By.+$/);
      },

      /**
       * Determines whether a given node is sync query or not.
       */
      isSyncQuery(node) {
        return this.isGetByQuery(node) || this.isQueryByQuery(node);
      },

      /**
       * Determines whether a given MemberExpression node is a presence assert
       *
       * Presence asserts could have shape of:
       *  - expect(element).toBeInTheDocument()
       *  - expect(element).not.toBeNull()
       */
      isPresenceAssert(node) {
        const { matcher, isNegated } = getAssertNodeInfo(node);

        if (!matcher) {
          return false;
        }

        return isNegated
          ? ABSENCE_MATCHERS.includes(matcher)
          : PRESENCE_MATCHERS.includes(matcher);
      },

      /**
       * Determines whether a given MemberExpression node is an absence assert
       *
       * Absence asserts could have shape of:
       *  - expect(element).toBeNull()
       *  - expect(element).not.toBeInTheDocument()
       */
      isAbsenceAssert(node) {
        const { matcher, isNegated } = getAssertNodeInfo(node);

        if (!matcher) {
          return false;
        }

        return isNegated
          ? PRESENCE_MATCHERS.includes(matcher)
          : ABSENCE_MATCHERS.includes(matcher);
      },

      /**
       * Determines if file inspected meets all conditions to be reported by rules or not.
       */
      canReportErrors() {
        return (
          helpers.getIsTestingLibraryImported() && helpers.getIsValidFilename()
        );
      },
      /**
       * Gets a string and verifies if it was imported/required by our custom module node
       */
      findImportedUtilSpecifier(specifierName: string) {
        const node =
          helpers.getCustomModuleImportNode() ??
          helpers.getTestingLibraryImportNode();
        if (!node) {
          return null;
        }
        if (isImportDeclaration(node)) {
          const namedExport = node.specifiers.find(
            (n) => isImportSpecifier(n) && n.imported.name === specifierName
          );
          // it is "import { foo [as alias] } from 'baz'""
          if (namedExport) {
            return namedExport;
          }
          // it could be "import * as rtl from 'baz'"
          return node.specifiers.find((n) => isImportNamespaceSpecifier(n));
        } else {
          const requireNode = node.parent as TSESTree.VariableDeclarator;
          if (ASTUtils.isIdentifier(requireNode.id)) {
            // this is const rtl = require('foo')
            return requireNode.id;
          }
          // this should be const { something } = require('foo')
          const destructuring = requireNode.id as TSESTree.ObjectPattern;
          const property = destructuring.properties.find(
            (n) =>
              isProperty(n) &&
              ASTUtils.isIdentifier(n.key) &&
              n.key.name === specifierName
          );
          return (property as TSESTree.Property).key as TSESTree.Identifier;
        }
      },
    };

    // Instructions for Testing Library detection.
    const detectionInstructions: TSESLint.RuleListener = {
      /**
       * This ImportDeclaration rule listener will check if Testing Library related
       * modules are imported. Since imports happen first thing in a file, it's
       * safe to use `isImportingTestingLibraryModule` and `isImportingCustomModule`
       * since they will have corresponding value already updated when reporting other
       * parts of the file.
       */
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        // check only if testing library import not found yet so we avoid
        // to override importedTestingLibraryNode after it's found
        if (
          !importedTestingLibraryNode &&
          /testing-library/g.test(node.source.value as string)
        ) {
          importedTestingLibraryNode = node;
        }

        // check only if custom module import not found yet so we avoid
        // to override importedCustomModuleNode after it's found
        if (
          !importedCustomModuleNode &&
          String(node.source.value).endsWith(customModule)
        ) {
          importedCustomModuleNode = node;
        }
      },

      // Check if Testing Library related modules are loaded with required.
      [`CallExpression > Identifier[name="require"]`](
        node: TSESTree.Identifier
      ) {
        const callExpression = node.parent as TSESTree.CallExpression;
        const { arguments: args } = callExpression;

        if (
          !importedTestingLibraryNode &&
          args.some(
            (arg) =>
              isLiteral(arg) &&
              typeof arg.value === 'string' &&
              /testing-library/g.test(arg.value)
          )
        ) {
          importedTestingLibraryNode = callExpression;
        }

        if (
          !importedCustomModuleNode &&
          args.some(
            (arg) =>
              isLiteral(arg) &&
              typeof arg.value === 'string' &&
              arg.value.endsWith(customModule)
          )
        ) {
          importedCustomModuleNode = callExpression;
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
