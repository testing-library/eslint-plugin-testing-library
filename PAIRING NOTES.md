PR REQUESTS

## 1

Can you make the code of the tests more realistic? So at least it's wrapped in a test function like:

import { render, screen } from '@testing-library/react'

test('a fake test', () => {
render(<Component />

expect(${query}('Hello'))${matcher}
})
You would be surprised about the amount of errors this can catch because of unexpected nodes from a more realistic scenario.

## 2

CI failures on Node 16, ESLint 7.5:

```
    ESLint configuration in rule-tester is invalid:
    	- Unexpected top-level property "name".
```

(replicate by `npm install --no-save --force eslint@7.5`) (from pipeline.yml) - may need Node 16 too

X Get “valid” test cases in place mirroring prefer-presence-queries ones
X Get “invalid” test cases in place mirroring prefer-presence-queries ones
X Think about adding line/column checks
X Change to no options by default as the maintainer requested? Or push back on that?
X Think about test coverage and see what other valid/invalid tests are needed to test our specific rule

- See if we need to write custom documentation, and we do it. Check contributor notes for generation
- Consider the public API as we do
  - Whether we agree in the end that there should be no options by default - Dale does not agree with that default, Josh is wishy-washy
  - What the documented proposed options API allows is “for this matcher, allow only this one query type (get-query vs query-query)“. Does this make sense? Dale is indifferent, Josh might want to propose it in the PR
  - Maybe you somehow want to explicitly allow both in some cases - this doesn't seem needed
  - Maybe you want the options to group “here is all the ones that allow get, here are all the ones that allow query”

Ask question of maintainer

- POTENTIAL TESTS
  - Destructuring innerHTML from container and using in expect call
  - Other places to review to find test cases to try
    - In the existing test cases
    - In CallExpression's implementation
- Look into TS error on `.name` properties on Josh's machine
