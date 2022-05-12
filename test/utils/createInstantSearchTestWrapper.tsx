import type { WrapperComponent } from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import React from 'react';
import type { InstantSearchProps } from '../../packages/react-instantsearch-hooks/src';
import { InstantSearch } from '../../packages/react-instantsearch-hooks/src';

import { createSearchClient } from '../mock';

export function createInstantSearchTestWrapper(
  props?: Partial<InstantSearchProps>
) {
  const searchClient = createSearchClient({});
  const wrapper: WrapperComponent<{ children: ReactNode }> = ({ children }) => (
    <InstantSearch searchClient={searchClient} indexName="indexName" {...props}>
      {children}
    </InstantSearch>
  );

  return wrapper;
}
