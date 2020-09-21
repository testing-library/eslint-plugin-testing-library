import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { createRuleTester } from '../test-utils';
import {
  ASYNC_QUERIES_COMBINATIONS,
  SYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';
import rule, {
  WAIT_METHODS,
  RULE_NAME,
  getFindByQueryVariant,
  MessageIds,
} from '../../../lib/rules/prefer-find-by';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

function buildFindByMethod(queryMethod: string) {
  return `${getFindByQueryVariant(queryMethod)}${queryMethod.split('By')[1]}`;
}

function createScenario<
  T extends ValidTestCase<[]> | InvalidTestCase<MessageIds, []>
>(callback: (waitMethod: string, queryMethod: string) => T) {
  return WAIT_METHODS.reduce(
    (acc: T[], waitMethod) =>
      acc.concat(
        SYNC_QUERIES_COMBINATIONS.map((queryMethod) =>
          callback(waitMethod, queryMethod)
        )
      ),
    []
  );
}

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ASYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        const { ${queryMethod} } = setup()
        const submitButton = await ${queryMethod}('foo')
      `,
    })),
    ...ASYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `const submitButton = await screen.${queryMethod}('foo')`,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `await waitForElementToBeRemoved(() => ${queryMethod}(baz))`,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `await waitFor(function() {
        return ${queryMethod}('baz', { name: 'foo' })
      })`,
    })),
    {
      code: `await waitFor(() => myCustomFunction())`,
    },
    {
      code: `await waitFor(customFunctionReference)`,
    },
    {
      code: `await waitForElementToBeRemoved(document.querySelector('foo'))`,
    },
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        await waitFor(() => {
          foo()
          return ${queryMethod}()
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        await waitFor(() => expect(screen.${queryMethod}('baz')).toBeDisabled());
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        await waitFor(() => expect(${queryMethod}('baz')).toBeInTheDocument());
      `,
    })),
    {
      code: `
        await waitFor();
        await wait();
      `,
    },
  ],
  invalid: [
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        const { ${queryMethod} } = render()
        const submitButton = await ${waitMethod}(() => ${queryMethod}('foo', { name: 'baz' }))
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            fullQuery: `${waitMethod}(() => ${queryMethod}('foo', { name: 'baz' }))`,
          },
        },
      ],
      output: `
        const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
        const submitButton = await ${buildFindByMethod(
          queryMethod
        )}('foo', { name: 'baz' })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `const submitButton = await ${waitMethod}(() => screen.${queryMethod}('foo', { name: 'baz' }))`,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            fullQuery: `${waitMethod}(() => screen.${queryMethod}('foo', { name: 'baz' }))`,
          },
        },
      ],
      output: `const submitButton = await screen.${buildFindByMethod(
        queryMethod
      )}('foo', { name: 'baz' })`,
    })),
    // // this scenario verifies it works when the render function is defined in another scope
    ...WAIT_METHODS.map((waitMethod: string) => ({
      code: `
        const { getByText, queryByLabelText, findAllByRole } = customRender()
        it('foo', async () => {
          const submitButton = await ${waitMethod}(() => getByText('baz', { name: 'button' }))
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: 'findBy',
            queryMethod: 'Text',
            fullQuery: `${waitMethod}(() => getByText('baz', { name: 'button' }))`,
          },
        },
      ],
      output: `
        const { getByText, queryByLabelText, findAllByRole, findByText } = customRender()
        it('foo', async () => {
          const submitButton = await findByText('baz', { name: 'button' })
        })
      `,
    })),
    // // this scenario verifies when findBy* were already defined (because it was used elsewhere)
    ...WAIT_METHODS.map((waitMethod: string) => ({
      code: `
        const { getAllByRole, findAllByRole } = customRender()
        describe('some scenario', () => {
          it('foo', async () => {
            const submitButton = await ${waitMethod}(() => getAllByRole('baz', { name: 'button' }))
          })
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: 'findAllBy',
            queryMethod: 'Role',
            fullQuery: `${waitMethod}(() => getAllByRole('baz', { name: 'button' }))`,
          },
        },
      ],
      output: `
        const { getAllByRole, findAllByRole } = customRender()
        describe('some scenario', () => {
          it('foo', async () => {
            const submitButton = await findAllByRole('baz', { name: 'button' })
          })
        })
      `,
    })),
    // invalid code, as we need findBy* to be defined somewhere, but required for getting 100% coverage
    {
      code: `const submitButton = await waitFor(() => getByText('baz', { name: 'button' }))`,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: 'findBy',
            queryMethod: 'Text',
            fullQuery: `waitFor(() => getByText('baz', { name: 'button' }))`,
          },
        },
      ],
      output: `const submitButton = await findByText('baz', { name: 'button' })`,
    },
    // this code would be invalid too, as findByRole is not defined anywhere.
    {
      code: `
        const getByRole = render().getByRole
        const submitButton = await waitFor(() => getByRole('baz', { name: 'button' }))
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: 'findBy',
            queryMethod: 'Role',
            fullQuery: `waitFor(() => getByRole('baz', { name: 'button' }))`,
          },
        },
      ],
      output: `
        const getByRole = render().getByRole
        const submitButton = await findByRole('baz', { name: 'button' })
      `,
    },
  ],
});
