import rule from '../../src/rules/prefer-top-level-configure';
import { createRuleTester } from '../test-utils';

import type { MessageIds } from '../../src/rules/prefer-top-level-configure';
import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

type RuleInvalidTestCase = InvalidTestCase<MessageIds, []>;

const ruleTester = createRuleTester();

const invalidConfigure = (
	code: string,
	line: number,
	column: number,
	messageId: MessageIds = 'preferTopLevelConfigure'
): RuleInvalidTestCase => ({
	code,
	errors: [{ line, column, messageId }],
});

ruleTester.run(rule.name, rule, {
	valid: [
		{
			code: `
        import { configure } from '@testing-library/dom';
        configure({ testIdAttribute: 'data-test-id' });
      `,
		},
		{
			code: `
        import { configure as configureTestingLibrary } from '@testing-library/react';
        configureTestingLibrary({ reactStrictMode: true });
      `,
		},
		{
			code: `
        import * as testingLibrary from '@testing-library/angular';
        testingLibrary.configure({});
      `,
		},
		{
			code: `
        const { configure } = require('@testing-library/react');
        configure({});
      `,
		},
		{
			code: `
        import { configure } from '@testing-library/react';
        void configure({ reactStrictMode: true });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { render } from 'test-utils';
        import { configure } from 'another-module';

        test('unrelated configure is ignored', () => {
          configure({});
        });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { render } from 'test-utils';

        function configure() {}
        test('local configure is ignored', () => {
          configure();
        });
      `,
		},
		{
			code: `
        function configure() {}
        test('local configure is ignored', () => {
          configure();
        });
      `,
		},
		{
			code: `
        import { configure } from 'another-module';
        test('unrelated configure import is ignored', () => {
          configure({});
        });
      `,
		},
		{
			code: `
        const client = { configure() {} };
        test('unrelated configure method is ignored', () => {
          client.configure();
        });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'off' },
			code: `
        import { configure } from '@testing-library/react';
        test('shadowed configure import is ignored', () => {
          const configure = () => {};
          configure();
        });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'off' },
			code: `
        import { configure as setConfig } from '@testing-library/react';
        test('shadowed configure alias is ignored', () => {
          const setConfig = () => {};
          setConfig();
        });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'off' },
			code: `
        import * as testingLibrary from '@testing-library/dom';
        test('shadowed namespace import is ignored', () => {
          const testingLibrary = { configure() {} };
          testingLibrary.configure();
        });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'off' },
			code: `
        import { configure } from '@testing-library/react';
        test('shadowed configure parameter is ignored', (configure) => {
          configure();
        });
      `,
		},
		{
			code: `
        import * as testingLibrary from '@testing-library/dom';
        const configure = 'render';
        test('dynamic namespace member is ignored', () => {
          testingLibrary[configure]({});
        });
      `,
		},
	],
	invalid: [
		invalidConfigure(
			`import { configure } from '@testing-library/react';
test('configures once', () => {
  configure({ reactStrictMode: true });
});`,
			3,
			3
		),
		invalidConfigure(
			`import { configure as setupTestingLibrary } from '@testing-library/react';
it('configures once', () => {
  setupTestingLibrary({ reactStrictMode: true });
});`,
			3,
			3
		),
		invalidConfigure(
			`import * as testingLibrary from '@testing-library/dom';
beforeEach(() => {
  testingLibrary.configure({});
});`,
			3,
			18
		),
		invalidConfigure(
			`const { configure } = require('@testing-library/react');
function configureForTest() {
  configure({});
}
configureForTest();`,
			3,
			3
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			...invalidConfigure(
				`import { configure as setConfig } from 'test-utils';
test('configures once', () => {
  setConfig({});
});`,
				3,
				3
			),
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			...invalidConfigure(
				`const { configure: setConfig } = require('test-utils');
test('configures once', () => {
  setConfig({});
});`,
				3,
				3
			),
		},
		invalidConfigure(
			`import { configure } from '@testing-library/dom';
if (process.env.CI) {
  configure({});
}`,
			3,
			3
		),
		invalidConfigure(
			`const testingLibrary = require('@testing-library/dom');
test('configures once', () => {
  testingLibrary.configure({});
});`,
			3,
			18
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			...invalidConfigure(
				`import * as testingLibrary from 'test-utils';
test('configures once', () => {
  testingLibrary.configure({});
});`,
				3,
				18
			),
		},
		{
			settings: { 'testing-library/utils-module': 'off' },
			...invalidConfigure(
				`import { render } from '@testing-library/react';
import * as testingLibrary from '@testing-library/dom';
test('configures once', () => {
  testingLibrary.configure({});
});`,
				4,
				18
			),
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			...invalidConfigure(
				`import { render } from 'test-utils';
import * as testingLibrary from '@testing-library/dom';
test('configures once', () => {
  testingLibrary.configure({});
});`,
				4,
				18
			),
		},
		invalidConfigure(
			`import * as testingLibrary from '@testing-library/dom';
test('configures once', () => {
  testingLibrary['configure']({});
});`,
			3,
			3
		),
	],
});
