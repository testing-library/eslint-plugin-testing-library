import rule from '../../src/rules/prefer-top-level-configure';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/svelte',
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(rule.name, rule, {
	valid: [
		// top-level call is valid
		...SUPPORTED_TESTING_FRAMEWORKS.map((framework) => ({
			code: `
        import { configure } from '${framework}';
        configure({ asyncUtilTimeout: 5000 });
        test('passes', () => {});
      `,
		})),
		// inside beforeAll is valid
		...SUPPORTED_TESTING_FRAMEWORKS.map((framework) => ({
			code: `
        import { configure } from '${framework}';
        beforeAll(() => {
          configure({ asyncUtilTimeout: 5000 });
        });
        test('passes', () => {});
      `,
		})),
		// inside beforeEach is valid
		...SUPPORTED_TESTING_FRAMEWORKS.map((framework) => ({
			code: `
        import { configure } from '${framework}';
        beforeEach(() => {
          configure({ asyncUtilTimeout: 5000 });
        });
        test('passes', () => {});
      `,
		})),
		// configure from a non-TL import is not flagged
		{
			code: `
        import { configure } from 'some-other-library';
        test('passes', () => {
          configure({ something: true });
        });
      `,
		},
		// configure not imported at all — no TL import → not flagged
		{
			code: `
        test('passes', () => {
          configure({ something: true });
        });
      `,
		},
	],

	invalid: [
		// basic: configure inside test()
		...SUPPORTED_TESTING_FRAMEWORKS.map((framework) => ({
			code: `
        import { configure } from '${framework}';
        test('fails', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		})),
		// configure inside it()
		...SUPPORTED_TESTING_FRAMEWORKS.map((framework) => ({
			code: `
        import { configure } from '${framework}';
        it('fails', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		})),
		// configure inside test.each
		{
			code: `
        import { configure } from '@testing-library/react';
        test.each([1, 2])('fails %i', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// configure inside it.each
		{
			code: `
        import { configure } from '@testing-library/react';
        it.each([1, 2])('fails %i', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// configure inside test.only
		{
			code: `
        import { configure } from '@testing-library/react';
        test.only('fails', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// configure inside it.skip
		{
			code: `
        import { configure } from '@testing-library/react';
        it.skip('fails', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// configure nested in a helper function called inside a test
		{
			code: `
        import { configure } from '@testing-library/react';
        test('fails', () => {
          function setup() {
            configure({ asyncUtilTimeout: 5000 });
          }
          setup();
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// aliased import: import { configure as tlConfigure }
		{
			code: `
        import { configure as tlConfigure } from '@testing-library/react';
        test('fails', () => {
          tlConfigure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// xtest / xit variants
		{
			code: `
        import { configure } from '@testing-library/react';
        xtest('fails', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		{
			code: `
        import { configure } from '@testing-library/react';
        xit('fails', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
		// test.only.each — chained MemberExpression
		{
			code: `
        import { configure } from '@testing-library/react';
        test.only.each([1, 2])('fails %i', () => {
          configure({ asyncUtilTimeout: 5000 });
        });
      `,
			errors: [{ messageId: 'preferTopLevelConfigure' as const }],
		},
	],
});
