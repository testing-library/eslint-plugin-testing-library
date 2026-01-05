# testing-library/no-manual-cleanup

📝 Disallow the use of `cleanup`.

💼 This rule is enabled in the following configs: ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

<!-- end auto-generated rule header -->

`cleanup` is performed automatically if the testing framework you're using supports the `afterEach` global (like mocha, Jest, and Jasmine). In this case, it's unnecessary to do manual cleanups after each test unless you skip the auto-cleanup with environment variables such as `RTL_SKIP_AUTO_CLEANUP` for React.

## Rule Details

This rule disallows the import/use of `cleanup` in your test files. It fires if you import `cleanup` from one of these libraries:

- [Marko Testing Library](https://testing-library.com/docs/marko-testing-library/api#cleanup)
- [Preact Testing Library](https://testing-library.com/docs/preact-testing-library/api#cleanup)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/api#cleanup)
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/api#cleanup)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/api#cleanup)

Examples of **incorrect** code for this rule:

```js
import { cleanup } from '@testing-library/react';

const { cleanup } = require('@testing-library/react');

import utils from '@testing-library/react';
afterEach(() => utils.cleanup());

const utils = require('@testing-library/react');
afterEach(utils.cleanup);
```

Examples of **correct** code for this rule:

```js
import { cleanup } from 'any-other-library';

const utils = require('any-other-library');
utils.cleanup();
```

## Further Reading

- [cleanup API in React Testing Library](https://testing-library.com/docs/react-testing-library/api#cleanup)
- [Skipping Auto Cleanup](https://testing-library.com/docs/react-testing-library/setup#skipping-auto-cleanup)
