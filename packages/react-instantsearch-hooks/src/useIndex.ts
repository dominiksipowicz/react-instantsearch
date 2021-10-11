import index from 'instantsearch.js/es/widgets/index/index';
import { useEffect, useMemo } from 'react';

import { useForceUpdate } from './useForceUpdate';
import { useIndexContext } from './useIndexContext';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useStableValue } from './useStableValue';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const serverContext = useInstantSearchServerContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  const indexWidget = useMemo(() => index(stableProps), [stableProps]);
  const helper = indexWidget.getHelper();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    forceUpdate();
  }, [helper, forceUpdate]);

  useEffect(() => {
    parentIndex.addWidgets([indexWidget]);

    return () => {
      parentIndex.removeWidgets([indexWidget]);
    };
  }, [parentIndex, indexWidget]);

  // On the server, we directly add the index when rendering to be aware of
  // its child widgets' search parameters.
  // Although it's not recommended to trigger side effects in the render scope,
  // it should be fine here because we use `renderToString` on the server, which
  // renders in a single pass.
  if (serverContext) {
    parentIndex.addWidgets([indexWidget]);
  }

  return indexWidget;
}
