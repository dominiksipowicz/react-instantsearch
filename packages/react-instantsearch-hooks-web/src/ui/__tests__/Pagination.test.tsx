import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Pagination } from '../Pagination';

import type { PaginationProps } from '../Pagination';

describe('Pagination', () => {
  function createProps(props: Partial<PaginationProps>) {
    const onNavigate = jest.fn();

    return {
      pages: [0, 1],
      currentPage: 0,
      nbPages: 2,
      isFirstPage: true,
      isLastPage: false,
      showFirst: true,
      showPrevious: true,
      showNext: true,
      showLast: true,
      // We use a hash URL because navigating to a different URL is not supported
      // by JSDOM.
      // See https://github.com/jsdom/jsdom/issues/2112
      createURL: (value: number) => `#page-${value + 1}`,
      onNavigate,
      translations: {
        first: '‹‹',
        previous: '‹',
        next: '›',
        last: '››',
        page: (currentPage: number) => String(currentPage),
        ariaFirst: 'First',
        ariaPrevious: 'Previous',
        ariaNext: 'Next',
        ariaLast: 'Last',
        ariaPage: (currentPage: number) => `Page ${currentPage}`,
      },
      ...props,
    };
  }

  test('renders with items', () => {
    const props = createProps({
      currentPage: 1,
      nbPages: 6,
      isFirstPage: false,
      isLastPage: false,
    });

    const { container } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    );
    const firstPageLink = firstPageItem!.querySelector('.ais-Pagination-link');
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    );
    const previousPageLink = previousPageItem!.querySelector(
      '.ais-Pagination-link'
    );
    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    );
    const nextPageLink = nextPageItem!.querySelector('.ais-Pagination-link');
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    );
    const lastPageLink = lastPageItem!.querySelector('.ais-Pagination-link');

    expect(firstPageLink).toHaveAttribute('aria-label', 'First');
    expect(firstPageLink).toHaveAttribute('href', '#page-1');
    expect(previousPageLink).toHaveAttribute('aria-label', 'Previous');
    expect(previousPageLink).toHaveAttribute('href', '#page-1');

    expect(nextPageLink).toHaveAttribute('aria-label', 'Next');
    expect(nextPageLink).toHaveAttribute('href', '#page-3');
    expect(lastPageLink).toHaveAttribute('aria-label', 'Last');
    expect(lastPageLink).toHaveAttribute('href', '#page-6');

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--firstPage"
            >
              <a
                aria-label="First"
                class="ais-Pagination-link"
                href="#page-1"
              >
                ‹‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--previousPage"
            >
              <a
                aria-label="Previous"
                class="ais-Pagination-link"
                href="#page-1"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-3"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-6"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('enables first and previous page when current page is not the first page', async () => {
    const props = createProps({
      currentPage: 1,
      isFirstPage: false,
      isLastPage: true,
    });

    const { container } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    )!;
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    )!;

    expect(firstPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(previousPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--firstPage"
            >
              <a
                aria-label="First"
                class="ais-Pagination-link"
                href="#page-1"
              >
                ‹‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--previousPage"
            >
              <a
                aria-label="Previous"
                class="ais-Pagination-link"
                href="#page-1"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      </div>
    `);

    await userEvent.click(
      firstPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );
    await userEvent.click(
      previousPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );

    expect(props.onNavigate).toHaveBeenCalledTimes(2);
  });

  test('disables first and previous page when current page is the first page', async () => {
    const props = createProps({});

    const { container } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    )!;
    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    )!;

    expect(firstPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(previousPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    await userEvent.click(
      firstPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );
    await userEvent.click(
      previousPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('enables next and last page when current page is not the last page', async () => {
    const props = createProps({});

    const { container } = render(<Pagination {...props} />);

    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    )!;
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    )!;

    expect(nextPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(lastPageItem).not.toHaveClass('ais-Pagination-item--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);

    await userEvent.click(
      nextPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );
    await userEvent.click(
      lastPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );

    expect(props.onNavigate).toHaveBeenCalledTimes(2);
  });

  test('disables next and last page when current page is the last page', async () => {
    const props = createProps({
      currentPage: 1,
      nbPages: 2,
      isFirstPage: false,
      isLastPage: true,
    });

    const { container } = render(<Pagination {...props} />);

    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    )!;
    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    )!;

    expect(nextPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(lastPageItem).toHaveClass('ais-Pagination-item--disabled');
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--firstPage"
            >
              <a
                aria-label="First"
                class="ais-Pagination-link"
                href="#page-1"
              >
                ‹‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--previousPage"
            >
              <a
                aria-label="Previous"
                class="ais-Pagination-link"
                href="#page-1"
              >
                ‹
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--nextPage"
            >
              <span
                aria-label="Next"
                class="ais-Pagination-link"
              >
                ›
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--lastPage"
            >
              <span
                aria-label="Last"
                class="ais-Pagination-link"
              >
                ››
              </span>
            </li>
          </ul>
        </div>
      </div>
    `);

    await userEvent.click(
      nextPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );
    await userEvent.click(
      lastPageItem.querySelector<HTMLButtonElement>('.ais-Pagination-link')!
    );

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('does not trigger `onNavigate` callback when pressing a modifier key', async () => {
    const props = createProps({});

    const { getByText } = render(<Pagination {...props} />);

    const firstPageItem = document.querySelector(
      '.ais-Pagination-item--firstPage'
    )!;
    const firstPageLink = firstPageItem.querySelector<HTMLAnchorElement>(
      '.ais-Pagination-link'
    )!;

    {
      const user = userEvent.setup();
      await user.keyboard(
        '[ControlLeft>][ControlRight>][MetaLeft>][MetaRight>][ShiftLeft>][ShiftRight>][AltLeft>][AltRight>]'
      );
      await user.click(firstPageLink);
    }

    const previousPageItem = document.querySelector(
      '.ais-Pagination-item--previousPage'
    )!;
    const previousPageLink = previousPageItem.querySelector<HTMLAnchorElement>(
      '.ais-Pagination-link'
    )!;

    {
      const user = userEvent.setup();
      await user.keyboard(
        '[ControlLeft>][ControlRight>][MetaLeft>][MetaRight>][ShiftLeft>][ShiftRight>][AltLeft>][AltRight>]'
      );
      await user.click(previousPageLink);
    }

    const nextPageItem = document.querySelector(
      '.ais-Pagination-item--nextPage'
    )!;
    const nextPageLink = nextPageItem.querySelector<HTMLAnchorElement>(
      '.ais-Pagination-link'
    )!;

    {
      const user = userEvent.setup();
      await user.keyboard(
        '[ControlLeft>][ControlRight>][MetaLeft>][MetaRight>][ShiftLeft>][ShiftRight>][AltLeft>][AltRight>]'
      );
      await user.click(nextPageLink);
    }

    const lastPageItem = document.querySelector(
      '.ais-Pagination-item--lastPage'
    )!;
    const lastPageLink = lastPageItem.querySelector<HTMLAnchorElement>(
      '.ais-Pagination-link'
    )!;

    {
      const user = userEvent.setup();
      await user.keyboard(
        '[ControlLeft>][ControlRight>][MetaLeft>][MetaRight>][ShiftLeft>][ShiftRight>][AltLeft>][AltRight>]'
      );
      await user.click(lastPageLink);
    }

    const pageOneLink = getByText('1') as HTMLAnchorElement;

    {
      const user = userEvent.setup();
      await user.keyboard(
        '[ControlLeft>][ControlRight>][MetaLeft>][MetaRight>][ShiftLeft>][ShiftRight>][AltLeft>][AltRight>]'
      );
      await user.click(pageOneLink);
    }

    expect(props.onNavigate).not.toHaveBeenCalled();
  });

  test('hides the "First" item when `showFirst` is `false`', () => {
    const props = createProps({
      showFirst: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(
      document.querySelector('.ais-Pagination-item--firstPage')
    ).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "Previous" item when `showPrevious` is `false`', () => {
    const props = createProps({
      showPrevious: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(
      document.querySelector('.ais-Pagination-item--previousPage')
    ).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "Next" item when `showNext` is `false`', () => {
    const props = createProps({
      showNext: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(document.querySelector('.ais-Pagination-item--nextPage')).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('hides the "Last" item when `showLast` is `false`', () => {
    const props = createProps({
      showLast: false,
    });

    const { container } = render(<Pagination {...props} />);

    expect(document.querySelector('.ais-Pagination-item--lastPage')).toBeNull();
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('forwards a custom class name to the root element', () => {
    const props = createProps({});

    const { container } = render(
      <Pagination {...props} className="MyPagination" />
    );

    expect(document.querySelector('.ais-Pagination')).toHaveClass(
      'MyPagination'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination MyPagination"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('allows custom class names', () => {
    const props = createProps({});
    const { container } = render(
      <Pagination
        {...props}
        classNames={{
          root: 'ROOT',
          noRefinementRoot: 'NOREFINEMENTROOT',
          list: 'LIST',
          item: 'ITEM',
          firstPageItem: 'FIRSTPAGEITEM',
          previousPageItem: 'PREVIOUSPAGEITEM',
          pageItem: 'PAGEITEM',
          selectedItem: 'SELECTEDITEM',
          disabledItem: 'DISABLEDITEM',
          nextPageItem: 'NEXTPAGEITEM',
          lastPageItem: 'LASTPAGEITEM',
          link: 'LINK',
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination ROOT"
        >
          <ul
            class="ais-Pagination-list LIST"
          >
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--disabled DISABLEDITEM ais-Pagination-item--firstPage FIRSTPAGEITEM"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link LINK"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--disabled DISABLEDITEM ais-Pagination-item--previousPage PREVIOUSPAGEITEM"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link LINK"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--page PAGEITEM ais-Pagination-item--selected SELECTEDITEM"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link LINK"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--page PAGEITEM"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link LINK"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--nextPage NEXTPAGEITEM"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link LINK"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ITEM ais-Pagination-item--lastPage LASTPAGEITEM"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link LINK"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({});

    const { container } = render(
      <Pagination {...props} title="Some custom title" />
    );

    expect(document.querySelector('.ais-Pagination')).toHaveAttribute(
      'title',
      'Some custom title'
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Pagination"
          title="Some custom title"
        >
          <ul
            class="ais-Pagination-list"
          >
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--firstPage"
            >
              <span
                aria-label="First"
                class="ais-Pagination-link"
              >
                ‹‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--disabled ais-Pagination-item--previousPage"
            >
              <span
                aria-label="Previous"
                class="ais-Pagination-link"
              >
                ‹
              </span>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page ais-Pagination-item--selected"
            >
              <a
                aria-label="Page 1"
                class="ais-Pagination-link"
                href="#page-1"
              >
                1
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--page"
            >
              <a
                aria-label="Page 2"
                class="ais-Pagination-link"
                href="#page-2"
              >
                2
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--nextPage"
            >
              <a
                aria-label="Next"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ›
              </a>
            </li>
            <li
              class="ais-Pagination-item ais-Pagination-item--lastPage"
            >
              <a
                aria-label="Last"
                class="ais-Pagination-link"
                href="#page-2"
              >
                ››
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });
});
