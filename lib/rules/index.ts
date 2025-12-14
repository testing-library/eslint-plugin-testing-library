import awaitAsyncEvents from './await-async-events';
import awaitAsyncQueries from './await-async-queries';
import awaitAsyncUtils from './await-async-utils';
import consistentDataTestid from './consistent-data-testid';
import noAwaitSyncEvents from './no-await-sync-events';
import noAwaitSyncQueries from './no-await-sync-queries';
import noContainer from './no-container';
import noDebuggingUtils from './no-debugging-utils';
import noDomImport from './no-dom-import';
import noGlobalRegexpFlagInQuery from './no-global-regexp-flag-in-query';
import noManualCleanup from './no-manual-cleanup';
import noNodeAccess from './no-node-access';
import noPromiseInFireEvent from './no-promise-in-fire-event';
import noRenderInLifecycle from './no-render-in-lifecycle';
import noTestIdQueries from './no-test-id-queries';
import noUnnecessaryAct from './no-unnecessary-act';
import noWaitForMultipleAssertions from './no-wait-for-multiple-assertions';
import noWaitForSideEffects from './no-wait-for-side-effects';
import noWaitForSnapshot from './no-wait-for-snapshot';
import preferExplicitAssert from './prefer-explicit-assert';
import preferFindBy from './prefer-find-by';
import preferImplicitAssert from './prefer-implicit-assert';
import preferPresenceQueries from './prefer-presence-queries';
import preferQueryByDisappearance from './prefer-query-by-disappearance';
import preferQueryMatchers from './prefer-query-matchers';
import preferScreenQueries from './prefer-screen-queries';
import preferUserEvent from './prefer-user-event';
import renderResultNamingConvention from './render-result-naming-convention';

export default {
	'await-async-events': awaitAsyncEvents,
	'await-async-queries': awaitAsyncQueries,
	'await-async-utils': awaitAsyncUtils,
	'consistent-data-testid': consistentDataTestid,
	'no-await-sync-events': noAwaitSyncEvents,
	'no-await-sync-queries': noAwaitSyncQueries,
	'no-container': noContainer,
	'no-debugging-utils': noDebuggingUtils,
	'no-dom-import': noDomImport,
	'no-global-regexp-flag-in-query': noGlobalRegexpFlagInQuery,
	'no-manual-cleanup': noManualCleanup,
	'no-node-access': noNodeAccess,
	'no-promise-in-fire-event': noPromiseInFireEvent,
	'no-render-in-lifecycle': noRenderInLifecycle,
	'no-test-id-queries': noTestIdQueries,
	'no-unnecessary-act': noUnnecessaryAct,
	'no-wait-for-multiple-assertions': noWaitForMultipleAssertions,
	'no-wait-for-side-effects': noWaitForSideEffects,
	'no-wait-for-snapshot': noWaitForSnapshot,
	'prefer-explicit-assert': preferExplicitAssert,
	'prefer-find-by': preferFindBy,
	'prefer-implicit-assert': preferImplicitAssert,
	'prefer-presence-queries': preferPresenceQueries,
	'prefer-query-by-disappearance': preferQueryByDisappearance,
	'prefer-query-matchers': preferQueryMatchers,
	'prefer-screen-queries': preferScreenQueries,
	'prefer-user-event': preferUserEvent,
	'render-result-naming-convention': renderResultNamingConvention,
};
