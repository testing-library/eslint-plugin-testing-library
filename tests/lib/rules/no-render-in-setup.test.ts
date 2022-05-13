import rule, { RULE_NAME } from '../../../lib/rules/no-render-in-setup';
import { TESTING_FRAMEWORK_SETUP_HOOKS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
  '@testing-library/foo',
  '@testing-library/angular',
  '@testing-library/react',
  '@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...SUPPORTED_TESTING_FRAMEWORKS.map((testingFramework) => ({
      code: `
        import { render } from '${testingFramework}';
        
        beforeAll(() => {
          doOtherStuff();
        });

        beforeEach(() => {
          doSomethingElse();
        });
        
        it('Test', () => {
          render(<Component/>)
        })
      `,
    })),
    // test config options
    ...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
      {
        code: `
      import { render } from '${testingFramework}';
      beforeAll(() => {
        render(<Component />);
      });
    `,
        options: [{ allowTestingFrameworkSetupHook: 'beforeAll' }],
      },
      {
        code: `
      import { render } from '${testingFramework}';
      beforeEach(() => {
        render(<Component />);
      });
    `,
        options: [{ allowTestingFrameworkSetupHook: 'beforeEach' }],
      },
    ]),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render } from 'imNoTestingLibrary';
        ${setupHook}(() => {
          render(<Component/>)
        })
      `,
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((allowedSetupHook) => {
      const [disallowedHook] = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
        (setupHook) => setupHook !== allowedSetupHook
      );
      return {
        settings: {
          'testing-library/utils-module': 'test-utils',
          'testing-library/custom-renders': ['show', 'renderWithRedux'],
        },
        code: `
          import utils from 'imNoTestingLibrary';
          import { show } from '../test-utils';
          ${allowedSetupHook}(() => {
            show(<Component/>)
          })
          ${disallowedHook}(() => {
            utils.render(<Component/>)
          })
        `,
        options: [
          {
            allowTestingFrameworkSetupHook: allowedSetupHook,
          },
        ],
      };
    }),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        const { render } = require('imNoTestingLibrary')

        ${setupHook}(() => {
          render(<Component/>)
        })
      `,
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
  ],

  invalid: [
    ...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
      ...TESTING_FRAMEWORK_SETUP_HOOKS.map(
        (setupHook) =>
          ({
            code: `
        import { render } from '${testingFramework}';
        ${setupHook}(() => {
          render(<Component/>)
        })
      `,
            errors: [
              {
                line: 4,
                column: 11,
                messageId: 'noRenderInSetup',
              },
            ],
          } as const)
      ),
      ...TESTING_FRAMEWORK_SETUP_HOOKS.map(
        (setupHook) =>
          ({
            code: `
        import { render } from '${testingFramework}';
        ${setupHook}(function() {
          render(<Component/>)
        })
      `,
            errors: [
              {
                line: 4,
                column: 11,
                messageId: 'noRenderInSetup',
              },
            ],
          } as const)
      ),
    ]),
    // custom render function
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(
      (setupHook) =>
        ({
          settings: {
            'testing-library/utils-module': 'test-utils',
            'testing-library/custom-renders': ['show', 'renderWithRedux'],
          },
          code: `
        import { show } from '../test-utils';
  
        ${setupHook}(() => {
          show(<Component/>)
        })
      `,
          errors: [
            {
              line: 5,
              column: 11,
              messageId: 'noRenderInSetup',
            },
          ],
        } as const)
    ),
    ...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
      ...TESTING_FRAMEWORK_SETUP_HOOKS.map(
        (setupHook) =>
          ({
            code: `// call render within a wrapper function
      import { render } from '${testingFramework}';

      const wrapper = () => render(<Component/>)

      ${setupHook}(() => {
        wrapper()
      })
      `,
            errors: [
              {
                line: 7,
                column: 9,
                messageId: 'noRenderInSetup',
              },
            ],
          } as const)
      ),
      ...TESTING_FRAMEWORK_SETUP_HOOKS.map((allowedSetupHook) => {
        const [disallowedHook] = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
          (setupHook) => setupHook !== allowedSetupHook
        );
        return {
          code: `
          import { render } from '${testingFramework}';
          ${disallowedHook}(() => {
            render(<Component/>)
          })
        `,
          options: [
            {
              allowTestingFrameworkSetupHook: allowedSetupHook,
            },
          ],
          errors: [
            {
              line: 4,
              column: 13,
              messageId: 'noRenderInSetup',
            },
          ],
        } as const;
      }),
      ...TESTING_FRAMEWORK_SETUP_HOOKS.map(
        (setupHook) =>
          ({
            code: `
        import * as testingLibrary from '${testingFramework}';
        ${setupHook}(() => {
          testingLibrary.render(<Component/>)
        })
      `,
            errors: [
              {
                line: 4,
                column: 26,
                messageId: 'noRenderInSetup',
              },
            ],
          } as const)
      ),
    ]),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(
      (setupHook) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `
        import { render } from 'imNoTestingLibrary';
        import * as testUtils from '../test-utils';
        ${setupHook}(() => {
          testUtils.renderWithRedux(<Component/>)
        })
        it('Test', () => {
          render(<Component/>)
        })
      `,
          errors: [
            {
              line: 5,
              column: 21,
              messageId: 'noRenderInSetup',
            },
          ],
        } as const)
    ),
    ...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) =>
      TESTING_FRAMEWORK_SETUP_HOOKS.map(
        (setupHook) =>
          ({
            code: `
        const { render } = require('${testingFramework}')

        ${setupHook}(() => {
          render(<Component/>)
        })
      `,
            errors: [
              {
                line: 5,
                column: 11,
                messageId: 'noRenderInSetup',
              },
            ],
          } as const)
      )
    ),
  ],
});
