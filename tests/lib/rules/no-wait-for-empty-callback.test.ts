import rule, { RULE_NAME } from '../../../lib/rules/no-wait-for-empty-callback';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const ALL_WAIT_METHODS = ['waitFor', 'waitForElementToBeRemoved'];
const SUPPORTED_TESTING_FRAMEWORKS = [
  '@testing-library/dom',
  '@testing-library/angular',
  '@testing-library/react',
  '@testing-library/vue',
  '@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(() => {
          screen.getByText(/submit/i)
        })`,
    })),
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(function() {
          screen.getByText(/submit/i)
        })`,
    })),
    {
      code: `waitForElementToBeRemoved(someNode)`,
    },
    {
      code: `waitForElementToBeRemoved(() => someNode)`,
    },
    {
      code: `waitSomethingElse(() => {})`,
    },
    {
      code: `wait(() => {})`,
    },
    {
      code: `wait(noop)`,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else'
        waitFor(() => {})
      `,
    },
    ...SUPPORTED_TESTING_FRAMEWORKS.map((testingFramework) => ({
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor as renamedWaitFor } from '${testingFramework}'
        import { waitFor } from 'somewhere-else'
        waitFor(() => {})
      `,
    })),
  ],

  invalid: [
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}(() => {})`,
          errors: [
            {
              line: 1,
              column: 8 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `
        import { ${m} } from 'test-utils';
        ${m}(() => {});
      `,
          errors: [
            {
              line: 3,
              column: 16 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),
    ...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) =>
      ALL_WAIT_METHODS.map(
        (m) =>
          ({
            code: `
        import { ${m} } from '${testingFramework}';
        ${m}(() => {});
      `,
            errors: [
              {
                line: 3,
                column: 16 + m.length,
                messageId: 'noWaitForEmptyCallback',
                data: {
                  methodName: m,
                },
              },
            ],
          } as const)
      )
    ),
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `
        import { ${m} as renamedAsyncUtil } from 'test-utils';
        renamedAsyncUtil(() => {});
      `,
          errors: [
            {
              line: 3,
              column: 32,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: 'renamedAsyncUtil',
              },
            },
          ],
        } as const)
    ),
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}((a, b) => {})`,
          errors: [
            {
              line: 1,
              column: 12 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}(() => { /* I'm empty anyway */ })`,
          errors: [
            {
              line: 1,
              column: 8 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),

    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}(function() {

      })`,
          errors: [
            {
              line: 1,
              column: 13 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}(function(a) {

      })`,
          errors: [
            {
              line: 1,
              column: 14 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),
    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}(function() {
        // another empty callback
      })`,
          errors: [
            {
              line: 1,
              column: 13 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),

    ...ALL_WAIT_METHODS.map(
      (m) =>
        ({
          code: `${m}(noop)`,
          errors: [
            {
              line: 1,
              column: 2 + m.length,
              messageId: 'noWaitForEmptyCallback',
              data: {
                methodName: m,
              },
            },
          ],
        } as const)
    ),
  ],
});
