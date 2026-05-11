import rule from '../../src/rules/no-test-id-queries';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
	'shadow-dom-testing-library',
];

const QUERIES = [
	'getByTestId',
	'queryByTestId',
	'getAllByTestId',
	'queryAllByTestId',
	'findByTestId',
	'findAllByTestId',
];

const createInvalidTestCase = (framework: string, query: string) => {
	return [
		{
			code: `
					import { render } from '${framework}';

					test('test', async () => {
						const { ${query} } = render(<MyComponent />);

						expect(${query}('my-test-id')).toBeInTheDocument();
					});
				`,
			errors: [
				{
					messageId: 'noTestIdQueries',
					line: 7,
					column: 14,
				},
			],
		},
		{
			code: `
					import { render, screen } from '${framework}';

					test('test', async () => {
						render(<MyComponent />);

						expect(screen.${query}('my-test-id')).toBeInTheDocument();
					});
				`,
			errors: [
				{
					messageId: 'noTestIdQueries',
					line: 7,
					column: 14,
				},
			],
		},
	] as const;
};

ruleTester.run(rule.name, rule, {
	valid: [
		`
		import { render } from '@testing-library/react';

		test('test', async () => {
			const { getByRole } = render(<MyComponent />);

			expect(getByRole('button')).toBeInTheDocument();
		});
		`,

		`
		import { render } from '@testing-library/react';

		test('test', async () => {
			render(<MyComponent />);

			expect(getTestId('button')).toBeInTheDocument();
		});
		`,
	],

	invalid: [
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((framework) =>
			QUERIES.flatMap((query) => createInvalidTestCase(framework, query))
		),
		// special cases for shadow-dom-testing-library
		...[
			'getByShadowTestId',
			'queryByShadowTestId',
			'getAllByShadowTestId',
			'queryAllByShadowTestId',
			'findByShadowTestId',
			'findAllByShadowTestId',
		].flatMap((query) =>
			createInvalidTestCase('shadow-dom-testing-library', query)
		),
	],
});
