import { createRuleTester } from '../test-utils';
import { LIBRARY_MODULES } from '../../../lib/utils';
import rule, { RULE_NAME } from '../../../lib/rules/prefer-wait-for';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitFor, render } from '${libraryModule}';
      
      async () => {
        await waitFor(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitFor, render } = require('${libraryModule}');
      
      async () => {
        await waitFor(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitFor, render } from 'test-utils';
      
      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitFor, render } = require('test-utils');
      
      async () => {
        await waitFor(() => {});
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForElementToBeRemoved, render } from '${libraryModule}';
      
      async () => {
        await waitForElementToBeRemoved(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForElementToBeRemoved, render } = require('${libraryModule}');
      
      async () => {
        await waitForElementToBeRemoved(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForElementToBeRemoved, render } from 'test-utils';
      
      async () => {
        await waitForElementToBeRemoved(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForElementToBeRemoved, render } = require('test-utils');
      
      async () => {
        await waitForElementToBeRemoved(() => {});
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import * as testingLibrary from '${libraryModule}';
      
      async () => {
        await testingLibrary.waitForElementToBeRemoved(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const testingLibrary = require('${libraryModule}');
      
      async () => {
        await testingLibrary.waitForElementToBeRemoved(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import * as testingLibrary from 'test-utils';
      
      async () => {
        await testingLibrary.waitForElementToBeRemoved(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const testingLibrary = require('test-utils');
      
      async () => {
        await testingLibrary.waitForElementToBeRemoved(() => {});
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { render } from '${libraryModule}';
      import { waitForSomethingElse } from 'other-module';
      
      async () => {
        await waitForSomethingElse(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { render } = require('${libraryModule}');
      const { waitForSomethingElse } = require('other-module');
      
      async () => {
        await waitForSomethingElse(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { render } from 'test-utils';
      import { waitForSomethingElse } from 'other-module';
      
      async () => {
        await waitForSomethingElse(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { render } = require('test-utils');
      const { waitForSomethingElse } = require('other-module');
      
      async () => {
        await waitForSomethingElse(() => {});
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import * as testingLibrary from '${libraryModule}';
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const testingLibrary = require('${libraryModule}');
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import * as testingLibrary from 'test-utils';
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const testingLibrary = require('test-utils');
  
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
      code: `const { wait } = require('imNoTestingLibrary');

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
      code: `const foo = require('imNoTestingLibrary');

      async () => {
        await foo.wait();
      }`,
    },
    {
      code: `import * as foo from 'imNoTestingLibrary';
      cy.wait();
      `,
    },
    {
      code: `const foo = require('imNoTestingLibrary');
      cy.wait();
      `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: aggressive reporting disabled - method named same as invalid method
      // but not coming from Testing Library is valid
      import { wait as testingLibraryWait } from 'test-utils'
      import { wait } from 'somewhere-else'
      
      async () => {
        await wait();
      }
      `,
    },
    {
      // https://github.com/testing-library/eslint-plugin-testing-library/issues/145
      code: `import * as foo from 'imNoTestingLibrary';
        async function wait(): Promise<any> {
          // doesn't matter
        }
        
        function callsWait(): void {
          await wait();
        }
      `,
    },
    {
      // https://github.com/testing-library/eslint-plugin-testing-library/issues/145
      code: `const foo = require('imNoTestingLibrary');
        async function wait(): Promise<any> {
          // doesn't matter
        }
        
        function callsWait(): void {
          await wait();
        }
      `,
    },
  ],

  invalid: [
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { wait, render } from '${libraryModule}';
  
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
      output: `import { render,waitFor } from '${libraryModule}';
  
      async () => {
        await waitFor(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { wait, render } = require('${libraryModule}');
  
      async () => {
        await wait();
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,waitFor } = require('${libraryModule}');
  
      async () => {
        await waitFor(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { wait, render } from 'test-utils';
  
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
      output: `import { render,waitFor } from 'test-utils';
  
      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { wait, render } = require('test-utils');
  
      async () => {
        await wait();
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,waitFor } = require('test-utils');
  
      async () => {
        await waitFor(() => {});
      }`,
    },
    // namespaced wait should be fixed but not its import
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import * as testingLibrary from '${libraryModule}';
  
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
      output: `import * as testingLibrary from '${libraryModule}';
  
      async () => {
        await testingLibrary.waitFor(() => {});
      }`,
    })),
    // namespaced wait should be fixed but not its import
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const testingLibrary = require('${libraryModule}');
  
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
      output: `const testingLibrary = require('${libraryModule}');
  
      async () => {
        await testingLibrary.waitFor(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import * as testingLibrary from 'test-utils';
  
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
      output: `import * as testingLibrary from 'test-utils';
  
      async () => {
        await testingLibrary.waitFor(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const testingLibrary = require('test-utils');
  
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
      output: `const testingLibrary = require('test-utils');
  
      async () => {
        await testingLibrary.waitFor(() => {});
      }`,
    },
    // namespaced waitForDomChange should be fixed but not its import
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import * as testingLibrary from '${libraryModule}';
  
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
      output: `import * as testingLibrary from '${libraryModule}';
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    })),
    // namespaced waitForDomChange should be fixed but not its import
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const testingLibrary = require('${libraryModule}');
  
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
      output: `const testingLibrary = require('${libraryModule}');
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import * as testingLibrary from 'test-utils';
  
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
      output: `import * as testingLibrary from 'test-utils';
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const testingLibrary = require('test-utils');
  
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
      output: `const testingLibrary = require('test-utils');
  
      async () => {
        await testingLibrary.waitFor(() => {}, { timeout: 500 });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { render, wait } from '${libraryModule}'
  
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
      output: `import { render,waitFor } from '${libraryModule}';
  
      async () => {
        await waitFor(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { render, wait } = require('${libraryModule}');
  
      async () => {
        await wait(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,waitFor } = require('${libraryModule}');
  
      async () => {
        await waitFor(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { render, wait } from 'test-utils'
  
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
      output: `import { render,waitFor } from 'test-utils';
  
      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { render, wait } = require('test-utils');
  
      async () => {
        await wait(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,waitFor } = require('test-utils');
  
      async () => {
        await waitFor(() => {});
      }`,
    },
    // this import doesn't have trailing semicolon but fixer adds it
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { render, wait, screen } from "${libraryModule}";
  
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
      output: `import { render,screen,waitFor } from '${libraryModule}';
  
      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    })),
    // this import doesn't have trailing semicolon but fixer adds it
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { render, wait, screen } from "${libraryModule}";
  
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
      output: `import { render,screen,waitFor } from '${libraryModule}';
  
      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { render, wait, screen } from "test-utils";
  
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
      output: `import { render,screen,waitFor } from 'test-utils';
  
      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { render, wait, screen } = require('test-utils');
  
      async () => {
        await wait(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,screen,waitFor } = require('test-utils');
  
      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { render, waitForElement, screen } from '${libraryModule}'
  
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
      output: `import { render,screen,waitFor } from '${libraryModule}';
  
      async () => {
        await waitFor(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { render, waitForElement, screen } = require('${libraryModule}');
  
      async () => {
        await waitForElement(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,screen,waitFor } = require('${libraryModule}');
  
      async () => {
        await waitFor(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { render, waitForElement, screen } from 'test-utils'
  
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
      output: `import { render,screen,waitFor } from 'test-utils';
  
      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { render, waitForElement, screen } = require('test-utils');
  
      async () => {
        await waitForElement(() => {});
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,screen,waitFor } = require('test-utils');
  
      async () => {
        await waitFor(() => {});
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForElement } from '${libraryModule}';

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
      output: `import { waitFor } from '${libraryModule}';

      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForElement } = require('${libraryModule}');

      async () => {
        await waitForElement(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForElement } from 'test-utils';

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
      output: `import { waitFor } from 'test-utils';

      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForElement } = require('test-utils');

      async () => {
        await waitForElement(function cb() {
          doSomething();
        });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('test-utils');

      async () => {
        await waitFor(function cb() {
          doSomething();
        });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForDomChange } from '${libraryModule}';

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
      output: `import { waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {});
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForDomChange } = require('${libraryModule}');

      async () => {
        await waitForDomChange();
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {});
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForDomChange } from 'test-utils';

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
      output: `import { waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {});
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForDomChange } = require('test-utils');

      async () => {
        await waitForDomChange();
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {});
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForDomChange } from '${libraryModule}';

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
      output: `import { waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {}, mutationObserverOptions);
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForDomChange } = require('${libraryModule}');

      async () => {
        await waitForDomChange(mutationObserverOptions);
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {}, mutationObserverOptions);
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForDomChange } from 'test-utils';

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
      output: `import { waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {}, mutationObserverOptions);
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForDomChange } = require('test-utils');

      async () => {
        await waitForDomChange(mutationObserverOptions);
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {}, mutationObserverOptions);
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForDomChange } from '${libraryModule}';

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
      output: `import { waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForDomChange } = require('${libraryModule}');

      async () => {
        await waitForDomChange({ timeout: 5000 });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForDomChange } from 'test-utils';

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
      output: `import { waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForDomChange } = require('test-utils');

      async () => {
        await waitForDomChange({ timeout: 5000 });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForDomChange, wait, waitForElement } from '${libraryModule}';
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
      output: `import { waitFor } from '${libraryModule}';
      import userEvent from '@testing-library/user-event';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForDomChange, wait, waitForElement } = require('${libraryModule}');
      const userEvent = require('@testing-library/user-event');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { waitFor } = require('${libraryModule}');
      const userEvent = require('@testing-library/user-event');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForDomChange, wait, waitForElement } from 'test-utils';
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
      output: `import { waitFor } from 'test-utils';
      import userEvent from '@testing-library/user-event';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForDomChange, wait, waitForElement } = require('test-utils');
      const userEvent = require('@testing-library/user-event');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { waitFor } = require('test-utils');
      const userEvent = require('@testing-library/user-event');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { render, waitForDomChange, wait, waitForElement } from '${libraryModule}';

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
      output: `import { render,waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { render, waitForDomChange, wait, waitForElement } = require('${libraryModule}');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { render,waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { render, waitForDomChange, wait, waitForElement } from 'test-utils';

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
      output: `import { render,waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { render, waitForDomChange, wait, waitForElement } = require('test-utils');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { render,waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import { waitForDomChange, wait, render, waitForElement } from '${libraryModule}';

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
      output: `import { render,waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const { waitForDomChange, wait, render, waitForElement } = require('${libraryModule}');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { render,waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import { waitForDomChange, wait, render, waitForElement } from 'test-utils';

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
      output: `import { render,waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const { waitForDomChange, wait, render, waitForElement } = require('test-utils');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { render,waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `import {
        waitForDomChange,
        wait,
        render,
        waitForElement,
      } from '${libraryModule}';

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
      output: `import { render,waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `const {
        waitForDomChange,
        wait,
        render,
        waitForElement,
      } = require('${libraryModule}');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { render,waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `import {
        waitForDomChange,
        wait,
        render,
        waitForElement,
      } from 'test-utils';

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
      output: `import { render,waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `const {
        waitForDomChange,
        wait,
        render,
        waitForElement,
      } = require('test-utils');

      async () => {
        await waitForDomChange({ timeout: 5000 });
        await waitForElement();
        await wait();
        await wait(() => { doSomething() });
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
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
      output: `const { render,waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {}, { timeout: 5000 });
        await waitFor(() => {});
        await waitFor(() => {});
        await waitFor(() => { doSomething() });
      }`,
    },
    ...LIBRARY_MODULES.map((libraryModule) => ({
      // if already importing waitFor then it's not imported twice
      code: `import { wait, waitFor, render } from '${libraryModule}';

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
      output: `import { render,waitFor } from '${libraryModule}';

      async () => {
        await waitFor(() => {});
        await waitFor(someCallback);
      }`,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      // if already importing waitFor then it's not imported twice
      code: `const { wait, waitFor, render } = require('${libraryModule}');

      async () => {
        await wait();
        await waitFor(someCallback);
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,waitFor } = require('${libraryModule}');

      async () => {
        await waitFor(() => {});
        await waitFor(someCallback);
      }`,
    })),
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      // if already importing waitFor then it's not imported twice
      code: `import { wait, waitFor, render } from 'test-utils';

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
      output: `import { render,waitFor } from 'test-utils';

      async () => {
        await waitFor(() => {});
        await waitFor(someCallback);
      }`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      // if already importing waitFor then it's not imported twice
      code: `const { wait, waitFor, render } = require('test-utils');

      async () => {
        await wait();
        await waitFor(someCallback);
      }`,
      errors: [
        {
          messageId: 'preferWaitForRequire',
          line: 1,
          column: 7,
        },
        {
          messageId: 'preferWaitForMethod',
          line: 4,
          column: 15,
        },
      ],
      output: `const { render,waitFor } = require('test-utils');

      async () => {
        await waitFor(() => {});
        await waitFor(someCallback);
      }`,
    },
  ],
});
