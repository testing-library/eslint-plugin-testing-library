import rule, {
	MAPPING_TO_USER_EVENT,
	RULE_NAME,
	UserEventMethods,
} from '../../src/rules/prefer-user-event';
import { LIBRARY_MODULES } from '../../src/utils';
import { createRuleTester } from '../test-utils';

import type { MessageIds, Options } from '../../src/rules/prefer-user-event';
import type {
	InvalidTestCase,
	ValidTestCase,
} from '@typescript-eslint/rule-tester';

function createScenarioWithImport<
	T extends InvalidTestCase<MessageIds, Options> | ValidTestCase<Options>,
>(callback: (libraryModule: string, fireEventMethod: string) => T) {
	return LIBRARY_MODULES.reduce(
		(acc: Array<T>, libraryModule) =>
			acc.concat(
				Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) =>
					callback(libraryModule, fireEventMethod)
				)
			),
		[]
	);
}

const ruleTester = createRuleTester();

function formatUserEventMethodsMessage(fireEventMethod: string): string {
	const userEventMethods = MAPPING_TO_USER_EVENT[fireEventMethod].map(
		(methodName) => `userEvent.${methodName}`
	);
	let joinedList = '';

	for (let i = 0; i < userEventMethods.length; i++) {
		const item = userEventMethods[i];
		if (i === 0) {
			joinedList += item;
		} else if (i + 1 === userEventMethods.length) {
			joinedList += `, or ${item}`;
		} else {
			joinedList += `, ${item}`;
		}
	}

	return joinedList;
}

