import {
  TSESTree,
  ESLintUtils,
  ASTUtils,
} from '@typescript-eslint/experimental-utils';
import { getDocsUrl, ASYNC_QUERIES_VARIANTS } from '../utils';
import {
  isNewExpression,
  isImportSpecifier,
  isCallExpression,
} from '../node-utils';

export const RULE_NAME = 'no-promise-in-fire-event';
export type MessageIds = 'noPromiseInFireEvent';
type Options = [];

export default ESLintUtils.RuleCreator(getDocsUrl)<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of promises passed to a `fireEvent` method',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noPromiseInFireEvent:
        "A promise shouldn't be passed to a `fireEvent` method, instead pass the DOM element",
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    return {
      'ImportDeclaration[source.value=/testing-library/]'(
        node: TSESTree.ImportDeclaration
      ) {
        const fireEventImportNode = node.specifiers.find(
          (specifier) =>
            isImportSpecifier(specifier) &&
            specifier.imported &&
            'fireEvent' === specifier.imported.name
        ) as TSESTree.ImportSpecifier;

        const { references } = context.getDeclaredVariables(
          fireEventImportNode
        )[0];

        for (const reference of references) {
          const referenceNode = reference.identifier;
          const callExpression = referenceNode.parent
            .parent as TSESTree.CallExpression;
          const [element] = callExpression.arguments as TSESTree.Node[];
          if (isCallExpression(element) || isNewExpression(element)) {
            const methodName = ASTUtils.isIdentifier(element.callee)
              ? element.callee.name
              : ((element.callee as TSESTree.MemberExpression)
                  .property as TSESTree.Identifier).name;

            if (
              ASYNC_QUERIES_VARIANTS.some((q) => methodName.startsWith(q)) ||
              methodName === 'Promise'
            ) {
              context.report({
                node: element,
                messageId: 'noPromiseInFireEvent',
              });
            }
          }
        }
      },
    };
  },
});
