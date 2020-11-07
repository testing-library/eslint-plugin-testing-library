import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isIdentifier, isMemberExpression } from '../node-utils';

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

// maps fireEvent methods to userEvent. Those not found here, do not have an equivalet (yet)
export const MappingToUserEvent: Record<string, UserEventMethodsType[]> = {
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
  const allMethods = MappingToUserEvent[fireEventMethod].map(
    (method: string) => `userEvent.${method}()`
  );
  const { length } = allMethods;

  const init = length > 2 ? allMethods.slice(0, length - 2).join(', ') : '';
  const last = `${length > 1 ? ' or ' : ''}${allMethods[length - 1]}`;
  return `${init}${last}`;
}

const fireEventMappedMethods = Object.keys(MappingToUserEvent);

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
        'Prefer using {{userEventMethods}} over {{fireEventMethod}}()',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedMethods: { type: 'array' },
        },
      },
    ],
    fixable: null,
  },
  defaultOptions: [{ allowedMethods: [] }],

  create(context, [options], helpers) {
    const { allowedMethods } = options;
    const sourceCode = context.getSourceCode();

    return {
      ['CallExpression > MemberExpression'](node: TSESTree.MemberExpression) {
        const util = helpers.findImportedUtilSpecifier('fireEvent');
        const fireEventAliasOrWildcard = isIdentifier(util)
          ? util?.name
          : util?.local.name;

        if (!fireEventAliasOrWildcard) {
          // testing library was imported, but fireEvent was not imported
          return;
        }
        const fireEventUsed =
          isIdentifier(node.object) &&
          node.object.name === fireEventAliasOrWildcard;

        const fireEventFromWildcardUsed =
          isMemberExpression(node.object) &&
          isIdentifier(node.object.object) &&
          node.object.object.name === fireEventAliasOrWildcard &&
          isIdentifier(node.object.property) &&
          node.object.property.name === 'fireEvent';

        if (!fireEventUsed && !fireEventFromWildcardUsed) {
          // fireEvent was imported but it was not used
          return;
        }

        if (
          !isIdentifier(node.property) ||
          !fireEventMappedMethods.includes(node.property.name) ||
          allowedMethods.includes(node.property.name)
        ) {
          // the fire event does not have an equivalent in userEvent, or it's excluded
          return;
        }

        context.report({
          node,
          messageId: 'preferUserEvent',
          data: {
            userEventMethods: buildErrorMessage(node.property.name),
            fireEventMethod: sourceCode.getText(node),
          },
        });
      },
    };
  },
});
