import { InvalidTestCase } from '@typescript-eslint/experimental-utils/dist/ts-eslint'
import { createRuleTester } from '../test-utils';
import { ASYNC_QUERIES_COMBINATIONS, SYNC_QUERIES_COMBINATIONS } from '../../../lib/utils';
import rule, { WAIT_METHODS, RULE_NAME } from '../../../lib/rules/prefer-find-by';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ASYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `const submitButton = await ${queryMethod}('foo')`
    })),
    ...ASYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `const submitButton = await screen.${queryMethod}('foo')`
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `await waitForElementToBeRemoved(() => ${queryMethod}(baz))`
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `await waitFor(function() {
        return ${queryMethod}('baz', { name: 'foo' })
      })`
    })),
    {
      code: `await waitFor(() => myCustomFunction())`
    },
    {
      code: `await waitFor(customFunctionReference)`
    },
    {
      code: `await waitForElementToBeRemoved(document.querySelector('foo'))`
    },
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        await waitFor(() => {
          foo()
          return ${queryMethod}()
        })
      `
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        await waitFor(() => expect(screen.${queryMethod}('baz')).toBeDisabled());
      `
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        await waitFor(() => expect(${queryMethod}('baz')).toBeInTheDocument());
      `
    })),
    {
      code: `
        await waitFor();
        await wait();
      `
    }
  ],
  invalid: [
    // using reduce + concat 'cause flatMap is not available in node10.x
    ...WAIT_METHODS.reduce((acc: InvalidTestCase<'preferFindBy', []>[], waitMethod) => acc
      .concat(
        SYNC_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
          code: `const submitButton = await ${waitMethod}(() => ${queryMethod}('foo', { name: 'baz' }))`,
          errors: [{
            messageId: 'preferFindBy',
            data: {
              queryVariant: queryMethod.includes('All') ? 'findAllBy': 'findBy',
              queryMethod: queryMethod.split('By')[1],
              fullQuery: `${waitMethod}(() => ${queryMethod}('foo', { name: 'baz' }))`,
            },
          }],
          output: `const submitButton = await ${queryMethod.includes('All') ? 'findAllBy': 'findBy'}${queryMethod.split('By')[1]}('foo', { name: 'baz' })`
        }))
      ).concat(
        SYNC_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
          code: `const submitButton = await ${waitMethod}(() => screen.${queryMethod}('foo', { name: 'baz' }))`,
          errors: [{
            messageId: 'preferFindBy',
            data: {
              queryVariant: queryMethod.includes('All') ? 'findAllBy': 'findBy',
              queryMethod: queryMethod.split('By')[1],
              fullQuery: `${waitMethod}(() => screen.${queryMethod}('foo', { name: 'baz' }))`,
            }
          }],
          output: `const submitButton = await screen.${queryMethod.includes('All') ? 'findAllBy': 'findBy'}${queryMethod.split('By')[1]}('foo', { name: 'baz' })`
        }))
      ),
    [])
  ],
})