ruleTester.run(RULE_NAME, rule, {
	valid: [
		{
			code: `
        import { screen } from '@testing-library/user-event'
        const element = screen.getByText(foo)
      `,
		},
		{
			code: `
        const utils = render(baz)
        const element = utils.getByText(foo)
      `,
		},
		...UserEventMethods.map((userEventMethod) => ({
			code: `
        import userEvent from '@testing-library/user-event'
        const node = document.createElement(elementType)
        userEvent.${userEventMethod}(foo)
      `,
		})),
		...createScenarioWithImport<ValidTestCase<Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        import { fireEvent } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEvent.${fireEventMethod}(foo)
      `,
				options: [{ allowedMethods: [fireEventMethod] }],
			})
		),
		...createScenarioWithImport<ValidTestCase<Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        import { fireEvent as fireEventAliased } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEventAliased.${fireEventMethod}(foo)
      `,
				options: [{ allowedMethods: [fireEventMethod] }],
			})
		),
		...createScenarioWithImport<ValidTestCase<Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        import * as dom from '${libraryModule}'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
				options: [{ allowedMethods: [fireEventMethod] }],
			})
		),
		...LIBRARY_MODULES.map((libraryModule) => ({
			// imported fireEvent and not used,
			code: `
        import { fireEvent } from '${libraryModule}'
        import * as foo from 'someModule'
        foo.baz()
      `,
		})),
		...LIBRARY_MODULES.map((libraryModule) => ({
			// imported dom, but not using fireEvent
			code: `
        import * as dom from '${libraryModule}'
        const button = dom.screen.getByRole('button')
        const foo = dom.screen.container.querySelector('baz')
      `,
		})),
		...LIBRARY_MODULES.map((libraryModule) => ({
			code: `
        import { fireEvent as aliasedFireEvent } from '${libraryModule}'
        function fireEvent() {
          console.log('foo')
        }
        fireEvent()
    `,
		})),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { screen } from 'test-utils'
        const element = screen.getByText(foo)
      `,
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { render } from 'test-utils'
        const utils = render(baz)
        const element = utils.getByText(foo)
      `,
		},
		...UserEventMethods.map((userEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import userEvent from 'test-utils'
        const node = document.createElement(elementType)
        userEvent.${userEventMethod}(foo)
      `,
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod: string) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        // fireEvent method used but not imported from TL related module
        // (aggressive reporting opted out)
        import { fireEvent } from 'somewhere-else'
        fireEvent.${fireEventMethod}(foo)
      `,
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod: string) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      import { fireEvent } from 'test-utils'
      const node = document.createElement(elementType)
      fireEvent.${fireEventMethod}(foo)
    `,
			options: [{ allowedMethods: [fireEventMethod] }],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod: string) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      import { fireEvent as fireEventAliased } from 'test-utils'
      const node = document.createElement(elementType)
      fireEventAliased.${fireEventMethod}(foo)
    `,
			options: [{ allowedMethods: [fireEventMethod] }],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod: string) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      import * as dom from 'test-utils'
      dom.fireEvent.${fireEventMethod}(foo)
    `,
			options: [{ allowedMethods: [fireEventMethod] }],
		})),
		// edge case for coverage:
		// valid use case without call expression
		// so there is no innermost function scope found
		`
    import { fireEvent } from '@testing-library/react';
    test('edge case for no innermost function scope', () => {
      const click = fireEvent.click
    })
    `,
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent, createEvent } from 'test-utils'
        const event = createEvent.${fireEventMethod}(node)
        fireEvent(node, event)
      `,
			options: [{ allowedMethods: [fireEventMethod] }],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent as fireEventAliased, createEvent } from 'test-utils'
        fireEventAliased(node, createEvent.${fireEventMethod}(node))
      `,
			options: [{ allowedMethods: [fireEventMethod] }],
		})),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent, createEvent } from 'test-utils'
        const event = createEvent.drop(node)
        fireEvent(node, event)
      `,
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent, createEvent } from 'test-utils'
        const event = createEvent('drop', node)
        fireEvent(node, event)
      `,
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent as fireEventAliased, createEvent as createEventAliased } from 'test-utils'
        const event = createEventAliased.drop(node)
        fireEventAliased(node, event)
      `,
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      import { fireEvent as fireEventAliased, createEvent as createEventAliased } from 'test-utils'
        const event = createEventAliased('drop', node)
        fireEventAliased(node, event)
      `,
		},
		{
			code: `
        const createEvent = () => 'Event';
        const event = createEvent();
      `,
		},
	],
	invalid: [
		...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        import { fireEvent } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEvent.${fireEventMethod}(foo)
      `,
				errors: [
					{
						messageId: 'preferUserEvent',
						line: 4,
						column: 9,
						data: {
							userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
							fireEventMethod,
						},
					},
				],
			})
		),
		...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        import * as dom from '${libraryModule}'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
				errors: [
					{
						messageId: 'preferUserEvent',
						line: 3,
						column: 9,
						data: {
							userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
							fireEventMethod,
						},
					},
				],
			})
		),
		...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        const { fireEvent } = require('${libraryModule}')
        fireEvent.${fireEventMethod}(foo)
      `,
				errors: [
					{
						messageId: 'preferUserEvent',
						line: 3,
						column: 9,
						data: {
							userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
							fireEventMethod,
						},
					},
				],
			})
		),
		...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
			(libraryModule: string, fireEventMethod: string) => ({
				code: `
        const rtl = require('${libraryModule}')
        rtl.fireEvent.${fireEventMethod}(foo)
      `,
				errors: [
					{
						messageId: 'preferUserEvent',
						line: 3,
						column: 9,
						data: {
							userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
							fireEventMethod,
						},
					},
				],
			})
		),
		...Object.keys(MAPPING_TO_USER_EVENT).map(
			(fireEventMethod: string) =>
				({
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
        import * as dom from 'test-utils'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
					errors: [
						{
							messageId: 'preferUserEvent',
							line: 3,
							column: 9,
							data: {
								userEventMethods:
									formatUserEventMethodsMessage(fireEventMethod),
								fireEventMethod,
							},
						},
					],
				}) as const
		),
		...Object.keys(MAPPING_TO_USER_EVENT).map(
			(fireEventMethod: string) =>
				({
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
        import { fireEvent } from 'test-utils'
        fireEvent.${fireEventMethod}(foo)
      `,
					errors: [
						{
							messageId: 'preferUserEvent',
							line: 3,
							column: 9,
							data: {
								userEventMethods:
									formatUserEventMethodsMessage(fireEventMethod),
								fireEventMethod,
							},
						},
					],
				}) as const
		),
		...Object.keys(MAPPING_TO_USER_EVENT).map(
			(fireEventMethod: string) =>
				({
					code: `
        // same as previous group of test cases but without custom module set
        // (aggressive reporting)
        import { fireEvent } from 'test-utils'
        fireEvent.${fireEventMethod}(foo)
      `,
					errors: [
						{
							messageId: 'preferUserEvent',
							line: 5,
							column: 9,
							data: {
								userEventMethods:
									formatUserEventMethodsMessage(fireEventMethod),
								fireEventMethod,
							},
						},
					],
				}) as const
		),
		...Object.keys(MAPPING_TO_USER_EVENT).map(
			(fireEventMethod: string) =>
				({
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
        import { fireEvent as fireEventAliased } from 'test-utils'
        fireEventAliased.${fireEventMethod}(foo)
      `,
					errors: [
						{
							messageId: 'preferUserEvent',
							line: 3,
							column: 9,
							data: {
								userEventMethods:
									formatUserEventMethodsMessage(fireEventMethod),
								fireEventMethod,
							},
						},
					],
				}) as const
		),
		{
			code: ` // simple test to check error in detail
      import { fireEvent } from '@testing-library/react'

      fireEvent.click(element)
      fireEvent.mouseOut(element)
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 4,
					endLine: 4,
					column: 7,
					endColumn: 22,
					data: {
						userEventMethods:
							'userEvent.click, userEvent.type, userEvent.selectOptions, or userEvent.deselectOptions',
						fireEventMethod: 'click',
					},
				},
				{
					messageId: 'preferUserEvent',
					line: 5,
					endLine: 5,
					column: 7,
					endColumn: 25,
					data: {
						userEventMethods: 'userEvent.unhover',
						fireEventMethod: 'mouseOut',
					},
				},
			],
		},
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent, createEvent } from 'test-utils'

        fireEvent(node, createEvent('${fireEventMethod}', node))
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 4,
					column: 9,
					data: {
						userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
						fireEventMethod,
					},
				} as const,
			],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent, createEvent } from 'test-utils'

        fireEvent(node, createEvent.${fireEventMethod}(node))
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 4,
					column: 9,
					data: {
						userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
						fireEventMethod,
					},
				} as const,
			],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent, createEvent } from 'test-utils'
        const event = createEvent.${fireEventMethod}(node)
        fireEvent(node, event)
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 4,
					column: 9,
					data: {
						userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
						fireEventMethod,
					},
				} as const,
			],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent as fireEventAliased, createEvent as createEventAliased } from 'test-utils'
        const eventValid = createEventAliased.drop(node)
        fireEventAliased(node, eventValid)
        const eventInvalid = createEventAliased.${fireEventMethod}(node)
        fireEventAliased(node, eventInvalid)
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 6,
					column: 9,
					data: {
						userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
						fireEventMethod,
					},
				} as const,
			],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import * as dom from 'test-utils'
        const eventValid = dom.createEvent.drop(node)
        dom.fireEvent(node, eventValid)
        const eventInvalid = dom.createEvent.${fireEventMethod}(node)
        dom.fireEvent(node, eventInvalid)
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 6,
					column: 9,
					data: {
						userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
						fireEventMethod,
					},
				} as const,
			],
		})),
		...Object.keys(MAPPING_TO_USER_EVENT).map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import * as dom from 'test-utils'
        // valid event
        dom.fireEvent(node, dom.createEvent.drop(node))
        // invalid event
        dom.fireEvent(node, dom.createEvent.${fireEventMethod}(node))
      `,
			errors: [
				{
					messageId: 'preferUserEvent',
					line: 6,
					column: 9,
					data: {
						userEventMethods: formatUserEventMethodsMessage(fireEventMethod),
						fireEventMethod,
					},
				} as const,
			],
		})),
	],
});
