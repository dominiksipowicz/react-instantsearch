import { createContext } from 'react';

import type { InstantSearch } from 'instantsearch.js';

export type InstantSearchSsrClient = {
  search?: InstantSearch;
};

export type InstantSearchServerApi = {
  /**
   * Returns search internals to access them in `getServerState()`.
   */
  notifyServer(params: Required<InstantSearchSsrClient>): void;
};

export const InstantSearchServerContext =
  createContext<InstantSearchServerApi | null>(null);

if (__DEV__) {
  InstantSearchServerContext.displayName = 'InstantSearchServer';
}
