import React from 'react';

import { InstantSearchSSRContext } from './InstantSearchSSRContext';

import type { InstantSearchServerState } from './InstantSearchSSRContext';
import type { ReactNode } from 'react';

export type InstantSearchSsrProviderProps =
  Partial<InstantSearchServerState> & {
    children?: ReactNode;
  };

/**
 * Provider to pass the server state retrieved from `getServerState()` to
 * <InstantSearch>.
 */
export function InstantSearchSSRProvider({
  children,
  ...props
}: InstantSearchSsrProviderProps) {
  return (
    <InstantSearchSSRContext.Provider value={props}>
      {children}
    </InstantSearchSSRContext.Provider>
  );
}
