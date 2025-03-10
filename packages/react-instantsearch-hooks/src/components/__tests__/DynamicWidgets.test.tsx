import { act, render, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';

import { createSearchClient } from '../../../../../test/mock';
import { wait } from '../../../../../test/utils';
import { useHierarchicalMenu } from '../../connectors/useHierarchicalMenu';
import { useMenu } from '../../connectors/useMenu';
import { usePagination } from '../../connectors/usePagination';
import { useRefinementList } from '../../connectors/useRefinementList';
import { IndexContext } from '../../lib/IndexContext';
import { DynamicWidgets } from '../DynamicWidgets';
import { Index } from '../Index';
import { InstantSearch } from '../InstantSearch';

import type { UseHierarchicalMenuProps } from '../../connectors/useHierarchicalMenu';
import type { UseMenuProps } from '../../connectors/useMenu';
import type { UsePaginationProps } from '../../connectors/usePagination';
import type { UseRefinementListProps } from '../../connectors/useRefinementList';
import type { InstantSearchProps } from '../InstantSearch';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

function Pagination(props: UsePaginationProps) {
  usePagination(props);
  return 'Pagination' as unknown as JSX.Element;
}

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return `RefinementList(${props.attribute})` as unknown as JSX.Element;
}

function Menu(props: UseMenuProps) {
  useMenu(props);
  return `Menu(${props.attribute})` as unknown as JSX.Element;
}

function HierarchicalMenu(props: UseHierarchicalMenuProps) {
  useHierarchicalMenu(props);
  return `HierarchicalMenu(${props.attributes[0]})` as unknown as JSX.Element;
}

function createInstantSearchMock() {
  const indexContextRef = createRef<IndexWidget>();

  function InstantSearchMock({ children, ...props }: InstantSearchProps) {
    return (
      <InstantSearch {...props}>
        <IndexContext.Consumer>
          {(value) => {
            // @ts-ignore `React.RefObject` is typed as immutable
            indexContextRef.current = value!;

            return (
              <IndexContext.Provider value={value}>
                {children}
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

describe('DynamicWidgets', () => {
  test('throws with components that are non-attribute widgets', () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => {});

    const searchClient = createSearchClient({});

    expect(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <DynamicWidgets>
            <Pagination />
          </DynamicWidgets>
        </InstantSearch>
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `"[InstantSearch] <DynamicWidgets> only supports InstantSearch widgets with an \`attribute\` or \`attributes\` prop."`
    );

    consoleError.mockRestore();
  });

  test('throws with string components', () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => {});

    const searchClient = createSearchClient({});

    expect(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <DynamicWidgets>Hello</DynamicWidgets>
        </InstantSearch>
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `"[InstantSearch] <DynamicWidgets> only supports InstantSearch widgets with an \`attribute\` or \`attributes\` prop."`
    );

    consoleError.mockRestore();
  });

  test('renders only the result of transformItems', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    const { container } = render(
      <InstantSearchMock indexName="indexName" searchClient={searchClient}>
        <DynamicWidgets transformItems={() => ['brand']}>
          <RefinementList attribute="brand" />
          <HierarchicalMenu
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
            ]}
          />
        </DynamicWidgets>
      </InstantSearchMock>
    );

    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);
  });

  test('renders widgets in components', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    const { container } = render(
      <InstantSearchMock indexName="indexName" searchClient={searchClient}>
        <DynamicWidgets transformItems={() => ['brand']}>
          <div className="ais-Panel">
            <div className="ais-Panel-body">
              <RefinementList attribute="brand" />
            </div>
          </div>
        </DynamicWidgets>
      </InstantSearchMock>
    );

    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-Panel"
  >
    <div
      class="ais-Panel-body"
    >
      RefinementList(brand)
    </div>
  </div>
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);
  });

  test('throws when a nested component contains multiple children', () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => {});

    const searchClient = createSearchClient({});

    function MyComponent({ children }) {
      return (
        <div className="ais-Panel">
          <div className="ais-Panel-body">{children}</div>
        </div>
      );
    }

    expect(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <DynamicWidgets transformItems={() => ['brand']}>
            <MyComponent>
              <RefinementList attribute="brand" />
              <Menu attribute="categories" />
            </MyComponent>
          </DynamicWidgets>
        </InstantSearch>
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "[InstantSearch] <DynamicWidgets> only supports a single component in nested components. Make sure to not render multiple children in a parent component.

      Example of an unsupported scenario:

      \`\`\`
      <DynamicWidgets>
        <MyComponent>
          <RefinementList attribute=\\"brand\\" />
          <Menu attribute=\\"categories\\" />
        </MyComponent>
      </DynamicWidgets>
      \`\`\`
      "
    `);

    consoleError.mockRestore();
  });

  // Ideally we should be able to render the widgets wrapped in components, but
  // we didn't implement this behavior for simplicity.
  test('does not render no-attribute widgets that are not direct children', () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => {});

    const searchClient = createSearchClient({});

    function WrappedRefinementList() {
      return <RefinementList attribute="brand" />;
    }

    expect(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <DynamicWidgets>
            <WrappedRefinementList />
          </DynamicWidgets>
        </InstantSearch>
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `"[InstantSearch] <DynamicWidgets> only supports InstantSearch widgets with an \`attribute\` or \`attributes\` prop."`
    );

    consoleError.mockRestore();
  });

  test('does not render attributes without widget by default', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    const { container } = render(
      <InstantSearchMock indexName="indexName" searchClient={searchClient}>
        <DynamicWidgets
          transformItems={() => [
            'brand',
            'categories',
            'hierarchicalCategories.lvl0',
          ]}
        >
          <RefinementList attribute="brand" />
        </DynamicWidgets>
      </InstantSearchMock>
    );

    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);
  });

  test('renders attributes without widget with fallbackComponent', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    const { container } = render(
      <InstantSearchMock indexName="indexName" searchClient={searchClient}>
        <DynamicWidgets
          fallbackComponent={Menu}
          transformItems={() => [
            'brand',
            'categories',
            'hierarchicalCategories.lvl0',
          ]}
        >
          <RefinementList attribute="brand" />
        </DynamicWidgets>
      </InstantSearchMock>
    );

    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
  Menu(categories)
  Menu(hierarchicalCategories.lvl0)
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.menu' }),
      expect.objectContaining({ $$type: 'ais.menu' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);
  });

  test('renders attributes without widget with fallbackComponent (function form)', async () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <DynamicWidgets
          fallbackComponent={({ attribute }) => <Menu attribute={attribute} />}
          transformItems={() => [
            'brand',
            'categories',
            'hierarchicalCategories.lvl0',
          ]}
        >
          <RefinementList attribute="brand" />
        </DynamicWidgets>
      </InstantSearch>
    );

    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
  Menu(categories)
  Menu(hierarchicalCategories.lvl0)
