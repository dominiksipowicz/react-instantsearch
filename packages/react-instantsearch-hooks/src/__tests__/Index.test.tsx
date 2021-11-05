import { render } from '@testing-library/react';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import React, { createRef } from 'react';

import { createSearchClient } from '../../../../test/mock';
import { IndexContext } from '../IndexContext';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';
import { Index } from '../SearchIndex';
import { useConfigure } from '../useConfigure';
import { noop } from '../utils';

import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

function Configure(props) {
  useConfigure(props);
  return null;
}

describe('Index', () => {
  test('throws when used outside of <InstantSearch>', () => {
    // Hide the errors from the test logs.
    jest.spyOn(console, 'error').mockImplementation(noop);

    expect(() => {
      render(<Index indexName="childIndex">Children</Index>);
    }).toThrowErrorMatchingInlineSnapshot(
      `"The <Index> component must be used within <InstantSearch>."`
    );

    jest.spyOn(console, 'error').mockRestore();
  });

  test('renders children', () => {
    const searchClient = createSearchClient();

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
    const searchClient = createSearchClient();
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
    const searchClient = createSearchClient();
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
    expect(indexContextRef.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
  });

  test('adds the index only once on SSR', () => {
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();
    const initialResults = {
      indexName: new SearchResults(new SearchParameters(), [
        // @ts-ignore Result is not exhaustive
        {
          hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
        },
      ]),
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
    expect(indexContextRef.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
  });
});

function createInstantSearchMock() {
  const searchClient = createSearchClient();
  const indexContextRef = createRef<IndexWidget>();

  function InstantSearchMock({ children }) {
    return (
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <IndexContext.Consumer>
          {(value) => {
            // @ts-ignore
            indexContextRef.current = {
              ...value,
              addWidgets: jest.fn(),
              removeWidgets: jest.fn(),
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
