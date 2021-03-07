import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/await-async-utils';
import { ASYNC_UTILS } from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util directly waited with await operator is valid', async () => {
          doSomethingElse();
          await ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util promise saved in var and waited with await operator is valid', async () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
          await aPromise;
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util directly chained with then is valid', () => {
          doSomethingElse();
          ${asyncUtil}(() => getByLabelText('email')).then(() => { console.log('done') });
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util promise saved in var and chained with then is valid', () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
          aPromise.then(() => { console.log('done') });
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util directly returned in arrow function is valid', async () => {
          const makeCustomWait = () =>
            ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util explicitly returned in arrow function is valid', async () => {
          const makeCustomWait = () => {
            return ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
          };
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util returned in regular function is valid', async () => {
          function makeCustomWait() {
            return ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
          }
        });
      `,
    })),

    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util promise saved in var and returned in function is valid', async () => {
          const makeCustomWait = () => {
            const aPromise =  ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
            
            doSomethingElse();
            
            return aPromise;
          };
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test(
        'aggressive reporting disabled - util "${asyncUtil}" which is not related to testing library is valid',
        async () => {
          doSomethingElse();
          ${asyncUtil}();
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import * as asyncUtils from 'some-other-library';
        test(
        'aggressive reporting disabled - util "asyncUtils.${asyncUtil}" which is not related to testing library is valid',
        async () => {
          doSomethingElse();
          asyncUtils.${asyncUtil}();
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util used in with Promise.all() is valid', async () => {
          await Promise.all([
            ${asyncUtil}(callback1),
            ${asyncUtil}(callback2),
          ]);
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util used in with Promise.all() with an await is valid', async () => {
          await Promise.all([
            await ${asyncUtil}(callback1),
            await ${asyncUtil}(callback2),
          ]);
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util used in with Promise.all() with ".then" is valid', async () => {
          Promise.all([
            ${asyncUtil}(callback1),
            ${asyncUtil}(callback2),
          ]).then(() => console.log('foo'));
        });
      `,
    })),
    {
      code: `
        import { waitFor, waitForElementToBeRemoved } from '@testing-library/dom';
        test('combining different async methods with Promise.all does not throw an error', async () => {
          await Promise.all([
            waitFor(() => getByLabelText('email')),
            waitForElementToBeRemoved(() => document.querySelector('div.getOuttaHere')),
          ])
        });
      `,
    },
    {
      code: `
        import { waitForElementToBeRemoved } from '@testing-library/dom';
        test('waitForElementToBeRemoved receiving element rather than callback is valid', async () => {
          doSomethingElse();
          const emailInput = getByLabelText('email');
          await waitForElementToBeRemoved(emailInput);
        });
      `,
    },
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util used in Promise.allSettled + await expression is valid', async () => {
          await Promise.allSettled([
            ${asyncUtil}(callback1),
            ${asyncUtil}(callback2),
          ]);
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util used in Promise.allSettled + then method is valid', async () => {
          Promise.allSettled([
            ${asyncUtil}(callback1),
            ${asyncUtil}(callback2),
          ]).then(() => {})
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        
        function waitForSomethingAsync() {
          return ${asyncUtil}(() => somethingAsync())
        }

        test('handled promise from function wrapping ${asyncUtil} util is valid', async () => {
          await waitForSomethingAsync()
        });
      `,
    })),
    {
      code: `
      test('using unrelated promises with Promise.all is valid', async () => {
        Promise.all([
          waitForNotRelatedToTestingLibrary(),
          promise1,
          await foo().then(() => baz())
        ])
      })
      `,
    },

    // edge case for coverage
    // valid async query usage without any function defined
    // so there is no innermost function scope found
    `
    import { waitFor } from '@testing-library/dom';
    test('edge case for no innermost function scope', () => {
      const foo = waitFor
    })
    `,
  ],
  invalid: [
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util not waited is invalid', () => {
          doSomethingElse();
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [{ line: 5, column: 11, messageId: 'awaitAsyncUtil' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtil from '@testing-library/dom';
        test('asyncUtil.${asyncUtil} util not handled is invalid', () => {
          doSomethingElse();
          asyncUtil.${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [{ line: 5, column: 21, messageId: 'awaitAsyncUtil' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('${asyncUtil} util promise saved not handled is invalid', () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [{ line: 5, column: 28, messageId: 'awaitAsyncUtil' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('several ${asyncUtil} utils not handled are invalid', () => {
          const aPromise = ${asyncUtil}(() => getByLabelText('username'));
          doSomethingElse(aPromise);
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [
        { line: 4, column: 28, messageId: 'awaitAsyncUtil' },
        { line: 6, column: 11, messageId: 'awaitAsyncUtil' },
      ],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil}, render } from '@testing-library/dom';
        
        function waitForSomethingAsync() {
          return ${asyncUtil}(() => somethingAsync())
        }

        test('unhandled promise from function wrapping ${asyncUtil} util is invalid', async () => {
          render()
          waitForSomethingAsync()
        });
      `,
      errors: [{ messageId: 'asyncUtilWrapper', line: 10, column: 11 }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test(
        'aggressive reporting - util "${asyncUtil}" which is not related to testing library is invalid',
        async () => {
          doSomethingElse();
          ${asyncUtil}();
        });
      `,
      errors: [{ line: 7, column: 11, messageId: 'awaitAsyncUtil' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from 'some-other-library';
        test(
        'aggressive reporting - util "asyncUtils.${asyncUtil}" which is not related to testing library is invalid',
        async () => {
          doSomethingElse();
          asyncUtils.${asyncUtil}();
        });
      `,
      errors: [{ line: 7, column: 22, messageId: 'awaitAsyncUtil' }],
    })),
  ],
});
