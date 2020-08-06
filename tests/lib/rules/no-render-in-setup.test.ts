import { createRuleTester } from '../test-utils';
import { TESTING_FRAMEWORK_SETUP_HOOKS } from '../../../lib/utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-render-in-setup';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        it('Test', () => {
          render(<Component/>)
        })
      `,
    },
    // test config options
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        ${setupHook}(() => {
          renderWithRedux(<Component/>)
        })
      `,
      options: [
        {
          allowTestingFrameworkSetupHook: setupHook,
          renderFunctions: ['renderWithRedux'],
        },
      ],
    })),
    // // test usage of a non-Testing Library render fn
    // ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
    //   code: `import { render } from 'imNoTestingLibrary';

    //   ${setupHook}(() => {
    //     render(<Component/>)
    //   })`,
    // })),
  ],

  invalid: [
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
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
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        ${setupHook}(function() {
          render(<Component/>)
        })
      `,
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    // custom render function
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        ${setupHook}(() => {
          renderWithRedux(<Component/>)
        })
      `,
      options: [
        {
          renderFunctions: ['renderWithRedux'],
        },
      ],
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    // call render within a wrapper function
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        ${setupHook}(() => {
          const wrapper = () => {
            render(<Component/>)
          }
          wrapper()
        })
      `,
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(allowedSetupHook => {
      const [disallowedHook] = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
        setupHook => setupHook !== allowedSetupHook
      );
      return {
        code: `
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
            messageId: 'noRenderInSetup',
          },
        ],
      };
    }),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `import { render } from '@testing-library/foo';

      ${setupHook}(() => {
        render(<Component/>)
      })`,
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `import * as testingLibrary from '@testing-library/foo';

      ${setupHook}(() => {
        testingLibrary.render(<Component/>)
      })`,
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `import { render } from 'imNoTestingLibrary';
      import * as testUtils from '../utils';

      ${setupHook}(() => {
        testUtils.renderWithRedux(<Component/>)
      })

      it('Test', () => {
        render(<Component/>)
      })
      `,
      options: [
        {
          renderFunctions: ['renderWithRedux'],
        },
      ],
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
  ],
});
