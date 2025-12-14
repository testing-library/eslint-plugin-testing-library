import rule, { RULE_NAME } from '../../../lib/rules/prefer-user-event-setup';
import { USER_EVENT_METHODS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

import type { MessageIds } from '../../../lib/rules/prefer-user-event-setup';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
	valid: [
		// Using userEvent.setup() correctly
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					const user = userEvent.setup();
					await user.click(element);
				});
			`,
		},
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					const user = userEvent.setup();
					await user.type(input, 'hello');
					await user.click(button);
				});
			`,
		},
		// Setup function pattern
		{
			code: `
				import userEvent from '@testing-library/user-event';
				import { render } from '@testing-library/react';
				
				function setup(jsx) {
					return {
						user: userEvent.setup(),
						...render(jsx),
					};
				}
				
				test('example', async () => {
					const { user, getByRole } = setup(<MyComponent />);
					await user.click(getByRole('button'));
				});
			`,
		},
		// Different variable names
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					const myUser = userEvent.setup();
					await myUser.click(element);
				});
			`,
		},
		// Destructuring from setup function
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				function renderWithUser(component) {
					return {
						user: userEvent.setup(),
						component,
					};
				}
				
				test('example', async () => {
					const { user } = renderWithUser(<App />);
					await user.type(input, 'text');
				});
			`,
		},
		// All valid methods with setup (skip 'click' as it's already tested above)
		...USER_EVENT_METHODS.filter((m) => m !== 'click' && m !== 'type').map(
			(method) => ({
				code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					const user = userEvent.setup();
					await user.${method}(element);
				});
			`,
			})
		),
		// No userEvent import
		{
			code: `
				test('example', () => {
					fireEvent.click(element);
				});
			`,
		},
		// userEvent aliased
		{
			code: `
				import userEventLib from '@testing-library/user-event';
				
				test('example', async () => {
					const user = userEventLib.setup();
					await user.click(element);
				});
			`,
		},
		// Named import (if supported)
		{
			code: `
				import { userEvent } from '@testing-library/user-event';
				
				test('example', async () => {
					const user = userEvent.setup();
					await user.click(element);
				});
			`,
		},
	],

	invalid: [
		// Direct userEvent method calls
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					await userEvent.click(element);
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'click' },
				},
			],
		},
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					await userEvent.type(input, 'hello');
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'type' },
				},
			],
		},
		// Multiple direct calls
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					await userEvent.type(input, 'hello');
					await userEvent.click(button);
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'type' },
				},
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'click' },
				},
			],
		},
		// All methods should error when called directly (skip those already tested)
		...USER_EVENT_METHODS.filter((m) => m !== 'click' && m !== 'type').map(
			(method) => ({
				code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					await userEvent.${method}(element);
				});
			`,
				errors: [
					{
						messageId: 'preferUserEventSetup' as MessageIds,
						data: { method },
					},
				],
			})
		),
		// Aliased userEvent
		{
			code: `
				import userEventLib from '@testing-library/user-event';
				
				test('example', async () => {
					await userEventLib.click(element);
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'click' },
				},
			],
		},
		// Mixed correct and incorrect usage
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					const user = userEvent.setup();
					await user.click(button1);
					await userEvent.type(input, 'hello'); // This should error
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'type' },
				},
			],
		},
		// Named import with direct call
		{
			code: `
				import { userEvent } from '@testing-library/user-event';
				
				test('example', async () => {
					await userEvent.click(element);
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'click' },
				},
			],
		},
		// userEvent.setup() called but not used
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				test('example', async () => {
					userEvent.setup(); // setup called but result not used
					await userEvent.click(element);
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'click' },
				},
			],
		},
		// Direct calls in different scopes
		{
			code: `
				import userEvent from '@testing-library/user-event';
				
				describe('suite', () => {
					test('test 1', async () => {
						await userEvent.click(element);
					});
					
					test('test 2', async () => {
						const user = userEvent.setup();
						await user.type(input, 'hello'); // This is correct
						await userEvent.dblClick(element); // This should error
					});
				});
			`,
			errors: [
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'click' },
				},
				{
					messageId: 'preferUserEventSetup',
					data: { method: 'dblClick' },
				},
			],
		},
	],
});
