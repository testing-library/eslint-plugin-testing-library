# testing-library/no-unsettled-absence-query

📝 Disallow absence assertions on `queryBy*` before the component has settled.

<!-- end auto-generated rule header -->

Asserting absence with `queryBy*` + `.not.toBeInTheDocument()` (or `.not.toBeVisible()`) immediately after `render()`, before the component has settled, can produce a false positive. The element isn't there _yet_, not because it _won't_ be there. This is commonly referred to as **Testing Ghosts**.

## Rule details

This rule fires when an absence assertion on a `queryBy*` / `queryAllBy*` query appears before any **settling expression** in the test body.

**What counts as "settled":**

1. Any `await` expression on a preceding statement - covers `findBy*`, `waitFor`, `waitForElementToBeRemoved`, `act`, or custom async helpers.
2. A `getBy*` / `getAllBy*` call on a preceding statement - proves the synchronous render produced expected output.

**Additionally**, absence assertions inside a `waitFor` callback are always flagged, because `waitFor` retries until the assertion passes - an absence check passes on the first invocation before the component has settled.

Examples of **incorrect** code for this rule:

```js
// Absence assertion before component has settled
test('shows no error', () => {
	render(<AsyncComponent />);
	expect(screen.queryByText('error')).not.toBeInTheDocument();
});

// Absence assertion BEFORE the await - order matters
test('shows no error', async () => {
	render(<AsyncComponent />);
	expect(screen.queryByText('error')).not.toBeInTheDocument();
	await screen.findByText('loaded');
});

// queryAllBy variant
test('shows no alerts', () => {
	render(<AsyncComponent />);
	expect(screen.queryAllByRole('alert')).not.toBeInTheDocument();
});

// Absence assertion inside waitFor - passes on first retry, still a ghost
test('shows no error', async () => {
	render(<AsyncComponent />);
	await waitFor(() => {
		expect(screen.queryByText('error')).not.toBeInTheDocument();
	});
});
```

Examples of **correct** code for this rule:

```js
// findBy* settles the component first
test('shows no error', async () => {
	render(<AsyncComponent />);
	await screen.findByText('loaded');
	expect(screen.queryByText('error')).not.toBeInTheDocument();
});

// waitFor settles the component first
test('shows no error', async () => {
	render(<AsyncComponent />);
	await waitFor(() => expect(something).toBe(true));
	expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

// act settles the component first
test('shows no error', async () => {
	await act(() => render(<AsyncComponent />));
	expect(screen.queryByText('error')).not.toBeInTheDocument();
});

// getBy* proves sync render completed
test('shows no error', () => {
	render(<Component />);
	screen.getByText('visible heading');
	expect(screen.queryByText('error')).not.toBeInTheDocument();
});

// waitForElementToBeRemoved is a settling expression on its own
test('shows no error', async () => {
	render(<Component />);
	await waitForElementToBeRemoved(() => screen.queryByText('loading'));
	expect(screen.queryByText('error')).not.toBeInTheDocument();
});
```

## Limitations

This rule uses static analysis and only inspects the immediate test function body. Some patterns may produce false positives:

- **Custom helpers**: the rule does not look inside helper functions called from the test body. An async helper called with `await` is recognized (the `await` itself counts as settling), but a synchronous helper that performs settling internally is not.
- **Fake timers**: manually flushing time with `jest.advanceTimersByTime` / `vi.advanceTimersByTime` is not recognized as a settling expression.
- **Lifecycle hooks**: settling performed in `beforeEach` / `beforeAll` is not visible from inside the test body.
- **Synchronous `act()`**: only `await act(...)` counts as a settling expression; a non-awaited `act(() => ...)` is not detected.

When the rule misfires on a valid pattern, prefer disabling it inline with `// eslint-disable-next-line testing-library/no-unsettled-absence-query` over silencing it globally.

## Further Reading

- [Testing Library: Appearance and Disappearance guide](https://testing-library.com/docs/guide-disappearance/)
- [Kent C. Dodds: Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Gerardo Perrucci: Stop Testing Ghosts](https://www.gperrucci.com/blog/react/assert-non-existence-react-testing-library)
