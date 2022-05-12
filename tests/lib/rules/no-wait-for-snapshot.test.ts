import rule, { RULE_NAME } from '../../../lib/rules/no-wait-for-snapshot';
import { ASYNC_UTILS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
  '@testing-library/dom',
  '@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
      ...ASYNC_UTILS.map((asyncUtil) => ({
        code: `
          import { ${asyncUtil} } from '${testingFramework}';
          test('snapshot calls outside of ${asyncUtil} are valid', () => {
            expect(foo).toMatchSnapshot()
            await ${asyncUtil}(() => expect(foo).toBeDefined())
            expect(foo).toMatchInlineSnapshot()
          })
        `,
      })),
      ...ASYNC_UTILS.map((asyncUtil) => ({
        code: `
          import { ${asyncUtil} } from '${testingFramework}';
          test('snapshot calls outside of ${asyncUtil} are valid', () => {
            expect(foo).toMatchSnapshot()
            await ${asyncUtil}(() => {
                expect(foo).toBeDefined()
            })
            expect(foo).toMatchInlineSnapshot()
          })
        `,
      })),
      ...ASYNC_UTILS.map((asyncUtil) => ({
        code: `
          import * as asyncUtils from '${testingFramework}';
          test('snapshot calls outside of ${asyncUtil} are valid', () => {
            expect(foo).toMatchSnapshot()
            await asyncUtils.${asyncUtil}(() => expect(foo).toBeDefined())
            expect(foo).toMatchInlineSnapshot()
          })
        `,
      })),
      ...ASYNC_UTILS.map((asyncUtil) => ({
        code: `
          import * as asyncUtils from '${testingFramework}';
          test('snapshot calls outside of ${asyncUtil} are valid', () => {
            expect(foo).toMatchSnapshot()
            await asyncUtils.${asyncUtil}(() => {
                expect(foo).toBeDefined()
            })
            expect(foo).toMatchInlineSnapshot()
          })
        `,
      })),
    ]),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('aggressive reporting disabled - snapshot calls within ${asyncUtil} not related to Testing Library are valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('(alt) aggressive reporting disabled - snapshot calls within ${asyncUtil} not related to Testing Library are valid', async () => {
          await ${asyncUtil}(() => {
            // this alt version doesn't return from callback passed to async util
            expect(foo).toMatchSnapshot()
          });
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import * as asyncUtils from 'some-other-library';
        test('aggressive reporting disabled - snapshot calls within ${asyncUtil} from wildcard import not related to Testing Library are valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import * as asyncUtils from 'some-other-library';
        test('(alt) aggressive reporting disabled - snapshot calls within ${asyncUtil} from wildcard import not related to Testing Library are valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
            // this alt version doesn't return from callback passed to async util
            expect(foo).toMatchSnapshot()
          });
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('aggressive reporting disabled - inline snapshot calls within ${asyncUtil} import not related to Testing Library are valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('(alt) aggressive reporting disabled - inline snapshot calls within ${asyncUtil} import not related to Testing Library are valid', async () => {
          await ${asyncUtil}(() => {
            // this alt version doesn't return from callback passed to async util
            expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import * as asyncUtils from 'some-other-library';
        test('aggressive reporting disabled - inline snapshot calls within ${asyncUtil} from wildcard import not related to Testing Library are valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import * as asyncUtils from 'some-other-library';
        test('(alt) aggressive reporting disabled - inline snapshot calls within ${asyncUtil} from wildcard import not related to Testing Library are valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
            // this alt version doesn't return from callback passed to async util
            expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
    })),
  ],
  invalid: SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
          errors: [
            {
              line: 4,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 36 + asyncUtil.length,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => {
              expect(foo).toMatchSnapshot()
          });
        });
      `,
          errors: [
            {
              line: 5,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 27,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import * as asyncUtils from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
          errors: [
            {
              line: 4,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 47 + asyncUtil.length,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import * as asyncUtils from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toMatchSnapshot()
          });
        });
      `,
          errors: [
            {
              line: 5,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 27,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
          errors: [
            {
              line: 4,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 36 + asyncUtil.length,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import { ${asyncUtil} } from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => {
              expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
          errors: [
            {
              line: 5,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 27,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import * as asyncUtils from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
          errors: [
            {
              line: 4,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 47 + asyncUtil.length,
            },
          ],
        } as const)
    ),
    ...ASYNC_UTILS.map(
      (asyncUtil) =>
        ({
          code: `
        import * as asyncUtils from '${testingFramework}';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
          errors: [
            {
              line: 5,
              messageId: 'noWaitForSnapshot',
              data: { name: asyncUtil },
              column: 27,
            },
          ],
        } as const)
    ),
  ]),
});
