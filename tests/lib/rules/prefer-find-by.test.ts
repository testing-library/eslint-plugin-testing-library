import { TSESLint } from '@typescript-eslint/experimental-utils';

import rule, {
  WAIT_METHODS,
  RULE_NAME,
  getFindByQueryVariant,
  MessageIds,
} from '../../../lib/rules/prefer-find-by';
import {
  ASYNC_QUERIES_COMBINATIONS,
  SYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

function buildFindByMethod(queryMethod: string) {
  return `${getFindByQueryVariant(queryMethod)}${queryMethod.split('By')[1]}`;
}

function createScenario<
  T extends
    | TSESLint.InvalidTestCase<MessageIds, []>
    | TSESLint.ValidTestCase<[]>
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
        it('tests', async () => {
          const { ${queryMethod} } = setup()
          const submitButton = await ${queryMethod}('foo')
        })
      `,
    })),
    ...ASYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {screen} from '@testing-library/foo';
        it('tests', async () => {
          const submitButton = await screen.${queryMethod}('foo')
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {waitForElementToBeRemoved} from '@testing-library/foo';
        it('tests', async () => {
          await waitForElementToBeRemoved(() => ${queryMethod}(baz))
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(function() {
            return ${queryMethod}('baz', { name: 'foo' })
          })
        })
        `,
    })),
    {
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(() => myCustomFunction())
        })
      `,
    },
    {
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(customFunctionReference)
        })
      `,
    },
    {
      code: `
      import {waitForElementToBeRemoved} from '@testing-library/foo';
      it('tests', async () => {
        const { container } = render()
        await waitForElementToBeRemoved(container.querySelector('foo'))
      })
      `,
    },
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(() => {
            foo()
            return ${queryMethod}()
          })
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {screen, waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(() => expect(screen.${queryMethod}('baz')).toBeDisabled());
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {screen, waitFor} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          await waitFor(() => expect(${queryMethod}('baz')).toBeDisabled());
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(() => expect(screen.${queryMethod}('baz')).not.toBeInTheDocument());
        })
      `,
    })),
    ...SYNC_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          await waitFor(() => expect(${queryMethod}('baz')).not.toBeInTheDocument());
        })
      `,
    })),
    {
      code: `
        import {waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor();
          await wait();
        })
      `,
    },
    {
      code: `
        import {screen, waitFor} from '@testing-library/foo';
        it('tests', async () => {
          await waitFor(() => expect(screen.querySelector('baz')).toBeInTheDocument());
        })
      `,
    },
  ],
  invalid: [
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
          import {${waitMethod}, screen} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => screen.${queryMethod}('foo', { name: 'baz' }))
          })
        `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
          import {${waitMethod}, screen} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await screen.${buildFindByMethod(
              queryMethod
            )}('foo', { name: 'baz' })
          })
        `,
    })),
    // // this scenario verifies it works when the render function is defined in another scope
    ...WAIT_METHODS.map(
      (waitMethod: string) =>
        ({
          code: `
          import {${waitMethod}} from '@testing-library/foo';
          const { getByText, queryByLabelText, findAllByRole } = customRender()
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => getByText('baz', { name: 'button' }))
          })
        `,
          errors: [
            {
              messageId: 'preferFindBy',
              data: {
                queryVariant: 'findBy',
                queryMethod: 'Text',
                prevQuery: 'getByText',
                waitForMethodName: waitMethod,
              },
            },
          ],
          output: `
          import {${waitMethod}} from '@testing-library/foo';
          const { getByText, queryByLabelText, findAllByRole, findByText } = customRender()
          it('tests', async () => {
            const submitButton = await findByText('baz', { name: 'button' })
          })
        `,
        } as const)
    ),
    // // this scenario verifies when findBy* were already defined (because it was used elsewhere)
    ...WAIT_METHODS.map(
      (waitMethod: string) =>
        ({
          code: `
          import {${waitMethod}} from '@testing-library/foo';
          const { getAllByRole, findAllByRole } = customRender()
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => getAllByRole('baz', { name: 'button' }))
          })
        `,
          errors: [
            {
              messageId: 'preferFindBy',
              data: {
                queryVariant: 'findAllBy',
                queryMethod: 'Role',
                prevQuery: 'getAllByRole',
                waitForMethodName: waitMethod,
              },
            },
          ],
          output: `
          import {${waitMethod}} from '@testing-library/foo';
          const { getAllByRole, findAllByRole } = customRender()
          it('tests', async () => {
            const submitButton = await findAllByRole('baz', { name: 'button' })
          })
        `,
        } as const)
    ),
    // invalid code, as we need findBy* to be defined somewhere, but required for getting 100% coverage
    {
      code: `const submitButton = await waitFor(() => getByText('baz', { name: 'button' }))`,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: 'findBy',
            queryMethod: 'Text',
            prevQuery: 'getByText',
            waitForMethodName: 'waitFor',
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
            prevQuery: 'getByRole',
            waitForMethodName: 'waitFor',
          },
        },
      ],
      output: `
          const getByRole = render().getByRole
          const submitButton = await findByRole('baz', { name: 'button' })
        `,
    },
    // custom query triggers the error but there is no fix - so output is the same
    ...WAIT_METHODS.map(
      (waitMethod: string) =>
        ({
          code: `
          import {${waitMethod},render} from '@testing-library/foo';
          it('tests', async () => {
            const { getByCustomQuery } = render()
            const submitButton = await ${waitMethod}(() => getByCustomQuery('baz'))
          })
        `,
          errors: [
            {
              messageId: 'preferFindBy',
              data: {
                queryVariant: 'findBy',
                queryMethod: 'CustomQuery',
                prevQuery: 'getByCustomQuery',
                waitForMethodName: waitMethod,
              },
            },
          ],
          output: `
          import {${waitMethod},render} from '@testing-library/foo';
          it('tests', async () => {
            const { getByCustomQuery } = render()
            const submitButton = await ${waitMethod}(() => getByCustomQuery('baz'))
          })
        `,
        } as const)
    ),
    // custom query triggers the error but there is no fix - so output is the same
    ...WAIT_METHODS.map(
      (waitMethod: string) =>
        ({
          code: `
          import {${waitMethod},render,screen} from '@testing-library/foo';
          it('tests', async () => {
            const { getByCustomQuery } = render()
            const submitButton = await ${waitMethod}(() => screen.getByCustomQuery('baz'))
          })
        `,
          errors: [
            {
              messageId: 'preferFindBy',
              data: {
                queryVariant: 'findBy',
                queryMethod: 'CustomQuery',
                prevQuery: 'getByCustomQuery',
                waitForMethodName: waitMethod,
              },
            },
          ],
          output: `
          import {${waitMethod},render,screen} from '@testing-library/foo';
          it('tests', async () => {
            const { getByCustomQuery } = render()
            const submitButton = await ${waitMethod}(() => screen.getByCustomQuery('baz'))
          })
        `,
        } as const)
    ),
    // presence matchers
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          const submitButton = await ${waitMethod}(() => ${queryMethod}('foo', { name: 'baz' }))
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          const submitButton = await ${waitMethod}(() => expect(${queryMethod}('foo', { name: 'baz' })).toBeInTheDocument())
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          const submitButton = await ${waitMethod}(() => expect(${queryMethod}('foo', { name: 'baz' })).toBeDefined())
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          const submitButton = await ${waitMethod}(() => expect(${queryMethod}('foo', { name: 'baz' })).not.toBeNull())
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const {${queryMethod}} = render()
          const submitButton = await ${waitMethod}(() => expect(${queryMethod}('foo', { name: 'baz' })).not.toBeNull())
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const {${queryMethod}, ${buildFindByMethod(queryMethod)}} = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          const submitButton = await ${waitMethod}(() => expect(${queryMethod}('foo', { name: 'baz' })).toBeTruthy())
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod} } = render()
          const submitButton = await ${waitMethod}(() => expect(${queryMethod}('foo', { name: 'baz' })).not.toBeFalsy())
        })
      `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
        import {${waitMethod}} from '@testing-library/foo';
        it('tests', async () => {
          const { ${queryMethod}, ${buildFindByMethod(queryMethod)} } = render()
          const submitButton = await ${buildFindByMethod(
            queryMethod
          )}('foo', { name: 'baz' })
        })
      `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => expect(screen.${queryMethod}('foo', { name: 'baz' })).toBeInTheDocument())
          })
        `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await screen.${buildFindByMethod(
              queryMethod
            )}('foo', { name: 'baz' })
          })
        `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => expect(screen.${queryMethod}('foo', { name: 'baz' })).toBeDefined())
          })
        `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await screen.${buildFindByMethod(
              queryMethod
            )}('foo', { name: 'baz' })
          })
        `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => expect(screen.${queryMethod}('foo', { name: 'baz' })).not.toBeNull())
          })
        `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await screen.${buildFindByMethod(
              queryMethod
            )}('foo', { name: 'baz' })
          })
        `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => expect(screen.${queryMethod}('foo', { name: 'baz' })).toBeTruthy())
          })
        `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await screen.${buildFindByMethod(
              queryMethod
            )}('foo', { name: 'baz' })
          })
        `,
    })),
    ...createScenario((waitMethod: string, queryMethod: string) => ({
      code: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await ${waitMethod}(() => expect(screen.${queryMethod}('foo', { name: 'baz' })).not.toBeFalsy())
          })
        `,
      errors: [
        {
          messageId: 'preferFindBy',
          data: {
            queryVariant: getFindByQueryVariant(queryMethod),
            queryMethod: queryMethod.split('By')[1],
            prevQuery: queryMethod,
            waitForMethodName: waitMethod,
          },
        },
      ],
      output: `
          import {${waitMethod}} from '@testing-library/foo';
          it('tests', async () => {
            const submitButton = await screen.${buildFindByMethod(
              queryMethod
            )}('foo', { name: 'baz' })
          })
        `,
    })),
  ],
});
