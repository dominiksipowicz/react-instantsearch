import { act, render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SearchBox } from 'react-instantsearch-hooks-dom';

import { InstantSearch } from '../..';
import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { createInstantSearchTestWrapper } from '../../../../../test/utils';
import { useQueryRules } from '../useQueryRules';
import { useRefinementList } from '../useRefinementList';

import type { InstantSearchProps } from '../..';
import type { UseRefinementListProps } from '../useRefinementList';

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}

describe('useQueryRules', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();

    const trackedFilters = {
      genre: () => ['Comedy', 'Thriller'],
      rating: (values) => values,
    };

    const transformRuleContexts = (ruleContexts) =>
      ruleContexts.map((ruleContext) => ruleContext.replace('ais-', 'custom-'));

    const transformItems = (items) =>
      items.map((item) => ({
        ...item,
        title: `${item.title} (transformed)`,
      }));

    const { result, waitForNextUpdate } = renderHook(
      () =>
        useQueryRules({
          trackedFilters,
          transformRuleContexts,
          transformItems,
        }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [],
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      items: [
        {
          title: 'Banner title (transformed)',
          banner: 'https://banner.jpg',
          link: 'https://banner.com/link/',
        },
      ],
    });
  });

  test('runs latest version of trackedFilters functions', async () => {
    let brands = ['Apple'];
    const searchClient = createSearchClient({
      search: jest.fn((requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map((request) =>
              createSingleSearchResponse({
                index: request.indexName,
              })
            )
          )
        )
      ),
    });

    function QueryRules() {
      useQueryRules({
        trackedFilters: {
          brand: () => brands,
        },
      });

      return null;
    }

    function App(props: Partial<InstantSearchProps>) {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          initialUiState={{
            indexName: {
              refinementList: {
                brand: ['Apple', 'Samsung'],
              },
            },
          }}
          {...props}
        >
          <QueryRules />
          <SearchBox placeholder="Search" />
          <RefinementList attribute="brand" />
        </InstantSearch>
      );
    }

    act(() => {
      render(<App />);
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: {
          facetFilters: [['brand:Apple', 'brand:Samsung']],
          facets: ['brand'],
          maxValuesPerFacet: 10,
          query: '',
          ruleContexts: ['ais-brand-Apple'],
          tagFilters: '',
        },
      },
      {
        indexName: 'indexName',
        params: {
          analytics: false,
          attributesToHighlight: [],
          attributesToRetrieve: [],
          attributesToSnippet: [],
          clickAnalytics: false,
          facets: 'brand',
          hitsPerPage: 1,
          maxValuesPerFacet: 10,
          page: 0,
          query: '',
          ruleContexts: ['ais-brand-Apple'],
          tagFilters: '',
        },
      },
    ]);

    // We update a variable that is used in `transformItems()` to check that the
    // value is not stale when called.
    brands = ['Samsung'];

    // We trigger an update
    act(() => {
      const input = screen.queryByPlaceholderText('Search') as HTMLInputElement;
      userEvent.type(input, 'q');
    });

    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: {
          facetFilters: [['brand:Apple', 'brand:Samsung']],
          facets: ['brand'],
          maxValuesPerFacet: 10,
          query: 'q',
          ruleContexts: ['ais-brand-Samsung'],
          tagFilters: '',
        },
      },
      {
        indexName: 'indexName',
        params: {
          analytics: false,
          attributesToHighlight: [],
          attributesToRetrieve: [],
          attributesToSnippet: [],
          clickAnalytics: false,
          facets: 'brand',
          hitsPerPage: 1,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'q',
          ruleContexts: ['ais-brand-Samsung'],
          tagFilters: '',
        },
      },
    ]);
  });
});
