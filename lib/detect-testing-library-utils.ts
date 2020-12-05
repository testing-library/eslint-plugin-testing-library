import {
  ASTUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  getAssertNodeInfo,
  getImportModuleName,
  ImportModuleNode,
  isImportDeclaration,
  isImportNamespaceSpecifier,
  isImportSpecifier,
  isLiteral,
  isMemberExpression,
  isProperty,
} from './node-utils';
import { ABSENCE_MATCHERS, ASYNC_UTILS, PRESENCE_MATCHERS } from './utils';

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
  isTestingLibraryImported: () => boolean;
  isValidFilename: () => boolean;
  isGetByQuery: (node: TSESTree.Identifier) => boolean;
  isQueryByQuery: (node: TSESTree.Identifier) => boolean;
  isFindByQuery: (node: TSESTree.Identifier) => boolean;
  isSyncQuery: (node: TSESTree.Identifier) => boolean;
  isAsyncQuery: (node: TSESTree.Identifier) => boolean;
  isAsyncUtil: (node: TSESTree.Identifier) => boolean;
  isFireEventMethod: (node: TSESTree.Identifier) => boolean;
  isPresenceAssert: (node: TSESTree.MemberExpression) => boolean;
  isAbsenceAssert: (node: TSESTree.MemberExpression) => boolean;
  canReportErrors: () => boolean;
  findImportedUtilSpecifier: (
    specifierName: string
  ) => TSESTree.ImportClause | TSESTree.Identifier | undefined;
  isNodeComingFromTestingLibrary: (
    node: TSESTree.MemberExpression | TSESTree.Identifier
  ) => boolean;
};

const DEFAULT_FILENAME_PATTERN = '^.*\\.(test|spec)\\.[jt]sx?$';

