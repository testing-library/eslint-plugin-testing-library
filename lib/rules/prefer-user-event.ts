import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import { findClosestCallExpressionNode } from '../node-utils';

export const RULE_NAME = 'prefer-user-event';

export type MessageIds = 'preferUserEvent';
export type Options = [{ allowedMethods: string[] }];

export const UserEventMethods = [
  'click',
  'dblClick',
  'type',
  'upload',
  'clear',
  'selectOptions',
  'deselectOptions',
  'tab',
  'hover',
  'unhover',
  'paste',
] as const;
type UserEventMethodsType = typeof UserEventMethods[number];

// maps fireEvent methods to userEvent. Those not found here, do not have an equivalent (yet)
export const MAPPING_TO_USER_EVENT: Record<string, UserEventMethodsType[]> = {
  click: ['click', 'type', 'selectOptions', 'deselectOptions'],
  change: ['upload', 'type', 'clear', 'selectOptions', 'deselectOptions'],
  dblClick: ['dblClick'],
  input: ['type', 'upload', 'selectOptions', 'deselectOptions', 'paste'],
  keyDown: ['type', 'tab'],
  keyPress: ['type'],
  keyUp: ['type', 'tab'],
  mouseDown: ['click', 'dblClick', 'selectOptions', 'deselectOptions'],
  mouseEnter: ['hover', 'selectOptions', 'deselectOptions'],
  mouseLeave: ['unhover'],
  mouseMove: ['hover', 'unhover', 'selectOptions', 'deselectOptions'],
  mouseOut: ['unhover'],
  mouseOver: ['hover', 'selectOptions', 'deselectOptions'],
  mouseUp: ['click', 'dblClick', 'selectOptions', 'deselectOptions'],
  paste: ['paste'],
  pointerDown: ['click', 'dblClick', 'selectOptions', 'deselectOptions'],
  pointerEnter: ['hover', 'selectOptions', 'deselectOptions'],
  pointerLeave: ['unhover'],
  pointerMove: ['hover', 'unhover', 'selectOptions', 'deselectOptions'],
  pointerOut: ['unhover'],
  pointerOver: ['hover', 'selectOptions', 'deselectOptions'],
  pointerUp: ['click', 'dblClick', 'selectOptions', 'deselectOptions'],
};

function buildErrorMessage(fireEventMethod: string) {
  const userEventMethods = MAPPING_TO_USER_EVENT[fireEventMethod].map(
    (methodName) => `userEvent.${methodName}`
  );

  // TODO: when min node version is 13, we can reimplement this using `Intl.ListFormat`
  return userEventMethods.join(', ').replace(/, ([a-zA-Z.]+)$/, ', or $1');
}

const fireEventMappedMethods = Object.keys(MAPPING_TO_USER_EVENT);

export default createTestingLibraryRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using userEvent over fireEvent',
      category: 'Best Practices',
      recommended: 'warn',
    },
    messages: {
      preferUserEvent:
        'Prefer using {{userEventMethods}} over fireEvent.{{fireEventMethod}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedMethods: { type: 'array' },
        },
      },
    ],
  },
  defaultOptions: [{ allowedMethods: [] }],

  create(context, [options], helpers) {
    const { allowedMethods } = options;

    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (!helpers.isFireEventMethod(node)) {
          return;
        }

        const closestCallExpression = findClosestCallExpressionNode(node, true);

        if (!closestCallExpression) {
          return;
        }

        const fireEventMethodName: string = node.name;

        if (
          !fireEventMappedMethods.includes(fireEventMethodName) ||
          allowedMethods.includes(fireEventMethodName)
        ) {
          return;
        }

        context.report({
          node: closestCallExpression.callee,
          messageId: 'preferUserEvent',
          data: {
            userEventMethods: buildErrorMessage(fireEventMethodName),
            fireEventMethod: fireEventMethodName,
          },
        });
      },
    };
  },
});
