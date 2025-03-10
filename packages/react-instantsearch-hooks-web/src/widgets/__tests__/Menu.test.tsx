import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { InstantSearchHooksTestWrapper, wait } from '../../../../../test/utils';
import { Menu } from '../Menu';

const search = jest.fn((requests) => {
  return Promise.resolve(
    createMultiSearchResponse(
      ...requests.map(() =>
        createSingleSearchResponse({
          facets: {
            brand: {
              'Insignia™': 746,
              Samsung: 633,
              Metra: 591,
              HP: 530,
              Apple: 442,
              GE: 394,
              Sony: 350,
              Incipio: 320,
              KitchenAid: 318,
              Whirlpool: 298,
              LG: 291,
              Canon: 287,
              Frigidaire: 275,
              Speck: 216,
              OtterBox: 214,
              Epson: 204,
              'Dynex™': 184,
              Dell: 174,
              'Hamilton Beach': 173,
              Platinum: 155,
            },
          },
        })
      )
    )
  );
});

describe('Menu', () => {
  test('renders with props', async () => {
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Menu attribute="brand" />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(client.search).toHaveBeenCalledTimes(1);

    expect(container.querySelectorAll('.ais-Menu-item')).toHaveLength(10);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Menu"
        >
          <ul
            class="ais-Menu-list"
          >
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Insignia™
                </span>
                <span
                  class="ais-Menu-count"
                >
                  746
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Samsung
                </span>
                <span
                  class="ais-Menu-count"
                >
                  633
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Metra
                </span>
                <span
                  class="ais-Menu-count"
                >
                  591
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  HP
                </span>
                <span
                  class="ais-Menu-count"
                >
                  530
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Apple
                </span>
                <span
                  class="ais-Menu-count"
                >
                  442
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  GE
                </span>
                <span
                  class="ais-Menu-count"
                >
                  394
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Sony
                </span>
                <span
                  class="ais-Menu-count"
                >
                  350
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Incipio
                </span>
                <span
                  class="ais-Menu-count"
                >
                  320
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  KitchenAid
                </span>
                <span
                  class="ais-Menu-count"
                >
                  318
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Whirlpool
                </span>
                <span
                  class="ais-Menu-count"
                >
                  298
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    const firstItem =
      container.querySelector<HTMLAnchorElement>('.ais-Menu-link')!;

    expect(firstItem.parentElement).not.toHaveClass('ais-Menu-item--selected');

    userEvent.click(firstItem);

    await wait(0);

    expect(firstItem.parentElement).toHaveClass('ais-Menu-item--selected');
    // Once on load, once on check.
    expect(client.search).toHaveBeenCalledTimes(2);
    expect(client.search).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            facetFilters: [['brand:Insignia™']],
          }),
        }),
      ])
    );
  });

  test('limits the number of items to display', async () => {
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Menu attribute="brand" limit={5} />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(container.querySelectorAll('.ais-Menu-item')).toHaveLength(5);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Menu"
        >
          <ul
            class="ais-Menu-list"
          >
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Insignia™
                </span>
                <span
                  class="ais-Menu-count"
                >
                  746
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Samsung
                </span>
                <span
                  class="ais-Menu-count"
                >
                  633
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Metra
                </span>
                <span
                  class="ais-Menu-count"
                >
                  591
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  HP
                </span>
                <span
                  class="ais-Menu-count"
                >
                  530
                </span>
              </a>
            </li>
            <li
              class="ais-Menu-item"
            >
              <a
                class="ais-Menu-link"
                href="#"
              >
                <span
                  class="ais-Menu-label"
                >
                  Apple
                </span>
                <span
                  class="ais-Menu-count"
                >
                  442
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('transforms the items', async () => {
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Menu
          attribute="brand"
          transformItems={(items) =>
            items.map((item) => ({
              ...item,
              label: item.label!.toUpperCase(),
            }))
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await wait(0);

    expect(
      [...container.querySelectorAll('.ais-Menu-item')].map(
        (el) => el.textContent
      )
    ).toMatchInlineSnapshot(`
      Array [
        "INSIGNIA™746",
        "SAMSUNG633",
        "METRA591",
        "HP530",
        "APPLE442",
        "GE394",
        "SONY350",
        "INCIPIO320",
        "KITCHENAID318",
        "WHIRLPOOL298",
      ]
    `);
  });

  describe('sorting', () => {
    test('sorts the items by ascending name', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu attribute="brand" sortBy={['name:asc']} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-label')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Apple',
        'Canon',
        'Dell',
        'Dynex™',
        'Epson',
        'Frigidaire',
        'GE',
        'HP',
        'Hamilton Beach',
        'Incipio',
      ]);
    });

    test('sorts the items by descending name', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu attribute="brand" sortBy={['name:desc']} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-label')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Whirlpool',
        'Speck',
        'Sony',
        'Samsung',
        'Platinum',
        'OtterBox',
        'Metra',
        'LG',
        'KitchenAid',
        'Insignia™',
      ]);
    });

    test('sorts the items by count', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu attribute="brand" sortBy={['count']} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-count')).map(
          (item) => item.textContent
        )
      ).toEqual([
        '746',
        '633',
        '591',
        '530',
        '442',
        '394',
        '350',
        '320',
        '318',
        '298',
      ]);
    });

    test('sorts the items by refinement state', async () => {
      const client = createSearchClient({ search });
      const { container, findByText } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu
            attribute="brand"
            sortBy={['isRefined', 'name']}
            transformItems={(items) =>
              items.map((item) => ({
                ...item,
                label: `${item.label} ${item.isRefined ? 'y' : 'n'}`,
              }))
            }
          />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-label')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Apple n',
        'Canon n',
        'Dell n',
        'Dynex™ n',
        'Epson n',
        'Frigidaire n',
        'GE n',
        'HP n',
        'Hamilton Beach n',
        'Incipio n',
      ]);

      userEvent.click(await findByText('Hamilton Beach n'));

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-label')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Hamilton Beach y',
        'Apple n',
        'Canon n',
        'Dell n',
        'Dynex™ n',
        'Epson n',
        'Frigidaire n',
        'GE n',
        'HP n',
        'Incipio n',
      ]);

      userEvent.click(await findByText('Frigidaire n'));

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-label')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Frigidaire y',
        'Apple n',
        'Canon n',
        'Dell n',
        'Dynex™ n',
        'Epson n',
        'GE n',
        'HP n',
        'Hamilton Beach n',
        'Incipio n',
      ]);
    });

    test('sorts the items using a sorting function', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu
            attribute="brand"
            sortBy={(a, b) => b.name.localeCompare(a.name)}
          />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(
        Array.from(container.querySelectorAll('.ais-Menu-label')).map(
          (item) => item.textContent
        )
      ).toEqual([
        'Whirlpool',
        'Speck',
        'Sony',
        'Samsung',
        'Platinum',
        'OtterBox',
        'Metra',
        'LG',
        'KitchenAid',
        'Insignia™',
      ]);
    });
  });

  describe('Show more / less', () => {
    test('displays a "Show more" button', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu attribute="brand" showMore={true} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      const showMoreButton = container.querySelector(
        '.ais-Menu-showMore'
      ) as HTMLButtonElement;

      expect(showMoreButton).toHaveTextContent('Show more');
      expect(container.querySelectorAll('.ais-Menu-item')).toHaveLength(10);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Menu"
          >
            <ul
              class="ais-Menu-list"
            >
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Insignia™
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    746
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Samsung
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    633
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Metra
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    591
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    HP
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    530
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Apple
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    442
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    GE
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    394
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Sony
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    350
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Incipio
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    320
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    KitchenAid
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    318
                  </span>
                </a>
              </li>
              <li
                class="ais-Menu-item"
              >
                <a
                  class="ais-Menu-link"
                  href="#"
                >
                  <span
                    class="ais-Menu-label"
                  >
                    Whirlpool
                  </span>
                  <span
                    class="ais-Menu-count"
                  >
                    298
                  </span>
                </a>
              </li>
            </ul>
            <button
              class="ais-Menu-showMore"
            >
              Show more
            </button>
          </div>
        </div>
      `);

      userEvent.click(showMoreButton);

      await wait(0);

      expect(showMoreButton).toHaveTextContent('Show less');
      expect(container.querySelectorAll('.ais-Menu-item')).toHaveLength(20);
    });

    test('limits the number of items to reveal', async () => {
      const client = createSearchClient({ search });
      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={client}>
          <Menu attribute="brand" showMore={true} showMoreLimit={11} />
        </InstantSearchHooksTestWrapper>
      );

      await wait(0);

      expect(container.querySelectorAll('.ais-Menu-item')).toHaveLength(10);
      expect(container.querySelector('.ais-Menu-showMore')).toBeInTheDocument();

      userEvent.click(
        container.querySelector('.ais-Menu-showMore') as HTMLButtonElement
      );

      await wait(0);

      expect(container.querySelectorAll('.ais-Menu-item')).toHaveLength(11);
      expect(container.querySelector('.ais-Menu-showMore')).toBeInTheDocument();
    });
  });

  test('forwards custom class names and `div` props to the root element', () => {
    const client = createSearchClient({ search });
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={client}>
        <Menu
          attribute="brand"
          className="MyMenu"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyMenu', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });
});
