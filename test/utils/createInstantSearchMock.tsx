import React, { createRef } from 'react';

import { InstantSearch } from '../../packages/react-instantsearch-hooks/src/components/InstantSearch';
import { IndexContext } from '../../packages/react-instantsearch-hooks/src/lib/IndexContext';
import type { InstantSearchProps } from '../../packages/react-instantsearch-hooks/src';
import type {
  InstantSearch as InstantSearchType,
  Widget,
} from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

export function createInstantSearchMock() {
  const indexContext = createRef<IndexWidget>();
  const addWidgetsRef =
    createRef<(...widgets: Widget[]) => InstantSearchType>();
  const addWidgets = jest.fn((...widgets: Widget[]) =>
    addWidgetsRef.current!(...widgets)
  );
  const removeWidgetsRef =
    createRef<(...widgets: Widget[]) => InstantSearchType>();
  const removeWidgets = jest.fn((...widgets: Widget[]) =>
    removeWidgetsRef.current!(...widgets)
  );

  function InstantSearchMock({ children, ...props }: InstantSearchProps) {
    return (
      <InstantSearch {...props}>
        <IndexContext.Consumer>
          {(value) => {
            if (!addWidgetsRef.current) {
              // @ts-ignore `React.RefObject` is typed as immutable
              addWidgetsRef.current = value!.addWidgets;
            }
            if (!removeWidgetsRef.current) {
              // @ts-ignore `React.RefObject` is typed as immutable
              removeWidgetsRef.current = value!.removeWidgets;
            }
            // @ts-ignore `React.RefObject` is typed as immutable
            indexContext.current = {
              ...value,
              addWidgets,
              removeWidgets,
            };

            return (
              <IndexContext.Provider value={indexContext.current}>
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
    indexContext,
  };
}
