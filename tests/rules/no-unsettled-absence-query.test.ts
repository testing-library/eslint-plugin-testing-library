import rule from '../../src/rules/no-unsettled-absence-query';
import { createRuleTester } from '../test-utils';

import type {
	MessageIds,
	Options,
} from '../../src/rules/no-unsettled-absence-query';
import type {
	InvalidTestCase,
	ValidTestCase,
} from '@typescript-eslint/rule-tester';

const ruleTester = createRuleTester();

type RuleValidTestCase = ValidTestCase<Options>;
type RuleInvalidTestCase = InvalidTestCase<MessageIds, Options>;

const SUPPORTED_TESTING_FRAMEWORKS = [
	['@testing-library/react', 'React TL'],
	['@testing-library/vue', 'Vue TL'],
	['@testing-library/angular', 'Angular TL'],
] as const;

ruleTester.run('no-unsettled-absence-query', rule, {
	valid: [
		// -- Settled by findBy* --
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleValidTestCase>(
			([testingFramework, label]) => ({
				code: `// case: ${label} — settled by findBy
				import { render, screen } from '${testingFramework}'

				test('shows no error', async () => {
					render(<Component />)
					await screen.findByText('loaded')
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
				`,
			})
		),

		// -- Settled by waitFor --
		{
			code: `// case: settled by waitFor
			import { render, screen, waitFor } from '@testing-library/react'

			test('shows no error', async () => {
				render(<Component />)
				await waitFor(() => expect(something).toBe(true))
				expect(screen.queryByRole('alert')).not.toBeInTheDocument()
			})
			`,
		},

		// -- Settled by act --
		{
			code: `// case: settled by act wrapping render
			import { render, screen, act } from '@testing-library/react'

			test('shows no error', async () => {
				await act(() => render(<Component />))
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		// -- Settled by getBy* --
		{
			code: `// case: settled by getByText
			import { render, screen } from '@testing-library/react'

			test('shows no error', () => {
				render(<Component />)
				screen.getByText('visible heading')
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		// -- Settled by getBy* inside expect --
		{
			code: `// case: settled by getByRole inside expect assertion
			import { render, screen } from '@testing-library/react'

			test('shows no error', () => {
				render(<Component />)
				expect(screen.getByRole('heading')).toBeVisible()
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		// -- Settled by getAllBy* --
		{
			code: `// case: settled by getAllByText
			import { render, screen } from '@testing-library/react'

			test('shows no alerts', () => {
				render(<Component />)
				screen.getAllByText('item')
				expect(screen.queryByRole('alert')).not.toBeVisible()
			})
			`,
		},

		// -- .not.toBeVisible after settling --
		{
			code: `// case: .not.toBeVisible after findBy
			import { render, screen } from '@testing-library/react'

			test('dialog is hidden', async () => {
				render(<Component />)
				await screen.findByText('loaded')
				expect(screen.queryByRole('dialog')).not.toBeVisible()
			})
			`,
		},

		// -- Presence assertion is not flagged --
		{
			code: `// case: presence assertion — not an absence check
			import { render, screen } from '@testing-library/react'

			test('shows content', () => {
				render(<Component />)
				expect(screen.queryByText('exists')).toBeInTheDocument()
			})
			`,
		},

		// -- Non-absence matcher is not flagged --
		{
			code: `// case: .not with unrelated matcher
			import { render, screen } from '@testing-library/react'

			test('no active class', () => {
				render(<Component />)
				expect(screen.queryByText('item')).not.toHaveClass('active')
			})
			`,
		},

		// -- Non-Testing-Library import not reported --
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `// case: non-TL import — should not report
			import { render, screen } from 'other-library'

			test('not TL', () => {
				render(<Component />)
				expect(screen.queryByText('gone')).not.toBeInTheDocument()
			})
			`,
		},

		// -- Custom module import --
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `// case: custom module, settled
			import { render, screen } from 'test-utils'

			test('settled via custom module', async () => {
				render(<Component />)
				await screen.findByText('loaded')
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		// -- Destructured query after settling --
		{
			code: `// case: destructured queryByText after settling
			import { render } from '@testing-library/react'

			test('settled destructured', async () => {
				const { queryByText, findByText } = render(<Component />)
				await findByText('loaded')
				expect(queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},
	],

	invalid: [
		// -- Basic: absence before any settling --
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleInvalidTestCase>(
			([testingFramework, label]) => ({
				code: `// case: ${label} — absence before settling
				import { render, screen } from '${testingFramework}'

				test('shows no error', () => {
					render(<Component />)
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
				`,
				errors: [
					{
						messageId: 'noUnsettledAbsenceQuery',
						data: { queryMethod: 'queryByText' },
					},
				],
			})
		),

		// -- .not.toBeVisible before settling --
		{
			code: `// case: .not.toBeVisible before settling
			import { render, screen } from '@testing-library/react'

			test('dialog hidden', () => {
				render(<Component />)
				expect(screen.queryByRole('dialog')).not.toBeVisible()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByRole' },
				},
			],
		},

		// -- queryAllBy variant --
		{
			code: `// case: queryAllByText before settling
			import { render, screen } from '@testing-library/react'

			test('no alerts', () => {
				render(<Component />)
				expect(screen.queryAllByText('gone')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryAllByText' },
				},
			],
		},

		// -- Absence BEFORE the await (order matters) --
		{
			code: `// case: absence before await — order matters
			import { render, screen } from '@testing-library/react'

			test('shows no error', async () => {
				render(<Component />)
				expect(screen.queryByText('error')).not.toBeInTheDocument()
				await screen.findByText('loaded')
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},

		// -- Multiple unsettled absence assertions --
		{
			code: `// case: multiple absence assertions before settling
			import { render, screen } from '@testing-library/react'

			test('shows nothing', () => {
				render(<Component />)
				expect(screen.queryByText('a')).not.toBeInTheDocument()
				expect(screen.queryByText('b')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},

		// -- Absence inside awaited waitFor — still a ghost --
		{
			code: `// case: absence inside awaited waitFor
			import { render, screen, waitFor } from '@testing-library/react'

			test('shows no error', async () => {
				render(<Component />)
				await waitFor(() => {
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},

		// -- Absence inside unawaited waitFor — still a ghost --
		{
			code: `// case: absence inside unawaited waitFor
			import { render, screen, waitFor } from '@testing-library/react'

			test('shows no error', () => {
				render(<Component />)
				waitFor(() => {
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},

		// -- Custom module unsettled --
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `// case: custom module, unsettled
			import { render, screen } from 'test-utils'

			test('unsettled', () => {
				render(<Component />)
				expect(screen.queryByText('gone')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},

		// -- .toBeNull (non-negated absence) before settling --
		{
			code: `// case: .toBeNull before settling
			import { render, screen } from '@testing-library/react'

			test('is null', () => {
				render(<Component />)
				expect(screen.queryByText('error')).toBeNull()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},

		// -- .toBeFalsy (non-negated absence) before settling --
		{
			code: `// case: .toBeFalsy before settling
			import { render, screen } from '@testing-library/react'

			test('is falsy', () => {
				render(<Component />)
				expect(screen.queryByText('error')).toBeFalsy()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
				},
			],
		},
	],
});
