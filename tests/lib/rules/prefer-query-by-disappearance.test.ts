import rule, {
  RULE_NAME,
} from '../../../lib/rules/prefer-query-by-disappearance';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { screen } from '@testing-library/react';

        const button = screen.getByRole('button')
        await waitForElementToBeRemoved(button)
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const callback = () => screen.getByRole('button')
        await waitForElementToBeRemoved(callback)
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => screen.queryByText("hello"))
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          otherCode()
          screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          otherCode()
          return screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          return screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          otherCode()
          screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          return screen.queryByText('hey')
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          otherCode()
          return screen.queryByText('hey')
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(screen.queryByText("hello"))
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { queryByText } = screen
        await waitForElementToBeRemoved(queryByText("hello"))
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { queryByText } = screen
        await waitForElementToBeRemoved(() => queryByText("hello"))
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { queryByText } = screen
        await waitForElementToBeRemoved(() => {
          queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { queryByText } = screen
        await waitForElementToBeRemoved(() => {
          return queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { queryByText } = render(<App />)
        await waitForElementToBeRemoved(() => {
          return queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { queryByText } = render(<App />)
        await waitForElementToBeRemoved(() => {
          queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { queryByText } = render(<App />)
        await waitForElementToBeRemoved(() => queryByText("hello"))
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { queryByText } = render(<App />)
        await waitForElementToBeRemoved(queryByText("hello"))
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { queryByText } = render(<App />)
        await waitForElementToBeRemoved(function() {
          queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { queryByText } = render(<App />)
        await waitForElementToBeRemoved(function() {
          return queryByText("hello")
        })
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(() => screen.getByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(() => screen.findByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          screen.getByText("hello")
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          screen.findByText("hello")
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          return screen.getByText("hello")
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(() => {
          return screen.findByText("hello")
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(screen.getByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(screen.findByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          return screen.getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          return screen.findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          screen.getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          screen.findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { getByText } = screen
        await waitForElementToBeRemoved(function() {
          getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { getByText } = render(<App />)
        await waitForElementToBeRemoved(function() {
          getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = screen
        await waitForElementToBeRemoved(function() {
          findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { findByText } = render
        await waitForElementToBeRemoved(function() {
          findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { getByText } = screen
        await waitForElementToBeRemoved(function() {
          return getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { getByText } = render(<App />)
        await waitForElementToBeRemoved(function() {
          return getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = screen
        await waitForElementToBeRemoved(function() {
          return findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { findByText } = render(<App />)
        await waitForElementToBeRemoved(function() {
          return findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { getByText } = screen
        await waitForElementToBeRemoved(() => {
          return getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { getByText } = render(<App />)
        await waitForElementToBeRemoved(() => {
          return getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = screen
        await waitForElementToBeRemoved(() => {
          return findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = render(<App />)
        await waitForElementToBeRemoved(() => {
          return findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { getByText } = screen
        await waitForElementToBeRemoved(() => {
          getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { getByText } = render(<App />)
        await waitForElementToBeRemoved(() => {
          getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = screen
        await waitForElementToBeRemoved(() => {
          findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { findByText } = render(<App />)
        await waitForElementToBeRemoved(() => {
          findByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = screen
        await waitForElementToBeRemoved(() => findByText('hey'))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { findByText } = render(<App />)
        await waitForElementToBeRemoved(() => findByText('hey'))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { getByText } = screen
        await waitForElementToBeRemoved(getByText('hey'))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { getByText } = render(<App />)
        await waitForElementToBeRemoved(getByText('hey'))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { findByText } = screen
        await waitForElementToBeRemoved(findByText('hey'))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';

        const { findByText } = render(<App />)
        await waitForElementToBeRemoved(findByText('hey'))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 5,
          column: 41,
        },
      ],
    },
  ],
});