</div>
`);
    });
  });

  test('renders dynamic widgets in an Index', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    const { container } = render(
      <InstantSearchMock indexName="indexName" searchClient={searchClient}>
        <Index indexName="subIndexName">
          <DynamicWidgets transformItems={() => ['brand']}>
            <RefinementList attribute="brand" />
          </DynamicWidgets>
        </Index>
      </InstantSearchMock>
    );

    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
</div>
`);
    });

    const index = indexContextRef
      .current!.getWidgets()
      .find<IndexWidget>(
        (widget): widget is IndexWidget => widget.$$type === 'ais.index'
      )!;
    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.index' }),
    ]);
    expect(index.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);
  });

  test('dynamically updates widgets when attributes change', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchMock, indexContextRef } = createInstantSearchMock();

    function App({ attributes }: { attributes: string[] }) {
      return (
        <InstantSearchMock indexName="indexName" searchClient={searchClient}>
          <DynamicWidgets transformItems={() => attributes}>
            <RefinementList attribute="brand" />
            <Menu attribute="categories" />
          </DynamicWidgets>
        </InstantSearchMock>
      );
    }

    // @TODO: we swallow React act errors in this test because we're unable to
    // satisfy them (?)
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => {});

    const { container, rerender } = render(<App attributes={['brand']} />);

    await wait(0);
    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);

    act(() => {
      rerender(<App attributes={['brand', 'categories']} />);
    });

    await wait(0);
    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
  Menu(categories)
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
      expect.objectContaining({ $$type: 'ais.menu' }),
    ]);

    act(() => {
      rerender(<App attributes={['brand']} />);
    });

    await wait(0);
    await waitFor(() => {
      expect(container).toMatchInlineSnapshot(`
<div>
  RefinementList(brand)
</div>
`);
    });

    expect(indexContextRef.current!.getWidgets()).toEqual([
      expect.objectContaining({ $$type: 'ais.refinementList' }),
      expect.objectContaining({ $$type: 'ais.dynamicWidgets' }),
    ]);

    consoleError.mockRestore();
  });
});
