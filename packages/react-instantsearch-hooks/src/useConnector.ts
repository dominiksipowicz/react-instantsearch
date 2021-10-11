import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { useMemo, useState } from 'react';

import { useIndexContext } from './useIndexContext';
import { useInstantSearchContext } from './useInstantSearchContext';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useInstantSearchSsrContext } from './useInstantSearchSsrContext';
import { useStableValue } from './useStableValue';
import { useIsomorphicLayoutEffect } from './utils';
import { createSearchResults } from './utils/createSearchResults';

import type { Connector, WidgetDescription } from 'instantsearch.js';

export function useConnector<
  TProps extends Record<string, unknown>,
  TDescription extends WidgetDescription
>(
  connector: Connector<TDescription, TProps>,
  props: TProps = {} as TProps
): TDescription['renderState'] {
  const serverContext = useInstantSearchServerContext();
  const ssrContext = useInstantSearchSsrContext();
  const search = useInstantSearchContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);

  const widget = useMemo(() => {
    const createWidget = connector((connectorState, isFirstRender) => {
      // We skip the `init` widget render because:
      // - We rely on `getWidgetRenderState` to compute the initial state before
      //   the InstantSearch.js lifecycle starts.
      // - It prevents UI flashes when updating the widget props.
      if (isFirstRender) {
        return;
      }

      const { instantSearchInstance, widgetParams, ...renderState } =
        connectorState;

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setState(renderState);
    });

    return createWidget(stableProps);
  }, [stableProps, connector]);

  const [state, setState] = useState<TDescription['renderState']>(() => {
    if (widget.getWidgetRenderState) {
      // The helper exists because we've started InstantSearch.
      const helper = parentIndex.getHelper()!;
      const results = ssrContext?.initialResults
        ? new SearchResults(
            new SearchParameters(
              ssrContext.initialResults[parentIndex.getIndexId()]._state
            ),
            ssrContext.initialResults[parentIndex.getIndexId()]._rawResults
          )
        : parentIndex.getResults() || createSearchResults(helper.state);

      // On SSR, we patch the injected Helper's state with the state from the
      // results to sync its search parameters with the ones from the initial
      // results.
      if (ssrContext?.initialResults) {
        helper.state = results._state;
      }

      const scopedResults = parentIndex
        .getScopedResults()
        .map((scopedResult) => {
          const fallbackResults =
            scopedResult.indexId === parentIndex.getIndexId()
              ? results
              : createSearchResults(scopedResult.helper.state);

          return {
            ...scopedResult,
            // We avoid all `results` being `null`.
            results: scopedResult.results || fallbackResults,
          };
        });

      // We get the widget render state by providing the same parameters as
      // InstantSearch provides to the widget's `render` method.
      // See https://github.com/algolia/instantsearch.js/blob/019cd18d0de6dd320284aa4890541b7fe2198c65/src/widgets/index/index.ts#L604-L617
      const { widgetParams, ...renderState } = widget.getWidgetRenderState({
        helper,
        parent: parentIndex,
        instantSearchInstance: search,
        results,
        scopedResults,
        state: results._state,
        renderState: search.renderState,
        templatesConfig: search.templatesConfig,
        createURL: parentIndex.createURL,
        searchMetadata: {
          isSearchStalled: search._isSearchStalled,
        },
      });

      return renderState;
    }

    return {};
  });

  // We use a layout effect to add the widget to the index at the same time as
  // the index renders, otherwise it triggers 2 network requests.
  useIsomorphicLayoutEffect(() => {
    parentIndex.addWidgets([widget]);

    return () => {
      parentIndex.removeWidgets([widget]);
    };
  }, [widget, parentIndex]);

  // On the server, we directly add the widget when rendering to be aware of
  // its search parameters.
  // Although it's not recommended to trigger side effects in the render scope,
  // it should be fine here because we use `renderToString` on the server, which
  // renders in a single pass.
  if (serverContext) {
    parentIndex.addWidgets([widget]);
  }

  return state;
}
