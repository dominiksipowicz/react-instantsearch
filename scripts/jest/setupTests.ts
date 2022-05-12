import { TextEncoder } from 'util';
import { warnCache } from '../../packages/react-instantsearch-hooks/src/lib/warn';
import { toWarnDev } from './matchers';

// This makes tests runnable for React InstantSearch Core.
global.TextEncoder = TextEncoder;

expect.extend({ toWarnDev });

// We hide console warnings to not pollute the test logs.
global.console.warn = jest.fn();

beforeEach(() => {
  // We reset the log's cache for our log assertions to be isolated in each test.
  warnCache.current = {};
});
