import { render, waitFor } from '@testing-library/react';
import React, { createRef, StrictMode } from 'react';

import { createSearchClient } from '../../../../../test/mock';
import { Configure } from '../../components/Configure';
import { IndexContext } from '../../lib/IndexContext';
import { noop } from '../../lib/noop';
import { Index } from '../Index';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';
import { wait } from '@testing-library/user-event/dist/utils';

describe('Index', () => {
  test('throws when used outside of <InstantSearch>', () => {
    // Hide the errors from the test logs.
    jest.spyOn(console, 'error').mockImplementation(noop);

    expect(() => {
      render(<Index indexName="childIndex">Children</Index>);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[InstantSearch] The <Index> component must be used within <InstantSearch>."`
    );

    jest.spyOn(console, 'error').mockRestore();
  });

  test('renders children', () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">Children</Index>
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        Children
      </div>
    `);
  });

  test('provides the parent index', () => {
    const searchClient = createSearchClient({});
    let indexContext: IndexWidget | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">
          <IndexContext.Consumer>
            {(context) => {
              indexContext = context;
              return null;
            }}
          </IndexContext.Consumer>
        </Index>
      </InstantSearch>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
    expect(indexContext!.getIndexName()).toEqual('childIndex');
  });

  test('provides the nested parent index', () => {
    const searchClient = createSearchClient({});
    let indexContext: IndexWidget | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">
          <Index indexName="subchildIndex">
            <IndexContext.Consumer>
              {(context) => {
                indexContext = context;
                return null;
              }}
            </IndexContext.Consumer>
          </Index>
        </Index>
      </InstantSearch>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
    expect(indexContext!.getIndexName()).toEqual('subchildIndex');
  });

  test('triggers only one search with nested indices', async () => {
    const searchClient = createSearchClient({});

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <Index indexName="childIndex">
          <Index indexName="subchildIndex" />
        </Index>
      </InstantSearch>
    );

    // @TODO: this is not failing with `useEffect()`
    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(searchClient.search).toHaveBeenCalledWith([
      expect.objectContaining({ indexName: 'indexName' }),
      expect.objectContaining({ indexName: 'childIndex' }),
      expect.objectContaining({ indexName: 'subchildIndex' }),
    ]);
  });

  test('triggers only one search with nested indices in Strict Mode', async () => {
    const searchClient = createSearchClient({});

    render(
      <StrictMode>
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <Index indexName="childIndex">
            <Index indexName="subchildIndex" />
          </Index>
        </InstantSearch>
      </StrictMode>
    );

    // @TODO: this is not failing with `useEffect()`
    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(searchClient.search).toHaveBeenCalledWith([
      expect.objectContaining({ indexName: 'indexName' }),
      expect.objectContaining({ indexName: 'childIndex' }),
      expect.objectContaining({ indexName: 'subchildIndex' }),
    ]);
  });

  test('adds the index only once on CSR', () => {
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    const { unmount } = render(
      <InstantSearchMock>
        <Configure />
      </InstantSearchMock>
    );

    expect(indexContextRef.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexContextRef.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
    unmount();
    expect(indexContextRef.current!.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexContextRef.current!.removeWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
  });

  test('adds the index only once on SSR', () => {
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();
    const initialResults = {
      indexName: {
        state: {},
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };

    const { unmount } = render(
      <InstantSearchSSRProvider initialResults={initialResults}>
        <InstantSearchMock>
          <Configure />
        </InstantSearchMock>
      </InstantSearchSSRProvider>
    );

    expect(indexContextRef.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexContextRef.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
    unmount();
    expect(indexContextRef.current!.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexContextRef.current!.removeWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
  });
});

function createInstantSearchMock() {
  const searchClient = createSearchClient({});
  const indexContextRef = createRef<IndexWidget>();

  function InstantSearchMock({ children }) {
    return (
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <IndexContext.Consumer>
          {(value) => {
            // @ts-ignore `React.RefObject` is typed as immutable
            indexContextRef.current = {
              ...value,
              addWidgets: jest.fn(value!.addWidgets),
              removeWidgets: jest.fn(value!.removeWidgets),
            };

            return (
              <IndexContext.Provider value={indexContextRef.current}>
                <Index indexName="indexName2">{children}</Index>
              </IndexContext.Provider>
            );
          }}
        </IndexContext.Consumer>
      </InstantSearch>
    );
  }

  return {
    InstantSearchMock,
    indexContextRef,
  };
}
