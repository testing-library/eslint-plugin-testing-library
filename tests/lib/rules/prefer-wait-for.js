'use strict';

const rule = require('../../../lib/rules/prefer-wait-for');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});
ruleTester.run('prefer-wait-for', rule, {
  valid: [
    {
      code: `async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `async () => {
        await waitForElementToBeRemoved(() => {});
      }`,
    },
    {
      code: `async () => {
        await waitForSomethingElse(() => {});
      }`,
    },
    {
      code: `import { wait } from 'some-testing-library'`,
    },
    {
      code: `import { waitForElement } from 'some-testing-library'`,
    },
    {
      code: `import { waitForDomChange } from 'some-testing-library'`,
    },
  ],

  invalid: [
    {
      code: `async () => {
        await wait();
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `async () => {
        await wait(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `async () => {
        await wait(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    {
      code: `async () => {
        await waitForElement(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `async () => {
        await waitForElement(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    {
      code: `async () => {
        await waitForDomChange();
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `async () => {
        await waitForDomChange(mutationObserverOptions);
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(() => {}, mutationObserverOptions);
      }`,
    },
    {
      code: `async () => {
        await waitForDomChange({ options: true });
      }`,
      errors: [
        {
          messageId: 'preferWaitFor',
          line: 2,
          column: 15,
        },
      ],
      output: `async () => {
        await waitFor(() => {}, { options: true });
      }`,
    },
  ],
});
