import instantsearch from 'instantsearch.js';
import { defer } from 'instantsearch.js/es/lib/utils';
import { useEffect, useMemo, version as ReactVersion } from 'react';

import { useForceUpdate } from './useForceUpdate';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useInstantSearchSsrContext } from './useInstantSearchSsrContext';
import { useStableValue } from './useStableValue';
import { noop, warn } from './utils';
import version from './version';

import type { InstantSearchServerApi } from './InstantSearchServerContext';
import type { InstantSearchServerState } from './InstantSearchSSRContext';
import type {
  InstantSearchOptions,
  InstantSearch,
  SearchClient,
} from 'instantsearch.js';

const defaultUserAgents = [
  `react (${ReactVersion})`,
  `react-instantsearch (${version})`,
  `react-instantsearch-hooks (${version})`,
];

export type UseInstantSearchProps = InstantSearchOptions & {
  /**
   * Removes the console warning about the experimental version.
   *
   * Note that this warning is only displayed in development mode.
   *
   * @default false
   */
  suppressExperimentalWarning?: boolean;
};

export function useInstantSearch({
  suppressExperimentalWarning = false,
  ...props
}: UseInstantSearchProps) {
  const serverContext = useInstantSearchServerContext();
  const serverState = useInstantSearchSsrContext();
  const stableProps = useStableValue(props);
  const search = useMemo(
    () => serverAdapter(stableProps, serverContext, serverState),
    [stableProps, serverContext, serverState]
  );
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    warn(
      suppressExperimentalWarning,
      'This version is experimental and not production-ready.\n\n' +
        'Please report any bugs at https://github.com/algolia/react-instantsearch/issues/new?template=Bug_report_Hooks.md&labels=Scope%3A%20Hooks\n\n' +
        '(To disable this warning, pass `suppressExperimentalWarning` to <InstantSearch>.)'
    );
  }, [suppressExperimentalWarning]);

  useEffect(() => {
    addAlgoliaAgents(stableProps.searchClient, defaultUserAgents);
  }, [stableProps.searchClient]);

  useEffect(() => {
    // On SSR, the instance is already started so we don't start it again here.
    if (!search.started) {
      search.start();
      forceUpdate();
    }

    return () => {
      search.dispose();
    };
  }, [search, serverState, forceUpdate]);

  return search;
}

function serverAdapter(
  props: UseInstantSearchProps,
  serverContext: InstantSearchServerApi | null,
  serverState: Partial<InstantSearchServerState> | null
): InstantSearch {
  const initialResults = serverState?.initialResults;
  const ssrProps = initialResults ? { initialResults } : {};
  const search = instantsearch({ ...props, ...ssrProps });

  if (serverContext || initialResults) {
    const originalScheduleSearch = search.scheduleSearch;
    // We patch the `scheduleSearch()` method to skip the frontend network request
    // when `addWidgets()` gets called. We don't need to query Algolia because
    // we already have the results passed by the SSR Provider.
    // This patch works with all kinds of search clients. However, it's not yet
    // cached in the search client, meaning that the same query happening another
    // time (e.g., hitting `space`, and then `backspace`) will hit the network.
    search.scheduleSearch = defer(noop);
    search.start();
    // Once widgets are added (we can rely on `defer()` for that), we restore
    // the original `scheduleSearch()` to hook into the lifecycle again.
    defer(() => {
      search.scheduleSearch = originalScheduleSearch;
    });

    if (serverContext) {
      // We add user agents in an effect run on the browser. Since effects are not
      // run on the server, we need to add user agents directly here.
      addAlgoliaAgents(props.searchClient, [
        ...defaultUserAgents,
        `react-instantsearch-server (${version})`,
      ]);

      // We notify `getServerState()` of the InstantSearch internals to retrieve
      // the server state and pass it to the render on SSR.
      serverContext.notifyServer({ search });
    }
  }

  return search;
}

function addAlgoliaAgents(searchClient: SearchClient, userAgents: string[]) {
  if (typeof searchClient.addAlgoliaAgent !== 'function') {
    return;
  }

  userAgents.forEach((userAgent) => {
    searchClient.addAlgoliaAgent!(userAgent);
  });
}
