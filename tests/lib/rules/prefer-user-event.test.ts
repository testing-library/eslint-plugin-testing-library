import { InvalidTestCase, ValidTestCase } from '@typescript-eslint/experimental-utils/dist/ts-eslint'
import { createRuleTester } from '../test-utils';
import { LIBRARY_MODULES } from '../../../lib/utils';
import rule, { RULE_NAME, MessageIds, Options, UserEventMethods, MappingToUserEvent } from '../../../lib/rules/prefer-user-event';

function createScenarioWithImport<T extends ValidTestCase<Options> | InvalidTestCase<MessageIds, Options>>(callback: (libraryModule: string, fireEventMethod: string) => T) {
  return LIBRARY_MODULES.reduce((acc: any, libraryModule) => 
    acc.concat(
      Object
        .keys(MappingToUserEvent)
        .map((fireEventMethod) => callback(libraryModule, fireEventMethod))
    )
  , [])
}

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { screen } from '@testing-library/user-event'
        const element = screen.getByText(foo)
      `
    },
    {
      code: `
        const utils = render(baz)
        const element = utils.getByText(foo)
      `
    },
    ...UserEventMethods.map((userEventMethod) => ({
      code: `
        import userEvent from '@testing-library/user-event'
        const node = document.createElement(elementType)
        userEvent.${userEventMethod}(foo)
      `
    })),
    ...createScenarioWithImport<ValidTestCase<Options>>((libraryModule: string, fireEventMethod: string) => ({
      code: `
        import { fireEvent } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEvent.${fireEventMethod}(foo)
      `,
      options: [{ allowedMethods: [fireEventMethod] }]
    })),
    ...createScenarioWithImport<ValidTestCase<Options>>((libraryModule: string, fireEventMethod: string) => ({
        code: `
        import { fireEvent as fireEventAliased } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEventAliased.${fireEventMethod}(foo)
      `,
      options: [{ allowedMethods: [fireEventMethod] }]
    })),
    ...createScenarioWithImport<ValidTestCase<Options>>((libraryModule: string, fireEventMethod: string) => ({
      code: `
        import * as dom from '${libraryModule}'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
      options: [{ allowedMethods: [fireEventMethod] }]
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      // imported fireEvent and not used, 
      code: `
        import { fireEvent } from '${libraryModule}'
        import * as foo from 'someModule'
        foo.baz()
      `
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      // imported dom, but not using fireEvent
      code: `
        import * as dom from '${libraryModule}'
        const button = dom.screen.getByRole('button')
        const foo = dom.screen.container.querySelector('baz')
      `
    })),
    ...LIBRARY_MODULES.map((libraryModule) => ({
      code: `
        import { fireEvent as aliasedFireEvent } from '${libraryModule}'
        function fireEvent() {
          console.log('foo')
        }
        fireEvent()
    `
    })),
  ],
  invalid: [
    ...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>((libraryModule: string, fireEventMethod: string) => ({
      code: `
        import { fireEvent } from '${libraryModule}'
        const node = document.createElement(elementType)
        fireEvent.${fireEventMethod}(foo)
      `,
      errors: [{
        messageId: 'preferUserEvent'
      }]
    })),
    ...createScenarioWithImport<InvalidTestCase<MessageIds, Options>>((libraryModule: string, fireEventMethod: string) => ({
      code: `
        import * as dom from '${libraryModule}'
        dom.fireEvent.${fireEventMethod}(foo)
      `,
      errors: [{ messageId: 'preferUserEvent' }]
    })),
  ]
});