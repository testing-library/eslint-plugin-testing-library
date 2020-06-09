import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/prefer-wait-for';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
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
      code: `import * as testingLibrary from '@testing-library/foo';
      
      async () => {
        await testingLibrary.waitForElementToBeRemoved(() => {});
      }`,
    },
    {
      code: `import { render } from '@testing-library/foo';
      import { waitForSomethingElse } from 'other-module';
      
      async () => {
        await waitForSomethingElse(() => {});
      }`,
    },
    {
      code: `import * as testingLibrary from '@testing-library/foo';

      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    },
    {
      code: `import { wait } from 'imNoTestingLibrary';

      async () => {
        await wait();
      }`,
    },
    {
      code: `import * as foo from 'imNoTestingLibrary';

      async () => {
        await foo.wait();
      }`,
    },
    {
      code: `
      cy.wait();
      `,
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
      output: `import { render,waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {});
      }`,
    },
    // namespaced wait should be fixed but not its import
    {
      code: `import * as testingLibrary from '@testing-library/foo';

      async () => {
        await testingLibrary.wait();
      }`,
      errors: [
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 30,
        },
      ],
      output: `import * as testingLibrary from '@testing-library/foo';

      async () => {
        await testingLibrary.waitFor(() => {});
      }`,
    },
    // namespaced waitForDomChange should be fixed but not its import
    {
      code: `import * as testingLibrary from '@testing-library/foo';

      async () => {
        await testingLibrary.waitForDomChange({ timeout: 500 });
      }`,
      errors: [
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 30,
        },
      ],
      output: `import * as testingLibrary from '@testing-library/foo';

      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    },
    {
      // this import doesn't have trailing semicolon but fixer adds it
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
      output: `import { render,waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      code: `import { render, wait, screen } from "@testing-library/foo";

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
      output: `import { render,screen,waitFor } from '@testing-library/foo';

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
      output: `import { render,screen,waitFor } from '@testing-library/foo';

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
    {
      code: `import { waitForDomChange, wait, waitForElement } from '@testing-library/foo';
      import userEvent from '@testing-library/user-event';

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 5,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 6,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 7,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 8,
          column: 15,
        },
      ],
      output: `import { waitFor } from '@testing-library/foo';
      import userEvent from '@testing-library/user-event';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      code: `import { render, waitForDomChange, wait, waitForElement } from '@testing-library/foo';

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
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
        {
          messageId: 'preferWaitForMethod',
          line: 5,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 6,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 7,
          column: 15,
        },
      ],
      output: `import { render,waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      code: `import { waitForDomChange, wait, render, waitForElement } from '@testing-library/foo';

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
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
        {
          messageId: 'preferWaitForMethod',
          line: 5,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 6,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 7,
          column: 15,
        },
      ],
      output: `import { render,waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      code: `import {
        waitForDomChange,
        wait,
        render,
        waitForElement,
      } from '@testing-library/foo';

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForImport',
          line: 1,
          column: 1,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 9,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 10,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 11,
          column: 15,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 12,
          column: 15,
        },
      ],
      output: `import { render,waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      // if already importing waitFor then it's not imported twice
      code: `import { wait, waitFor, render } from '@testing-library/foo';

      async () => {
        await wait();
        await waitFor(someCallback);
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
      output: `import { render,waitFor } from '@testing-library/foo';

      async () => {
        await waitFor(() => {});
        await waitFor(someCallback);
      }`,
    },
  ],
});
