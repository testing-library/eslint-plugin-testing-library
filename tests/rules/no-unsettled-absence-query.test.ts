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
	['@testing-library/dom', 'DOM TL'],
	['@testing-library/react', 'React TL'],
	['@testing-library/vue', 'Vue TL'],
	['@testing-library/angular', 'Angular TL'],
	['@marko/testing-library', 'Marko TL'],
] as const;

ruleTester.run('no-unsettled-absence-query', rule, {
	valid: [
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleValidTestCase>(
			([testingFramework, label]) => ({
				code: `
				import { render, screen } from '${testingFramework}'

				test('${label} - settled by findBy', async () => {
					render(<Component />)
					await screen.findByText('loaded')
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
				`,
			})
		),

		{
			code: `
			import { render, screen, waitFor } from '@testing-library/react'

			test('settled by waitFor', async () => {
				render(<Component />)
				await waitFor(() => expect(something).toBe(true))
				expect(screen.queryByRole('alert')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen, act } from '@testing-library/react'

			test('settled by act wrapping render', async () => {
				await act(() => render(<Component />))
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('settled by getByText', () => {
				render(<Component />)
				screen.getByText('visible heading')
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('settled by getByRole inside expect', () => {
				render(<Component />)
				expect(screen.getByRole('heading')).toBeVisible()
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('settled by getAllByText', () => {
				render(<Component />)
				screen.getAllByText('item')
				expect(screen.queryByRole('alert')).not.toBeVisible()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('.not.toBeVisible after findBy', async () => {
				render(<Component />)
				await screen.findByText('loaded')
				expect(screen.queryByRole('dialog')).not.toBeVisible()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('presence assertion is not flagged', () => {
				render(<Component />)
				expect(screen.queryByText('exists')).toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('.not with unrelated matcher is not flagged', () => {
				render(<Component />)
				expect(screen.queryByText('item')).not.toHaveClass('active')
			})
			`,
		},

		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
			import { render, screen } from 'other-library'

			test('non-TL import is not reported', () => {
				render(<Component />)
				expect(screen.queryByText('gone')).not.toBeInTheDocument()
			})
			`,
		},

		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
			import { render, screen } from 'test-utils'

			test('custom module settled', async () => {
				render(<Component />)
				await screen.findByText('loaded')
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render } from '@testing-library/react'

			test('destructured queryByText after settling', async () => {
				const { queryByText, findByText } = render(<Component />)
				await findByText('loaded')
				expect(queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('standalone queryBy without expect', () => {
				render(<Component />)
				const el = screen.queryByText('error')
			})
			`,
		},

		{
			code: `
			import { screen } from '@testing-library/react'

			expect(screen.queryByText('error')).not.toBeInTheDocument()
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('settled inside function expression', async function() {
				render(<Component />)
				await screen.findByText('loaded')
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('settled by await nested inside expect arguments', async () => {
				render(<Component />)
				expect(await screen.findByText('loaded')).toBeInTheDocument()
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
		},
	],

	invalid: [
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleInvalidTestCase>(
			([testingFramework, label]) => ({
				code: `
				import { render, screen } from '${testingFramework}'

				test('${label} - absence before settling', () => {
					render(<Component />)
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
				`,
				errors: [
					{
						messageId: 'noUnsettledAbsenceQuery',
						data: { queryMethod: 'queryByText' },
						line: 6,
						column: 20,
					},
				],
			})
		),

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('.not.toBeVisible before settling', () => {
				render(<Component />)
				expect(screen.queryByRole('dialog')).not.toBeVisible()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByRole' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('queryAllByText before settling', () => {
				render(<Component />)
				expect(screen.queryAllByText('gone')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryAllByText' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('absence before await - order matters', async () => {
				render(<Component />)
				expect(screen.queryByText('error')).not.toBeInTheDocument()
				await screen.findByText('loaded')
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('multiple absence assertions before settling', () => {
				render(<Component />)
				expect(screen.queryByText('a')).not.toBeInTheDocument()
				expect(screen.queryByText('b')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 6,
					column: 19,
				},
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 7,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen, waitFor } from '@testing-library/react'

			test('absence inside awaited waitFor', async () => {
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
					line: 7,
					column: 20,
				},
			],
		},

		{
			code: `
			import { render, screen, waitFor } from '@testing-library/react'

			test('absence inside unawaited waitFor', () => {
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
					line: 7,
					column: 20,
				},
			],
		},

		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
			import { render, screen } from 'test-utils'

			test('custom module unsettled', () => {
				render(<Component />)
				expect(screen.queryByText('gone')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('.toBeNull before settling', () => {
				render(<Component />)
				expect(screen.queryByText('error')).toBeNull()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('.toBeFalsy before settling', () => {
				render(<Component />)
				expect(screen.queryByText('error')).toBeFalsy()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen, waitFor } from '@testing-library/react'

			test('absence inside waitFor with function expression callback', async () => {
				render(<Component />)
				await waitFor(function() {
					expect(screen.queryByText('error')).not.toBeInTheDocument()
				})
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 7,
					column: 20,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('unsettled in function expression', function() {
				render(<Component />)
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 6,
					column: 19,
				},
			],
		},

		{
			code: `
			import { render, screen } from '@testing-library/react'

			test('await inside nested function does not settle outer scope', () => {
				render(<Component />)
				const helper = async () => { await screen.findByText('loaded') }
				expect(screen.queryByText('error')).not.toBeInTheDocument()
			})
			`,
			errors: [
				{
					messageId: 'noUnsettledAbsenceQuery',
					data: { queryMethod: 'queryByText' },
					line: 7,
					column: 19,
				},
			],
		},
	],
});
