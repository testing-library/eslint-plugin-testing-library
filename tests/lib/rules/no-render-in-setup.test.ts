import { createRuleTester } from '../test-utils';
import { TESTING_FRAMEWORK_SETUP_HOOKS } from '../../../lib/utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-render-in-setup';

const ruleTester = createRuleTester();

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
    {
      code: `
      import { render } from '@testing-library/foo';
      beforeAll(() => {
        render(<Component />);
      });
    `,
      options: [{ allowTestingFrameworkSetupHook: 'beforeAll' }],
    },
    {
      code: `
      import { render } from '@testing-library/foo';
      beforeEach(() => {
        render(<Component />);
      });
    `,
      options: [{ allowTestingFrameworkSetupHook: 'beforeEach' }],
    },
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
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      code: `
        import { render } from '@testing-library/foo';
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
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      code: `
        import { render } from '@testing-library/foo';
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
    })),
    // custom render function
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      settings: {
        'testing-library/utils-module': 'test-utils',
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
      },
      code: `
        import { renderWithRedux } from '../test-utils';
        ${setupHook}(() => {
          renderWithRedux(<Component/>)
        })
      `,
      errors: [
        {
          line: 4,
          column: 11,
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    // call render within a wrapper function
    // TODO: update this test so:
    //  - the wrapper is outside the hook
    //  - the error is located in `wrapper()` call
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
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
          line: 5,
          column: 13,
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((allowedSetupHook) => {
      const [disallowedHook] = TESTING_FRAMEWORK_SETUP_HOOKS.filter(
        (setupHook) => setupHook !== allowedSetupHook
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
            line: 4,
            column: 13,
            messageId: 'noRenderInSetup',
          },
        ],
      };
    }),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      code: `
        import * as testingLibrary from '@testing-library/foo';
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
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
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
    })),
    ...TESTING_FRAMEWORK_SETUP_HOOKS.map((setupHook) => ({
      code: `
        const { render } = require('@testing-library/foo')

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
    })),
  ],
});
