import rule, { RULE_NAME } from '../../../lib/rules/await-async-utils';
import { ASYNC_UTILS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
	valid: SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util directly waited with await operator is valid', async () => {
          doSomethingElse();
          await ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util promise saved in var and waited with await operator is valid', async () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
          await aPromise;
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util directly chained with then is valid', () => {
          doSomethingElse();
          ${asyncUtil}(() => getByLabelText('email')).then(() => { console.log('done') });
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util expect chained with .resolves is valid', () => {
          doSomethingElse();
          expect(${asyncUtil}(() => getByLabelText('email'))).resolves.toBe("foo");
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util expect chained with .toResolve is valid', () => {
          doSomethingElse();
          expect(${asyncUtil}(() => getByLabelText('email'))).toResolve();
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util promise saved in var and chained with then is valid', () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
          aPromise.then(() => { console.log('done') });
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from 'some-other-library'; // rather than ${testingFramework}
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
        import * as asyncUtils from 'some-other-library'; // rather than ${testingFramework}
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { waitFor, waitForElementToBeRemoved } from '${testingFramework}';
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
        import { waitForElementToBeRemoved } from '${testingFramework}';
        test('waitForElementToBeRemoved receiving element rather than callback is valid', async () => {
          doSomethingElse();
          const emailInput = getByLabelText('email');
          await waitForElementToBeRemoved(emailInput);
        });
      `,
		},
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
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
        import { ${asyncUtil} } from '${testingFramework}';
        
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
          waitForNotRelatedToTestingLibrary(), // completely unrelated to ${testingFramework}
          promise1,
          await foo().then(() => baz())
        ])
      })
      `,
		},
		{
			// edge case for coverage
			// valid async query usage without any function defined
			// so there is no innermost function scope found
			code: `
        import { waitFor } from '${testingFramework}';
        test('edge case for no innermost function scope', () => {
          const foo = waitFor
        })
      `,
		},
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('destructuring an async function wrapper & handling it later is valid', () => {
          const { user, waitForAsyncUtil } = setup();
          await waitForAsyncUtil();

          const myAlias = waitForAsyncUtil;
          const myOtherAlias = myAlias;
          await myAlias();
          await myOtherAlias();

          const { ...clone } = setup();
          await clone.waitForAsyncUtil();

          const { waitForAsyncUtil: myDestructuredAlias } = setup();
          await myDestructuredAlias();
          
          const { user, ...rest } = setup();
          await rest.waitForAsyncUtil();

          await setup().waitForAsyncUtil();
        });
      `,
		})),
		...ASYNC_UTILS.map((asyncUtil) => ({
			code: `
          import React from 'react';
          import { render, act } from '${testingFramework}';
          
          const doWithAct = async (timeout) => {
            await act(async () => await ${asyncUtil}(screen.getByTestId('my-test')));
          };
          
          describe('Component', () => {
            const mock = jest.fn();
          
            it('test', async () => {
              let Component = () => {
                mock(1);
                return <div />;
              };
              render(<Component />);
          
              await doWithAct(500);
          
              const myNumberTestVar = 1;
              const myBooleanTestVar = false;
              const myArrayTestVar = [1, 2];
              const myStringTestVar = 'hello world';
              const myObjectTestVar = { hello: 'world' };

              expect(mock).toHaveBeenCalledWith(myNumberTestVar);
            });
          });
      `,
		})),
	]),
	invalid: SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util not waited is invalid', () => {
          doSomethingElse();
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
					errors: [
						{
							line: 5,
							column: 11,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util not waited is invalid', () => {
          doSomethingElse();
          const el = ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
					errors: [
						{
							line: 5,
							column: 22,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import * as asyncUtil from '${testingFramework}';
        test('asyncUtil.${asyncUtil} util not handled is invalid', () => {
          doSomethingElse();
          asyncUtil.${asyncUtil}(() => getByLabelText('email'));
        });
      `,
					errors: [
						{
							line: 5,
							column: 21,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('${asyncUtil} util promise saved not handled is invalid', () => {
          doSomethingElse();
          const aPromise = ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
					errors: [
						{
							line: 5,
							column: 28,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('several ${asyncUtil} utils not handled are invalid', () => {
          const aPromise = ${asyncUtil}(() => getByLabelText('username'));
          doSomethingElse(aPromise);
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
					errors: [
						{
							line: 4,
							column: 28,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
						{
							line: 6,
							column: 11,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('unhandled expression that evaluates to promise is invalid', () => {
          const aPromise = ${asyncUtil}(() => getByLabelText('username'));
          doSomethingElse(aPromise);
          ${asyncUtil}(() => getByLabelText('email'));
        });
      `,
					errors: [
						{
							line: 4,
							column: 28,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
						{
							line: 6,
							column: 11,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil}, render } from '${testingFramework}';
        
        function waitForSomethingAsync() {
          return ${asyncUtil}(() => somethingAsync())
        }

        test('unhandled promise from function wrapping ${asyncUtil} util is invalid', async () => {
          render()
          waitForSomethingAsync()
        });
      `,
					errors: [
						{
							messageId: 'asyncUtilWrapper',
							line: 10,
							column: 11,
							data: { name: 'waitForSomethingAsync' },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil} } from 'some-other-library'; // rather than ${testingFramework}
        test(
        'aggressive reporting - util "${asyncUtil}" which is not related to testing library is invalid',
        async () => {
          doSomethingElse();
          ${asyncUtil}();
        });
      `,
					errors: [
						{
							line: 7,
							column: 11,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import { ${asyncUtil}, render } from '${testingFramework}';
        
        function waitForSomethingAsync() {
          return ${asyncUtil}(() => somethingAsync())
        }

        test('unhandled promise from function wrapping ${asyncUtil} util is invalid', async () => {
          render()
          const el = waitForSomethingAsync()
        });
      `,
					errors: [
						{
							messageId: 'asyncUtilWrapper',
							line: 10,
							column: 22,
							data: { name: 'waitForSomethingAsync' },
						},
					],
				}) as const
		),

		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
        import * as asyncUtils from 'some-other-library'; // rather than ${testingFramework}
        test(
        'aggressive reporting - util "asyncUtils.${asyncUtil}" which is not related to testing library is invalid',
        async () => {
          doSomethingElse();
          asyncUtils.${asyncUtil}();
        });
      `,
					errors: [
						{
							line: 7,
							column: 22,
							messageId: 'awaitAsyncUtil',
							data: { name: asyncUtil },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('unhandled promise from destructed property of async function wrapper is invalid', () => {
          const { user, waitForAsyncUtil } = setup();
          waitForAsyncUtil();
        });
      `,
					errors: [
						{
							line: 15,
							column: 11,
							messageId: 'asyncUtilWrapper',
							data: { name: 'waitForAsyncUtil' },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('unhandled promise from destructed property of async function wrapper is invalid', () => {
          const { user, waitForAsyncUtil } = setup();
          const myAlias = waitForAsyncUtil;
          myAlias();
        });
      `,
					errors: [
						{
							line: 16,
							column: 11,
							messageId: 'asyncUtilWrapper',
							data: { name: 'myAlias' },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('unhandled promise from destructed property of async function wrapper is invalid', () => {
          const { ...clone } = setup();
          clone.waitForAsyncUtil();
        });
      `,
					errors: [
						{
							line: 15,
							column: 17,
							messageId: 'asyncUtilWrapper',
							data: { name: 'waitForAsyncUtil' },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('unhandled promise from destructed property of async function wrapper is invalid', () => {
          const { waitForAsyncUtil: myAlias } = setup();
          myAlias();
        });
      `,
					errors: [
						{
							line: 15,
							column: 11,
							messageId: 'asyncUtilWrapper',
							data: { name: 'myAlias' },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('unhandled promise from destructed property of async function wrapper is invalid', () => {
          setup().waitForAsyncUtil();
        });
      `,
					errors: [
						{
							line: 14,
							column: 19,
							messageId: 'asyncUtilWrapper',
							data: { name: 'waitForAsyncUtil' },
						},
					],
				}) as const
		),
		...ASYNC_UTILS.map(
			(asyncUtil) =>
				({
					code: `
				// using ${testingFramework} implicitly
        function setup() {
          const utils = render(<MyComponent />);
        
          const waitForAsyncUtil = () => {
            return ${asyncUtil}(screen.queryByTestId('my-test-id'));
          };
        
          return { waitForAsyncUtil, ...utils };
        }

        test('unhandled promise from destructed property of async function wrapper is invalid', () => {
          const myAlias = setup().waitForAsyncUtil;
          myAlias();
        });
      `,
					errors: [
						{
							line: 15,
							column: 11,
							messageId: 'asyncUtilWrapper',
							data: { name: 'myAlias' },
						},
					],
				}) as const
		),
	]),
});
