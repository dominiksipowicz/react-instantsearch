import algoliasearchHelper from 'algoliasearch-helper';
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
import type { SearchResults } from 'algoliasearch-helper';
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

export type InitialResults = Record<string, SearchResults>;

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
    () =>
      serverAdapter(
        instantsearch(stableProps),
        stableProps,
        serverContext,
        serverState
      ),
    [stableProps, serverContext, serverState]
  );
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    warn(
      suppressExperimentalWarning,
      'This version is experimental and not production-ready.\n\n' +
        'Please report any bugs at https://github.com/algolia/react-instantsearch/issues/new?template=Bug_report_Hooks.md&labels=Scope%3A%20Hooks\n\n' +
        '(To disable this warning, pass `suppressExperimentalWarning` to <InstantSearch />.)'
    );
  }, [suppressExperimentalWarning]);

  useEffect(() => {
    addAlgoliaAgents(stableProps.searchClient, defaultUserAgents);
  }, [stableProps.searchClient]);

  useEffect(() => {
    // On SSR, the instance is already manually started to inject the Helper.
    if (!search.started) {
      search.start();
      forceUpdate();
    }

    return () => {
      if (search.started) {
        search.dispose();
        forceUpdate();
      }
    };
  }, [search, serverState, forceUpdate]);

  return search;
}

function serverAdapter(
  search: InstantSearch,
  props: UseInstantSearchProps,
  serverContext: InstantSearchServerApi | null,
  serverState: Partial<InstantSearchServerState> | null
): InstantSearch {
  const isServerSideRendering = Boolean(serverState?.initialResults);

  if (serverContext || isServerSideRendering) {
    // We create a Helper and inject it in the search instance to get notified
    // of the search events on the server.
    const helper = algoliasearchHelper(props.searchClient, props.indexName);
    helper.search = () => helper.searchOnlyWithDerivedHelpers();
    helper.on('error', ({ error }) => {
      search.emit('error', { error });
    });

    search.helper = helper;
    search.mainHelper = helper;

    // We patch the `scheduleSearch()` method to skip the frontend network request
    // made when `addWidgets()` gets called. We don't need to query Algolia because
    // we already have the results passed by the SSR Provider.
    // This patch works with all kinds of search clients. However, it's not yet
    // cached in the search client, meaning that the same query happening another
    // time (e.g., hitting `space`, and then `backspace`) will hit the network.
    search.scheduleSearch = defer(noop);

    // We manually subscribe all middleware. This brings support for routing.
    search.middleware.forEach(({ instance }) => {
      instance.subscribe();
    });

    // We directly initialize the main index with the search that we've patched
    // because we don't rely on `start()` on the server.
    search.mainIndex.init({
      instantSearchInstance: search,
      parent: null,
      uiState: search._initialUiState,
    });

    // We manually flag the search as started to have an internal state as close
    // as the original `start()` method.
    search.started = true;

    if (serverContext) {
      // We add user agents in an effect on the browser. Since effects are not
      // run on the server, we need to add user agents here.
      addAlgoliaAgents(props.searchClient, [
        ...defaultUserAgents,
        `react-instantsearch-server (${version})`,
      ]);

      // We notify `getServerState()` of the InstantSearch internals to retrieve
      // the server state and pass it to the next render pass on SSR.
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
