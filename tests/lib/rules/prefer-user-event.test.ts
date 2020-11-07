import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { createRuleTester } from '../test-utils';
import { LIBRARY_MODULES } from '../../../lib/utils';
import rule, {
  RULE_NAME,
  MessageIds,
  Options,
  UserEventMethods,
  MappingToUserEvent,
} from '../../../lib/rules/prefer-user-event';

function createScenarioWithImport<
  T extends ValidTestCase<Options> | InvalidTestCase<MessageIds, Options>
>(callback: (libraryModule: string, fireEventMethod: string) => T) {
  return LIBRARY_MODULES.reduce(
    // can't find the right type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: any, libraryModule) =>
      acc.concat(
        Object.keys(MappingToUserEvent).map((fireEventMethod) =>
          callback(libraryModule, fireEventMethod)
        )
      ),
    []
  );
}

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { screen } from '@testing-library/user-event'
        const element = screen.getByText(foo)
      `,
    },
    {
      code: `
        const utils = render(baz)
        const element = utils.getByText(foo)
      `,
    },
    ...UserEventMethods.map((userEventMethod) => ({
      code: `
        import userEvent from '@testing-library/user-event'
        const node = document.createElement(elementType)
        userEvent.${userEventMethod}(foo)
      `,
    })),
    ...createScenarioWithImport<ValidTestCase<Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        import { fireEvent } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEvent.${fireEventMethod}(foo)
      `,
        options: [{ allowedMethods: [fireEventMethod] }],
      })
    ),
    ...createScenarioWithImport<ValidTestCase<Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        import { fireEvent as fireEventAliased } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEventAliased.${fireEventMethod}(foo)
      `,
        options: [{ allowedMethods: [fireEventMethod] }],
      })
    ),
    ...createScenarioWithImport<ValidTestCase<Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        import * as dom from '${libraryModule}'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
        options: [{ allowedMethods: [fireEventMethod] }],
      })
    ),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      // imported fireEvent and not used,
      code: `
        import { fireEvent } from '${libraryModule}'
        import * as foo from 'someModule'
        foo.baz()
      `,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      // imported dom, but not using fireEvent
      code: `
        import * as dom from '${libraryModule}'
        const button = dom.screen.getByRole('button')
        const foo = dom.screen.container.querySelector('baz')
      `,
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `
        import { fireEvent as aliasedFireEvent } from '${libraryModule}'
        function fireEvent() {
          console.log('foo')
        }
        fireEvent()
    `,
    })),
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import { screen } from 'test-utils'
        const element = screen.getByText(foo)
      `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import { render } from 'test-utils'
        const utils = render(baz)
        const element = utils.getByText(foo)
      `,
    },
    ...UserEventMethods.map((userEventMethod) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import userEvent from 'test-utils'
        const node = document.createElement(elementType)
        userEvent.${userEventMethod}(foo)
      `,
    })),
    ...Object.keys(MappingToUserEvent).map((fireEventMethod: string) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      import { fireEvent } from 'test-utils'
      const node = document.createElement(elementType)
      fireEvent.${fireEventMethod}(foo)
    `,
      options: [{ allowedMethods: [fireEventMethod] }],
    })),
    ...Object.keys(MappingToUserEvent).map((fireEventMethod: string) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      import { fireEvent as fireEventAliased } from 'test-utils'
      const node = document.createElement(elementType)
      fireEventAliased.${fireEventMethod}(foo)
    `,
      options: [{ allowedMethods: [fireEventMethod] }],
    })),
    ...Object.keys(MappingToUserEvent).map((fireEventMethod: string) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
      import * as dom from 'test-utils'
      dom.fireEvent.${fireEventMethod}(foo)
    `,
      options: [{ allowedMethods: [fireEventMethod] }],
    })),
  ],
  invalid: [
    ...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        import { fireEvent } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEvent.${fireEventMethod}(foo)
      `,
        errors: [
          {
            messageId: 'preferUserEvent',
          },
        ],
      })
    ),
    ...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        import * as dom from '${libraryModule}'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
        errors: [{ messageId: 'preferUserEvent' }],
      })
    ),
    ...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        const { fireEvent } = require('${libraryModule}')
        fireEvent.${fireEventMethod}(foo)
      `,
        errors: [{ messageId: 'preferUserEvent' }],
      })
    ),
    ...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>(
      (libraryModule: string, fireEventMethod: string) => ({
        code: `
        const rtl = require('${libraryModule}')
        rtl.fireEvent.${fireEventMethod}(foo)
      `,
        errors: [{ messageId: 'preferUserEvent' }],
      })
    ),
    ...Object.keys(MappingToUserEvent).map((fireEventMethod: string) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import * as dom from 'test-utils'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
      errors: [{ messageId: 'preferUserEvent' }],
    })),
    ...Object.keys(MappingToUserEvent).map((fireEventMethod: string) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import { fireEvent } from 'test-utils'
        fireEvent.${fireEventMethod}(foo)
      `,
      errors: [{ messageId: 'preferUserEvent' }],
    })),
    ...Object.keys(MappingToUserEvent).map((fireEventMethod: string) => ({
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        import { fireEvent as fireEventAliased } from 'test-utils'
        fireEventAliased.${fireEventMethod}(foo)
      `,
      errors: [{ messageId: 'preferUserEvent' }],
    })),
  ],
});
