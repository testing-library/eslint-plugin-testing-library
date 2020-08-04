import { createRuleTester } from '../test-utils';
import { BEFORE_HOOKS } from '../../../lib/utils';
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
  ],

  invalid: [
    ...BEFORE_HOOKS.map(beforeHook => ({
      code: `
        ${beforeHook}(() => {
          render(<Component/>)
        })
      `,
      errors: [
        {
          messageId: 'noRenderInSetup',
        },
      ],
    })),
    ...BEFORE_HOOKS.map(beforeHook => ({
      code: `
        ${beforeHook}(function() {
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
    ...BEFORE_HOOKS.map(beforeHook => ({
      code: `
        ${beforeHook}(() => {
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
    ...BEFORE_HOOKS.map(beforeHook => ({
      code: `
        ${beforeHook}(() => {
          const wrapper = () => {
            render(<Component/>)
          }
          wrapper();
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
