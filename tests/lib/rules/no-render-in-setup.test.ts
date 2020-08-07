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
        import { render } from '@testing-library/foo';
        it('Test', () => {
          render(<Component/>)
        })
      `,
    },
    // test config options
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        import { renderWithRedux } from '../test-utils';
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
    // test usage of a non-Testing Library render fn
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        import { render } from 'imNoTestingLibrary';
        ${setupHook}(() => {
          render(<Component/>)
        })
      `,
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(allowedSetupHook => {
      const [disallowedHook] = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
        setupHook => setupHook !== allowedSetupHook
      );
      return {
        code: `
          import utils from 'imNoTestingLibrary';
          import { renderWithRedux } from '../test-utils';
          ${allowedSetupHook}(() => {
            renderWithRedux(<Component/>)
          })
          ${disallowedHook}(() => {
            utils.render(<Component/>)
          })
        `,
        options: [
          {
            allowTestingFrameworkSetupHook: allowedSetupHook,
            renderFunctions: ['renderWithRedux'],
          },
        ],
      };
    }),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
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
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        import { render } from '@testing-library/foo';
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
        import { render } from '@testing-library/foo';
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
        import { renderWithRedux } from '../test-utils';
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
      import { render } from '@testing-library/foo';
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
          import { render } from '@testing-library/foo';
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
      code: `
        import * as testingLibrary from '@testing-library/foo';
        ${setupHook}(() => {
          testingLibrary.render(<Component/>)
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
        import { render } from 'imNoTestingLibrary';
        import * as testUtils from '../test-utils';
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
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map(setupHook => ({
      code: `
        const { render } = require('@testing-library/foo')

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
});
