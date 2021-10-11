import { createContext } from 'react';

import type { InitialResults } from './useInstantSearch';

export type InstantSearchServerState = {
  initialResults: InitialResults;
};

export const InstantSearchSSRContext =
  createContext<Partial<InstantSearchServerState> | null>(null);

if (__DEV__) {
  InstantSearchSSRContext.displayName = 'InstantSearchSSR';
}
