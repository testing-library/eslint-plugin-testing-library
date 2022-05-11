import rule, {
  RULE_NAME,
} from '../../../lib/rules/no-wait-for-multiple-assertions';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
  '@testing-library/react',
  '@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        await waitFor(() => expect(a).toEqual('a'))
      `,
    },
    {
      code: `
        await waitFor(function() {
          expect(a).toEqual('a')
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// Aggressive Reporting disabled - module imported not matching
        import { waitFor } from 'somewhere-else'
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
    },
    ...SUPPORTED_TESTING_FRAMEWORKS.map((testingFramework) => ({
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// Aggressive Reporting disabled - waitFor renamed
        import { waitFor as renamedWaitFor } from '${testingFramework}'
        import { waitFor } from 'somewhere-else'
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
    })),
    // this needs to be check by other rule
    {
      code: `
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        await waitFor(() => {
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        await waitFor(function() {
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        await waitFor(() => {})
      `,
    },
    {
      code: `
        await waitFor(function() {})
      `,
    },
    {
      code: `
        await waitFor(() => {
          // testing
        })
      `,
    },
  ],
  invalid: [
    {
      code: `
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
      errors: [
        { line: 4, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    ...SUPPORTED_TESTING_FRAMEWORKS.map(
      (testingFramework) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `// Aggressive Reporting disabled
        import { waitFor } from '${testingFramework}'
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
          errors: [
            { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
          ],
        } as const)
    ),
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// Aggressive Reporting disabled
        import { waitFor as renamedWaitFor } from 'test-utils'
        await renamedWaitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
      errors: [
        { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    {
      code: `
        await waitFor(() => {
          expect(a).toEqual('a')
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
      errors: [
        { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    {
      code: `
        test('should whatever', async () => {
          await waitFor(() => {
            expect(a).toEqual('a')
            console.log('testing-library')
            expect(b).toEqual('b')
          })
        })
      `,
      errors: [
        { line: 6, column: 13, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    {
      code: `
        await waitFor(async () => {
          expect(a).toEqual('a')
          await somethingAsync()
          expect(b).toEqual('b')
        })
      `,
      errors: [
        { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    {
      code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
          expect(c).toEqual('c')
          expect(d).toEqual('d')
        })
      `,
      errors: [
        { line: 4, column: 11, messageId: 'noWaitForMultipleAssertion' },
        { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
        { line: 6, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    {
      code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
      errors: [
        { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
    {
      code: `
        await waitFor(async function() {
          expect(a).toEqual('a')
          const el = await somethingAsync()
          expect(b).toEqual('b')
        })
      `,
      errors: [
        { line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
      ],
    },
  ],
});
