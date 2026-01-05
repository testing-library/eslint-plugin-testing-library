# testing-library/no-render-in-lifecycle

📝 Disallow the use of `render` in testing frameworks setup functions.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

<!-- end auto-generated rule header -->

## Rule Details

This rule disallows the usage of `render` (or a custom render function) in testing framework setup functions (`beforeEach` and `beforeAll`) in favor of moving `render` closer to test assertions.

This rule reduces the amount of variable mutation, in particular avoiding nesting `beforeEach` functions. According to Kent C. Dodds, that results in vastly simpler test maintenance.

For more background on the origin and rationale for this best practice, read Kent C. Dodds's [Avoid Nesting when you're Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing).

Examples of **incorrect** code for this rule:

```js
beforeEach(() => {
	render(<MyComponent />);
});

it('Should have foo', () => {
	expect(screen.getByText('foo')).toBeInTheDocument();
});

it('Should have bar', () => {
	expect(screen.getByText('bar')).toBeInTheDocument();
});
```

```js
const setup = () => render(<MyComponent />);

beforeEach(() => {
	setup();
});

it('Should have foo', () => {
	expect(screen.getByText('foo')).toBeInTheDocument();
});

it('Should have bar', () => {
	expect(screen.getByText('bar')).toBeInTheDocument();
});
```

```js
beforeAll(() => {
	render(<MyComponent />);
});

it('Should have foo', () => {
	expect(screen.getByText('foo')).toBeInTheDocument();
});

it('Should have bar', () => {
	expect(screen.getByText('bar')).toBeInTheDocument();
});
```

Examples of **correct** code for this rule:

```js
it('Should have foo and bar', () => {
	render(<MyComponent />);
	expect(screen.getByText('foo')).toBeInTheDocument();
	expect(screen.getByText('bar')).toBeInTheDocument();
});
```

```js
const setup = () => render(<MyComponent />);

beforeEach(() => {
	// other stuff...
});

it('Should have foo and bar', () => {
	setup();
	expect(screen.getByText('foo')).toBeInTheDocument();
	expect(screen.getByText('bar')).toBeInTheDocument();
});
```

## Options

If you would like to allow the use of `render` (or a custom render function) in _either_ `beforeAll` or `beforeEach`, this can be configured using the option `allowTestingFrameworkSetupHook`. This may be useful if you have configured your tests to [skip auto cleanup](https://testing-library.com/docs/react-testing-library/setup#skipping-auto-cleanup). `allowTestingFrameworkSetupHook` is an enum that accepts either `"beforeAll"` or `"beforeEach"`.

```
   "testing-library/no-render-in-lifecycle": ["error", {"allowTestingFrameworkSetupHook": "beforeAll"}],
```
