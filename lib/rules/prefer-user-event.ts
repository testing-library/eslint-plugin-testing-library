import { TSESTree, ASTUtils } from '@typescript-eslint/experimental-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
  findClosestCallExpressionNode,
  isCallExpression,
  isMemberExpression,
} from '../node-utils';

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
      description:
        'Suggest using `userEvent` over `fireEvent` for simulating user interactions',
      recommendedConfig: {
        dom: false,
        angular: false,
        react: false,
        vue: false,
      },
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
    const createEventVariables: Record<string, string | undefined> = {};

    const isfireEventMethodAllowed = (methodName: string) =>
      !fireEventMappedMethods.includes(methodName) ||
      allowedMethods.includes(methodName);

    const getFireEventMethodName = (
      callExpressionNode: TSESTree.CallExpression,
      node: TSESTree.Identifier
    ) => {
      if (
        !ASTUtils.isIdentifier(callExpressionNode.callee) &&
        !isMemberExpression(callExpressionNode.callee)
      ) {
        return node.name;
      }
      const secondArgument = callExpressionNode.arguments[1];
      if (
        ASTUtils.isIdentifier(secondArgument) &&
        createEventVariables[secondArgument.name] !== undefined
      ) {
        return createEventVariables[secondArgument.name];
      }
      if (
        !isCallExpression(secondArgument) ||
        !helpers.isCreateEventUtil(secondArgument)
      ) {
        return node.name;
      }
      if (ASTUtils.isIdentifier(secondArgument.callee)) {
        // createEvent('click', foo)
        return (secondArgument.arguments[0] as TSESTree.Literal)
          .value as string;
      }
      // createEvent.click(foo)
      return (
        (secondArgument.callee as TSESTree.MemberExpression)
          .property as TSESTree.Identifier
      ).name;
    };
    return {
      'CallExpression Identifier'(node: TSESTree.Identifier) {
        if (!helpers.isFireEventMethod(node)) {
          return;
        }
        const closestCallExpression = findClosestCallExpressionNode(node, true);

        if (!closestCallExpression) {
          return;
        }

        const fireEventMethodName = getFireEventMethodName(
          closestCallExpression,
          node
        );

        if (
          !fireEventMethodName ||
          isfireEventMethodAllowed(fireEventMethodName)
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

      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          !isCallExpression(node.init) ||
          !helpers.isCreateEventUtil(node.init) ||
          !ASTUtils.isIdentifier(node.id)
        ) {
          return;
        }
        let fireEventMethodName = '';
        if (
          isMemberExpression(node.init.callee) &&
          ASTUtils.isIdentifier(node.init.callee.property)
        ) {
          fireEventMethodName = node.init.callee.property.name;
        } else if (node.init.arguments.length > 0) {
          fireEventMethodName = (node.init.arguments[0] as TSESTree.Literal)
            .value as string;
        }
        if (!isfireEventMethodAllowed(fireEventMethodName)) {
          createEventVariables[node.id.name] = fireEventMethodName;
        }
      },
    };
  },
});