const FIRE_EVENT_NAME = 'fireEvent';

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

    /**
     * Determines whether aggressive reporting is enabled or not.
     *
     * Aggressive reporting is considered as enabled when:
     * - custom module is not set (so we need to assume everything
     *    matching TL utils is related to TL no matter where it was imported from)
     */
    const isAggressiveReportingEnabled = () => !customModule;

    // Helpers for Testing Library detection.
    const getTestingLibraryImportNode: DetectionHelpers['getTestingLibraryImportNode'] = () => {
      return importedTestingLibraryNode;
    };

    const getCustomModuleImportNode: DetectionHelpers['getCustomModuleImportNode'] = () => {
      return importedCustomModuleNode;
    };

    const getTestingLibraryImportName: DetectionHelpers['getTestingLibraryImportName'] = () => {
      return getImportModuleName(importedTestingLibraryNode);
    };

    const getCustomModuleImportName: DetectionHelpers['getCustomModuleImportName'] = () => {
      return getImportModuleName(importedCustomModuleNode);
    };
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
    const isTestingLibraryImported: DetectionHelpers['isTestingLibraryImported'] = () => {
      if (isAggressiveReportingEnabled()) {
        return true;
      }

      return !!importedTestingLibraryNode || !!importedCustomModuleNode;
    };

    /**
     * Determines whether filename is valid or not for current file
     * being analyzed based on "testing-library/filename-pattern" setting.
     */
    const isValidFilename: DetectionHelpers['isValidFilename'] = () => {
      const fileName = context.getFilename();
      return !!fileName.match(filenamePattern);
    };

    /**
     * Determines whether a given node is `getBy*` or `getAllBy*` query variant or not.
     */
    const isGetByQuery: DetectionHelpers['isGetByQuery'] = (node) => {
      return /^get(All)?By.+$/.test(node.name);
    };

    /**
     * Determines whether a given node is `queryBy*` or `queryAllBy*` query variant or not.
     */
    const isQueryByQuery: DetectionHelpers['isQueryByQuery'] = (node) => {
      return /^query(All)?By.+$/.test(node.name);
    };

    /**
     * Determines whether a given node is `findBy*` or `findAllBy*` query variant or not.
     */
    const isFindByQuery: DetectionHelpers['isFindByQuery'] = (node) => {
      return /^find(All)?By.+$/.test(node.name);
    };

    /**
     * Determines whether a given node is sync query or not.
     */
    const isSyncQuery: DetectionHelpers['isSyncQuery'] = (node) => {
      return isGetByQuery(node) || isQueryByQuery(node);
    };

    /**
     * Determines whether a given node is async query or not.
     */
    const isAsyncQuery: DetectionHelpers['isAsyncQuery'] = (node) => {
      return isFindByQuery(node);
    };

    /**
     * Determines whether a given node is async util or not.
     */
    const isAsyncUtil: DetectionHelpers['isAsyncUtil'] = (node) => {
      return ASYNC_UTILS.includes(node.name);
    };

    /**
     * Determines whether a given node is fireEvent method or not
     * @param node
     */
    const isFireEventMethod: DetectionHelpers['isFireEventMethod'] = (node) => {
      const fireEventUtil = findImportedUtilSpecifier(FIRE_EVENT_NAME);
      let fireEventUtilName: string | undefined;

      if (fireEventUtil) {
        fireEventUtilName = ASTUtils.isIdentifier(fireEventUtil)
          ? fireEventUtil.name
          : fireEventUtil.local.name;
      } else if (isAggressiveReportingEnabled()) {
        fireEventUtilName = FIRE_EVENT_NAME;
      }

      if (!fireEventUtilName) {
        return;
      }

      const parentMemberExpression:
        | TSESTree.MemberExpression
        | undefined = isMemberExpression(node.parent) ? node.parent : undefined;

      if (parentMemberExpression) {
        // checking fireEvent.click() usage
        const regularCall =
          ASTUtils.isIdentifier(parentMemberExpression.object) &&
          parentMemberExpression.object.name === fireEventUtilName;

        // checking testingLibraryUtils.fireEvent.click() usage
        const wildcardCall =
          isMemberExpression(parentMemberExpression.object) &&
          ASTUtils.isIdentifier(parentMemberExpression.object.object) &&
          parentMemberExpression.object.object.name === fireEventUtilName &&
          ASTUtils.isIdentifier(parentMemberExpression.object.property) &&
          parentMemberExpression.object.property.name === FIRE_EVENT_NAME;

        return regularCall || wildcardCall;
      }

      return false;
    };

    /**
     * Determines whether a given MemberExpression node is a presence assert
     *
     * Presence asserts could have shape of:
     *  - expect(element).toBeInTheDocument()
     *  - expect(element).not.toBeNull()
     */
    const isPresenceAssert: DetectionHelpers['isPresenceAssert'] = (node) => {
      const { matcher, isNegated } = getAssertNodeInfo(node);

      if (!matcher) {
        return false;
      }

      return isNegated
        ? ABSENCE_MATCHERS.includes(matcher)
        : PRESENCE_MATCHERS.includes(matcher);
    };

    /**
     * Determines whether a given MemberExpression node is an absence assert
     *
     * Absence asserts could have shape of:
     *  - expect(element).toBeNull()
     *  - expect(element).not.toBeInTheDocument()
     */
    const isAbsenceAssert: DetectionHelpers['isAbsenceAssert'] = (node) => {
      const { matcher, isNegated } = getAssertNodeInfo(node);

      if (!matcher) {
        return false;
      }

      return isNegated
        ? PRESENCE_MATCHERS.includes(matcher)
        : ABSENCE_MATCHERS.includes(matcher);
    };

    /**
     * Gets a string and verifies if it was imported/required by Testing Library
     * related module.
     */
    const findImportedUtilSpecifier: DetectionHelpers['findImportedUtilSpecifier'] = (
      specifierName
    ) => {
      const node = getCustomModuleImportNode() ?? getTestingLibraryImportNode();
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
    };

    /**
     * Determines if file inspected meets all conditions to be reported by rules or not.
     */
    const canReportErrors: DetectionHelpers['canReportErrors'] = () => {
      return isTestingLibraryImported() && isValidFilename();
    };
    /**
     * Takes a MemberExpression or an Identifier and verifies if its name comes from the import in TL
     * @param node a MemberExpression (in "foo.property" it would be property) or an Identifier
     */
    const isNodeComingFromTestingLibrary: DetectionHelpers['isNodeComingFromTestingLibrary'] = (
      node: TSESTree.MemberExpression | TSESTree.Identifier
    ) => {
      let identifierName: string | undefined;

      if (ASTUtils.isIdentifier(node)) {
        identifierName = node.name;
      } else if (ASTUtils.isIdentifier(node.object)) {
        identifierName = node.object.name;
      }

      if (!identifierName) {
        return;
      }

      return !!findImportedUtilSpecifier(identifierName);
    };

    const helpers = {
      getTestingLibraryImportNode,
      getCustomModuleImportNode,
      getTestingLibraryImportName,
      getCustomModuleImportName,
      isTestingLibraryImported,
      isValidFilename,
      isGetByQuery,
      isQueryByQuery,
      isFindByQuery,
      isSyncQuery,
      isAsyncQuery,
      isAsyncUtil,
      isFireEventMethod,
      isPresenceAssert,
      isAbsenceAssert,
      canReportErrors,
      findImportedUtilSpecifier,
      isNodeComingFromTestingLibrary,
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

        if (canReportErrors() && ruleInstructions[instruction]) {
          return ruleInstructions[instruction](node);
        }
      };
    });

    return enhancedRuleInstructions;
  };
}
