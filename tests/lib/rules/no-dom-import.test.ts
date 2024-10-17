import rule, { RULE_NAME } from '../../../lib/rules/no-dom-import';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	{
		configOption: 'angular',
		oldName: '@testing-library/angular',
		newName: '@testing-library/angular',
	},
	{
		configOption: 'react',
		oldName: 'react-testing-library',
		newName: '@testing-library/react',
	},
	{
		configOption: 'vue',
		oldName: 'vue-testing-library',
		newName: '@testing-library/vue',
	},
	{
		configOption: 'marko',
		oldName: '@marko/testing-library',
		newName: '@marko/testing-library',
	},
];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		'import { foo } from "foo"',
		'import "foo"',
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap(({ oldName, newName }) =>
			[oldName, newName].flatMap((testingFramework) => [
				`import { fireEvent } from "${testingFramework}"`,
				`import * as testing from "${testingFramework}"`,
				`import "${testingFramework}"`,
			])
		),
		'const { foo } = require("foo")',
		'require("foo")',
		'require("")',
		'require()',
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap(({ oldName, newName }) =>
			[oldName, newName].flatMap((testingFramework) => [
				`const { fireEvent } = require("${testingFramework}")`,
				`const { fireEvent: testing } = require("${testingFramework}")`,
				`require("${testingFramework}")`,
			])
		),
		{
			code: 'import { fireEvent } from "test-utils"',
			settings: { 'testing-library/utils-module': 'test-utils' },
		},
	],
	invalid: [
		{
			code: 'import { fireEvent } from "dom-testing-library"',
			errors: [
				{
					messageId: 'noDomImport',
				},
			],
			output: 'import { fireEvent } from "dom-testing-library"',
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      // case: dom-testing-library imported with custom module setting
      import { fireEvent } from "dom-testing-library"`,
			errors: [
				{
					line: 3,
					messageId: 'noDomImport',
				},
			],
			output: `
      // case: dom-testing-library imported with custom module setting
      import { fireEvent } from "dom-testing-library"`,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap(
			({ configOption, oldName, newName }) =>
				[true, false].flatMap((isOldImport) =>
					// Single quote or double quotes should not be replaced
					[`'`, `"`].flatMap((quote) => [
						{
							code: `const { fireEvent } = require(${quote}${
								isOldImport ? 'dom-testing-library' : '@testing-library/dom'
							}${quote})`,
							options: [configOption],
							errors: [
								{
									data: { module: isOldImport ? oldName : newName },
									messageId: 'noDomImportFramework',
								},
							],
							output: `const { fireEvent } = require(${quote}${
								isOldImport ? oldName : newName
							}${quote})`,
						} as const,
						{
							code: `import { fireEvent } from ${quote}${
								isOldImport ? 'dom-testing-library' : '@testing-library/dom'
							}${quote}`,
							options: [configOption],
							errors: [
								{
									data: { module: isOldImport ? oldName : newName },
									messageId: 'noDomImportFramework',
								},
							],
							output: `import { fireEvent } from ${quote}${
								isOldImport ? oldName : newName
							}${quote}`,
						} as const,
					])
				)
		),
		{
			code: 'import * as testing from "dom-testing-library"',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
      // case: dom-testing-library wildcard imported with custom module setting
      import * as testing from "dom-testing-library"`,
			errors: [{ line: 3, messageId: 'noDomImport' }],
		},
		{
			code: 'import { fireEvent } from "@testing-library/dom"',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
      // case: @testing-library/dom imported with custom module setting
      import { fireEvent } from "@testing-library/dom"`,
			errors: [{ line: 3, messageId: 'noDomImport' }],
		},
		{
			code: 'import * as testing from "@testing-library/dom"',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			code: 'import "dom-testing-library"',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			code: 'import "@testing-library/dom"',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			code: 'const { fireEvent } = require("dom-testing-library")',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
      // case: dom-testing-library required with custom module setting
      const { fireEvent } = require("dom-testing-library")`,
			errors: [{ line: 3, messageId: 'noDomImport' }],
		},
		{
			code: 'const { fireEvent } = require("@testing-library/dom")',
			errors: [{ messageId: 'noDomImport' }],
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap(
			({ configOption, oldName, newName }) =>
				[true, false].map(
					(isOldImport) =>
						({
							settings: { 'testing-library/utils-module': 'test-utils' },
							code: `
                // case: @testing-library/dom required with custom module setting
                const { fireEvent } = require("${
									isOldImport ? 'dom-testing-library' : '@testing-library/dom'
								}")
              `,
							options: [configOption],
							errors: [
								{
									data: { module: isOldImport ? oldName : newName },
									messageId: 'noDomImportFramework',
								},
							],
							output: `
                // case: @testing-library/dom required with custom module setting
                const { fireEvent } = require("${
									isOldImport ? oldName : newName
								}")
              `,
						}) as const
				)
		),
		{
			code: 'require("dom-testing-library")',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			code: 'require("@testing-library/dom")',
			errors: [{ messageId: 'noDomImport' }],
		},
		{
			code: `
			require("@testing-library/dom");
			require("@testing-library/react");`,
			errors: [{ line: 2, messageId: 'noDomImport' }],
		},
		{
			code: `
			import { render } from '@testing-library/react';
			import { screen } from '@testing-library/dom';`,
			errors: [{ line: 3, messageId: 'noDomImport' }],
		},
	],
});
