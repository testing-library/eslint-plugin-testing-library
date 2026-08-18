import rule from '../../src/rules/prefer-form-submission';
import { LIBRARY_MODULES } from '../../src/utils';
import { createRuleTester } from '../test-utils';

import type {
	MessageIds,
	Options,
} from '../../src/rules/prefer-form-submission';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

const ruleTester = createRuleTester();

const error = (line: number, column = 1) => ({
	messageId: 'preferFormSubmission' as const,
	line,
	column,
});

const invalid = (
	code: string,
	line: number,
	settings?: InvalidTestCase<MessageIds, Options>['settings']
): InvalidTestCase<MessageIds, Options> => {
	return {
		code: code.replace(/^\t+/gm, ''),
		errors: [error(line)],
		...(settings ? { settings } : {}),
	};
};

ruleTester.run(rule.name, rule, {
	valid: [
		`import { fireEvent } from '@testing-library/react';
		fireEvent.click(button);`,
		`import { render } from '@testing-library/react';
		const { container } = render(Component);
		container.querySelector('form').requestSubmit();`,
		`import { render, screen } from '@testing-library/react';
		import userEvent from '@testing-library/user-event';
		render(Component);
		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Submit' }));`,
		`import { render, screen } from '@testing-library/react';
		import userEvent from '@testing-library/user-event';
		test('does not submit an invalid form', async () => {
			const onSubmit = vi.fn();
			render(
				<form aria-label="profile" onSubmit={onSubmit}>
					<input required />
					<button type="submit">Save</button>
				</form>
			);
			const user = userEvent.setup();
			await user.click(screen.getByRole('button', { name: 'Save' }));
			expect(onSubmit).not.toHaveBeenCalled();
		});`,
		`import { render } from '@testing-library/react';
		const { container } = render(Component);
		container.dispatchEvent(new Event('change'));`,
		`import { fireEvent } from '@testing-library/react';
		// eslint-disable-next-line @rule-tester/prefer-form-submission -- verifies raw submit-listener behavior
		fireEvent.submit(form);`,
		`import { render } from '@testing-library/react';
		render(Component);
		// eslint-disable-next-line @rule-tester/prefer-form-submission -- verifies raw submit-listener behavior
		form.dispatchEvent(new SubmitEvent('submit'));`,
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `import { fireEvent } from 'somewhere-else';
			fireEvent.submit(form);`,
		},
	],
	invalid: [
		...LIBRARY_MODULES.map((libraryModule) =>
			invalid(
				`import { fireEvent } from '${libraryModule}';
				fireEvent.submit(form);`,
				2
			)
		),
		invalid(
			`import { fireEvent as trigger } from '@testing-library/react';
			trigger.submit(form);`,
			2
		),
		invalid(
			`import * as testingLibrary from '@testing-library/react';
			testingLibrary.fireEvent.submit(form);`,
			2
		),
		invalid(
			`const { fireEvent } = require('@testing-library/react');
			fireEvent.submit(form);`,
			2
		),
		invalid(
			`const testingLibrary = require('@testing-library/react');
			testingLibrary.fireEvent.submit(form);`,
			2
		),
		invalid(
			`import { fireEvent, createEvent } from '@testing-library/react';
			const event = createEvent.submit(form);
			fireEvent(form, event);`,
			3
		),
		invalid(
			`import { fireEvent as trigger } from '@testing-library/react';
			trigger(form, new SubmitEvent('submit'));`,
			2
		),
		invalid(
			`import * as testingLibrary from '@testing-library/react';
			testingLibrary.fireEvent(form, testingLibrary.createEvent.submit(form));`,
			2
		),
		invalid(
			`const { fireEvent, createEvent } = require('@testing-library/react');
			fireEvent(form, createEvent.submit(form));`,
			2
		),
		invalid(
			`import { render } from '@testing-library/react';
			render(Component);
			form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));`,
			3
		),
		invalid(
			`import { render } from '@testing-library/react';
			const event = new SubmitEvent(\`submit\`, { bubbles: true, cancelable: true });
			form.dispatchEvent(event);`,
			3
		),
		invalid(
			`import { render } from '@testing-library/react';
			form.dispatchEvent(new window.Event('submit'));`,
			2
		),
		invalid(
			`import { fireEvent, render, screen } from '@testing-library/react';
			test('submits the form', () => {
				const onSubmit = vi.fn();
				render(
					<form aria-label="profile" onSubmit={onSubmit}>
						<input required />
						<button type="submit">Save</button>
					</form>
				);
				fireEvent.submit(screen.getByRole('form'));
				expect(onSubmit).toHaveBeenCalled();
			});`,
			10
		),
		invalid(
			`import { fireEvent as trigger, renderWithProviders } from 'test-utils';
			renderWithProviders(Component);
			trigger.submit(form);`,
			3,
			{
				'testing-library/utils-module': 'test-utils',
				'testing-library/custom-renders': ['renderWithProviders'],
			}
		),
		invalid(
			`const testingLibrary = require('test-utils');
			testingLibrary.fireEvent.submit(form);`,
			2,
			{
				'testing-library/utils-module': 'test-utils',
			}
		),
		invalid(`fireEvent.submit(form);`, 1),
		invalid(`form.dispatchEvent(new Event('submit'));`, 1),
	],
});
