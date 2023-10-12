import rule, { RULE_NAME } from '../../../lib/rules/prefer-implicit-assert';
import { ALL_QUERIES_METHODS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const COMBINED_QUERIES_METHODS = [...ALL_QUERIES_METHODS, 'ByIcon'];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `await find${queryMethod}('qux');`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `screen.find${queryMethod}('foo')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `await screen.find${queryMethod}('foo')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const utils = render();
      await utils.find${queryMethod}('foo')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `get${queryMethod}('qux');`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `screen.get${queryMethod}('foo')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const utils = render();
      utils.get${queryMethod}('foo')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `expect(query${queryMethod}('qux')).toBeInTheDocument();`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `expect(query${queryMethod}('qux')).not.toBeInTheDocument();`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const something = await find${queryMethod}('qux');`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const something = get${queryMethod}('qux');`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const something = query${queryMethod}('qux');`,
		})),
	],
	invalid: [
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await find${queryMethod}('qux')).toBeInTheDocument();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await find${queryMethod}('qux')).toBeTruthy();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await find${queryMethod}('qux')).toBeDefined();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await find${queryMethod}('qux')).not.toBeNull();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await find${queryMethod}('qux')).not.toBeFalsy();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await screen.find${queryMethod}('qux')).toBeInTheDocument();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await screen.find${queryMethod}('qux')).toBeTruthy();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await screen.find${queryMethod}('qux')).toBeDefined();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await screen.find${queryMethod}('qux')).not.toBeNull();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(await screen.find${queryMethod}('qux')).not.toBeFalsy();`,
					errors: [
						{
							line: 1,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(await utils.find${queryMethod}('foo')).toBeInTheDocument();`,
					errors: [
						{
							line: 3,
							column: 20,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(await utils.find${queryMethod}('foo')).toBeTruthy();`,
					errors: [
						{
							line: 3,
							column: 20,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(await utils.find${queryMethod}('foo')).toBeDefined();`,
					errors: [
						{
							line: 3,
							column: 20,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(await utils.find${queryMethod}('foo')).not.toBeFalsy();`,
					errors: [
						{
							line: 3,
							column: 20,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(await utils.find${queryMethod}('foo')).not.toBeNull();`,
					errors: [
						{
							line: 3,
							column: 20,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(get${queryMethod}('qux')).toBeInTheDocument();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(get${queryMethod}('qux')).toBeTruthy();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(get${queryMethod}('qux')).toBeDefined();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(get${queryMethod}('qux')).not.toBeNull();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(get${queryMethod}('qux')).not.toBeFalsy();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(screen.get${queryMethod}('qux')).toBeInTheDocument();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(screen.get${queryMethod}('qux')).toBeTruthy();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(screen.get${queryMethod}('qux')).toBeDefined();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(screen.get${queryMethod}('qux')).not.toBeNull();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `expect(screen.get${queryMethod}('qux')).not.toBeFalsy();`,
					errors: [
						{
							line: 1,
							column: 8,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(utils.get${queryMethod}('foo')).toBeInTheDocument();`,
					errors: [
						{
							line: 3,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(utils.get${queryMethod}('foo')).toBeTruthy();`,
					errors: [
						{
							line: 3,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(utils.get${queryMethod}('foo')).toBeDefined();`,
					errors: [
						{
							line: 3,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(utils.get${queryMethod}('foo')).not.toBeFalsy();`,
					errors: [
						{
							line: 3,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
      const utils = render();
      expect(utils.get${queryMethod}('foo')).not.toBeNull();`,
					errors: [
						{
							line: 3,
							column: 14,
							messageId: 'preferImplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				} as const)
		),
	],
});
