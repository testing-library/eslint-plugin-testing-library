'use strict';

const rule = require('../../../lib/rules/prefer-wait-for');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});
ruleTester.run('prefer-wait-for', rule, {
  valid: [
    {
      code: `import { waitFor, render } from '@testing-library/foo';
      
      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `import { waitForElementToBeRemoved, render } from '@testing-library/foo';
      
      async () => {
        await waitForElementToBeRemoved(() => {});
      }`,
    },
    {
      code: `import { render } from '@testing-library/foo';
      import { waitForSomethingElse } from 'other-module';
      
      async () => {
        await waitForSomethingElse(() => {});
      }`,
    },
  ],

  invalid: [
    {
      code: `import { wait, render } from '@testing-library/foo';

      async () => {
        await wait();
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { waitFor, render } from '@testing-library/foo';

      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `import { render, wait } from '@testing-library/foo'

      async () => {
        await wait(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { render, waitFor } from '@testing-library/foo'

      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `import { render, wait, screen } from '@testing-library/foo'

      async () => {
        await wait(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { render, waitFor, screen } from '@testing-library/foo'

      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    {
      code: `import { render, waitForElement, screen } from '@testing-library/foo'

      async () => {
        await waitForElement(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { render, waitFor, screen } from '@testing-library/foo'

      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `import { waitForElement } from '@testing-library/foo';

      async () => {
        await waitForElement(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    {
      code: `import { waitForDomChange } from '@testing-library/foo';

      async () => {
        await waitForDomChange();
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `import { waitForDomChange } from '@testing-library/foo';

      async () => {
        await waitForDomChange(mutationObserverOptions);
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {}, mutationObserverOptions);
      }`,
    },
    {
      code: `import { waitForDomChange } from '@testing-library/foo';

      async () => {
        await waitForDomChange({ timeout: 5000 });
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `import { waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
      }`,
    },
  ],
});
