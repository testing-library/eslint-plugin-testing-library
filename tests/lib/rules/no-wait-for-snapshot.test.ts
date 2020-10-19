import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-wait-for-snapshot';
import { ASYNC_UTILS } from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('snapshot calls outside of ${asyncUtil} are valid', () => {
          expect(foo).toMatchSnapshot()
          await ${asyncUtil}(() => expect(foo).toBeDefined())
          expect(foo).toMatchInlineSnapshot()
        })
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
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
        import * as asyncUtils from '@testing-library/dom';
        test('snapshot calls outside of ${asyncUtil} are valid', () => {
          expect(foo).toMatchSnapshot()
          await asyncUtils.${asyncUtil}(() => expect(foo).toBeDefined())
          expect(foo).toMatchInlineSnapshot()
        })
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from '@testing-library/dom';
        test('snapshot calls outside of ${asyncUtil} are valid', () => {
          expect(foo).toMatchSnapshot()
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toBeDefined()
          })
          expect(foo).toMatchInlineSnapshot()
        })
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => {
              expect(foo).toMatchSnapshot()
          });
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toMatchSnapshot()
          });
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => {
              expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from 'some-other-library';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
    })),
  ],
  invalid: [
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
      errors: [{ line: 4, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => {
              expect(foo).toMatchSnapshot()
          });
        });
      `,
      errors: [{ line: 5, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchSnapshot());
        });
      `,
      errors: [{ line: 4, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toMatchSnapshot()
          });
        });
      `,
      errors: [{ line: 5, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
      errors: [{ line: 4, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import { ${asyncUtil} } from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await ${asyncUtil}(() => {
              expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
      errors: [{ line: 5, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => expect(foo).toMatchInlineSnapshot());
        });
      `,
      errors: [{ line: 4, messageId: 'noWaitForSnapshot' }],
    })),
    ...ASYNC_UTILS.map((asyncUtil) => ({
      code: `
        import * as asyncUtils from '@testing-library/dom';
        test('snapshot calls within ${asyncUtil} are not valid', async () => {
          await asyncUtils.${asyncUtil}(() => {
              expect(foo).toMatchInlineSnapshot()
          });
        });
      `,
      errors: [{ line: 5, messageId: 'noWaitForSnapshot' }],
    })),
  ],
});
