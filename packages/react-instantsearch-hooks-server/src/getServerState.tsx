import { isIndexWidget } from 'instantsearch.js/es/widgets/index/index';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { InstantSearchServerContext } from 'react-instantsearch-hooks';

import type {
  InstantSearchServerApi,
  InstantSearchSsrClient,
  InstantSearchServerState,
  InitialResults,
} from 'react-instantsearch-hooks';
import type { InstantSearch } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';
import type { ReactNode } from 'react';

/**
 * Returns the InstantSearch server state from a component.
 */
export async function getServerState(
  children: ReactNode
): Promise<InstantSearchServerState> {
  const ssrClient: InstantSearchSsrClient = {
    search: undefined,
  };

  const notifyServer: InstantSearchServerApi['notifyServer'] = ({ search }) => {
    ssrClient.search = search;
  };

  renderToString(
    <InstantSearchServerContext.Provider value={{ notifyServer }}>
      {children}
    </InstantSearchServerContext.Provider>
  );

  // We wait for the component to mount so that `notifyServer()` is called.
  await new Promise((resolve) => setTimeout(resolve, 0));

  // If `notifyServer()` is not called by then, it means that <InstantSearch>
  // wasn't within the `children`.
  if (!ssrClient.search) {
    throw new Error(
      "Unable to retrieve InstantSearch's server state in `getServerState()`. Did you mount the <InstantSearch> component?"
    );
  }

  const search = ssrClient.search;

  await waitForResults(search);

  const initialResults = getInitialResults(search.mainIndex);

  return {
    initialResults,
  };
}

/**
 * Waits for the results from the search instance to coordinate the next steps
 * in `getServerState()`.
 */
function waitForResults(search: InstantSearch) {
  const helper = search.mainHelper!;

  helper.searchOnlyWithDerivedHelpers();

  return new Promise<void>((resolve, reject) => {
    // All derived helpers resolve in the same tick so we're safe only relying
    // on the first one.
    helper.derivedHelpers[0].on('result', () => {
      resolve();
    });

    // However, we listen to errors that can happen on any derived helper because
    // any error can be critical.
    helper.derivedHelpers.forEach((derivedHelper) =>
      derivedHelper.on('error', (error) => {
        reject(error);
      })
    );
  });
}

function getInitialResults(rootIndex: IndexWidget): InitialResults {
  function walkIndex(
    indexWidget: IndexWidget,
    callback: (widget: IndexWidget) => void
  ) {
    callback(indexWidget);

    return indexWidget.getWidgets().forEach((widget) => {
      if (!isIndexWidget(widget)) {
        return;
      }

      callback(widget);
      walkIndex(widget, callback);
    });
  }

  const initialResults: InitialResults = {};

  walkIndex(rootIndex, (widget) => {
    initialResults[widget.getIndexId()] = widget.getResults();
  });

  return initialResults;
}
