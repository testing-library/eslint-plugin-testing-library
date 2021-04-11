import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/consistent-data-testid';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
          import React from 'react';
          
          const TestComponent = props => {
            return (
              <div data-testid="cool">
                Hello
              </div>
            )
          };
        `,
      options: [{ testIdPattern: 'cool' }],
    },
    {
      code: `
          import React from 'react';
          
          const TestComponent = props => {
            return (
              <div className="cool">
                Hello
              </div>
            )
          };
        `,
      options: [{ testIdPattern: 'cool' }],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="Awesome__CoolStuff">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
        },
      ],
      filename: '/my/cool/file/path/Awesome.js',
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="Awesome">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
        },
      ],
      filename: '/my/cool/file/path/Awesome.js',
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="Parent">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
        },
      ],
      filename: '/my/cool/file/Parent/index.js',
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="Parent">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '{fileName}',
        },
      ],
      filename: '/my/cool/__tests__/Parent/index.js',
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="wrong" custom-attr="right-1">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^right(.*)$',
          testIdAttribute: 'custom-attr',
        },
      ],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div another-custom-attr="right-1" custom-attr="right-2">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^right(.*)$',
          testIdAttribute: ['custom-attr', 'another-custom-attr'],
        },
      ],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-test-id="Parent">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '{fileName}',
          testIdAttribute: 'data-test-id',
        },
      ],
      filename: '/my/cool/__tests__/Parent/index.js',
    },
    {
      code: `
          import React from 'react';
          
          const TestComponent = props => {
            const dynamicTestId = 'somethingDynamic';
            return (
              <div data-testid={\`cool-\${dynamicTestId}\`}>
                Hello
              </div>
            )
          };
        `,
      options: [{ testIdPattern: 'somethingElse' }],
    },
  ],
  invalid: [
    {
      code: `
        import React from 'react';
            
        const TestComponent = props => {
          return (
            <div data-testid="Awesome__CoolStuff">
              Hello
            </div>
          )
        };
        `,
      options: [{ testIdPattern: 'error' }],
      errors: [
        {
          messageId: 'consistentDataTestId',
          data: {
            attr: 'data-testid',
            value: 'Awesome__CoolStuff',
            regex: '/error/',
          },
        },
      ],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="Nope">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: 'matchMe',
        },
      ],
      filename: '/my/cool/__tests__/Parent/index.js',
      errors: [
        {
          messageId: 'consistentDataTestId',
          data: {
            attr: 'data-testid',
            value: 'Nope',
            regex: '/matchMe/',
          },
        },
      ],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="Parent__cool" my-custom-attr="WrongComponent__cool">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
          testIdAttribute: 'my-custom-attr',
        },
      ],
      filename: '/my/cool/__tests__/Parent/index.js',
      errors: [
        {
          messageId: 'consistentDataTestId',
          data: {
            attr: 'my-custom-attr',
            value: 'WrongComponent__cool',
            regex: '/^Parent(__([A-Z]+[a-z]*?)+)*$/',
          },
        },
      ],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div custom-attr="wrong" another-custom-attr="wrong">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^right$',
          testIdAttribute: ['custom-attr', 'another-custom-attr'],
        },
      ],
      filename: '/my/cool/__tests__/Parent/index.js',
      errors: [
        {
          messageId: 'consistentDataTestId',
          data: {
            attr: 'custom-attr',
            value: 'wrong',
            regex: '/^right$/',
          },
        },
        {
          messageId: 'consistentDataTestId',
          data: {
            attr: 'another-custom-attr',
            value: 'wrong',
            regex: '/^right$/',
          },
        },
      ],
    },
    {
      code: `
            import React from 'react';
            
            const TestComponent = props => {
              return (
                <div data-testid="WrongComponent__cool">
                  Hello
                </div>
              )
            };
          `,
      options: [
        {
          testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
        },
      ],
      filename: '/my/cool/__tests__/Parent/index.js',
      errors: [
        {
          messageId: 'consistentDataTestId',
          data: {
            attr: 'data-testid',
            value: 'WrongComponent__cool',
            regex: '/^Parent(__([A-Z]+[a-z]*?)+)*$/',
          },
        },
      ],
    },
  ],
});
