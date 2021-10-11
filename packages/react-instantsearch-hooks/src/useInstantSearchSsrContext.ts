import { useContext } from 'react';

import { InstantSearchSSRContext } from './InstantSearchSSRContext';

export function useInstantSearchSsrContext() {
  return useContext(InstantSearchSSRContext);
}
