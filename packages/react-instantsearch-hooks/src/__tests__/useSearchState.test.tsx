import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { createInstantSearchTestWrapper } from '../../../../test/utils';
import { useSearchBox } from '../connectors/useSearchBox';
import { useSearchState } from '../lib/useSearchState';

function SearchBox() {
  useSearchBox({});
  return null;
}

describe('useSearchState', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useSearchState(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      uiState: {
        indexName: {},
      },
      indexUiState: {},
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      uiState: {
        indexName: {},
      },
      indexUiState: {},
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
    });
  });

  test('returns the connector render state with initial state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      initialUiState: {
        indexName: {
          query: 'iphone',
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useSearchState(), {
      wrapper: ({ children }) =>
        wrapper({
          children: (
            <>
              <SearchBox />
              {children}
            </>
          ),
        }),
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      uiState: {
        indexName: { query: 'iphone' },
      },
      indexUiState: { query: 'iphone' },
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      uiState: {
        indexName: { query: 'iphone' },
      },
      indexUiState: { query: 'iphone' },
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
    });
  });
});
