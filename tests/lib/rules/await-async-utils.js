'use strict';

const rule = require('../../../lib/rules/await-async-utils');
const { ASYNC_UTILS } = require('../../../lib/utils');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });

ruleTester.run('await-async-utils', rule, {
  valid: [
    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util directly waited with await operator is valid', async () => {
          doSomethingElse();
          await ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util promise saved in var and waited with await operator is valid', async () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
          await aPromise;
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util directly chained with then is valid', () => {
          doSomethingElse();
          ${asyncUtil}(() => getByLabelText('email')).then(() => { console.log('done') });
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util promise saved in var and chained with then is valid', () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
          aPromise.then(() => { console.log('done') });
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util directly returned in arrow function is valid', async () => {
          const makeCustomWait = () =>
            ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util explicitly returned in arrow function is valid', async () => {
          const makeCustomWait = () => {
            return ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
          };
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util returned in regular function is valid', async () => {
          function makeCustomWait() {
            return ${asyncUtil}(() =>
              document.querySelector('div.getOuttaHere')
            );
          }
        });
      `,
    })),

    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
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
    {
      code: `
        test('util not related to testing library is valid', async () => {
          doSomethingElse();
          waitNotRelatedToTestingLibrary();
        });
      `,
    },
  ],
  invalid: [
    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util not waited', () => {
          doSomethingElse();
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [{ line: 4, messageId: 'awaitAsyncUtil' }],
    })),
    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('${asyncUtil} util promise saved not waited', () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [{ line: 4, column: 28, messageId: 'awaitAsyncUtil' }],
    })),
    ...ASYNC_UTILS.map(asyncUtil => ({
      code: `
        test('several ${asyncUtil} utils not waited', () => {
          const aPromise = ${asyncUtil}(() => getByLabelText('username'));
          doSomethingElse(aPromise);
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
      errors: [
        { line: 3, column: 28, messageId: 'awaitAsyncUtil' },
        { line: 5, column: 11, messageId: 'awaitAsyncUtil' },
      ],
    })),
  ],
});
