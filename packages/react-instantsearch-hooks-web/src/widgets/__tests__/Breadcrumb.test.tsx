import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useHierarchicalMenu } from 'react-instantsearch-hooks';

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { Breadcrumb } from '../Breadcrumb';

import type { UseHierarchicalMenuProps } from 'react-instantsearch-hooks';

describe('Breadcrumb', () => {
  const hierarchicalFacets = {
    'hierarchicalCategories.lvl0': {
      'Cameras & Camcorders': 1369,
    },
    'hierarchicalCategories.lvl1': {
      'Cameras & Camcorders > Digital Cameras': 170,
    },
  };
  const hierarchicalAttributes = Object.keys(hierarchicalFacets);

  const searchClient = createSearchClient({
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() =>
            createSingleSearchResponse({
              facets: hierarchicalFacets,
            })
          )
        )
      )
    ),
  });

  beforeEach(() => {
    searchClient.search.mockClear();
  });

  test('renders with props', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb attributes={hierarchicalAttributes} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb ais-Breadcrumb--noRefinement"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('renders with initial refinements', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }}
      >
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb attributes={hierarchicalAttributes} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Cameras & Camcorders
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              Digital Cameras
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('transforms the items', async () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }}
      >
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb
          attributes={hierarchicalAttributes}
          transformItems={(items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() }))
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      [...container.querySelectorAll('.ais-Breadcrumb-item')].map(
        (item) => item.textContent
      )
    ).toMatchInlineSnapshot(`
      Array [
        "Home",
        ">CAMERAS & CAMCORDERS",
        ">DIGITAL CAMERAS",
      ]
    `);
  });

  test('navigates to a parent category', async () => {
    const { container, getByText } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }}
      >
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb attributes={hierarchicalAttributes} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Cameras & Camcorders
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              Digital Cameras
            </li>
          </ul>
        </div>
      </div>
    `);

    userEvent.click(getByText('Cameras & Camcorders'));

    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(2);
    expect(searchClient.search).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            facetFilters: [
              ['hierarchicalCategories.lvl0:Cameras & Camcorders'],
            ],
          }),
        }),
      ])
    );
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb
          className="MyBreadcrumb"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
          attributes={hierarchicalAttributes}
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyBreadcrumb', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});

function VirtualHierarchicalMenu(props: UseHierarchicalMenuProps) {
  useHierarchicalMenu(props);
  return null;
}
