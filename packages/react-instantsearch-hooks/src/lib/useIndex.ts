import index from 'instantsearch.js/es/widgets/index/index';
import { useMemo } from 'react';

import { useIndexContext } from '../lib/useIndexContext';
import { useInstantSearchServerContext } from '../lib/useInstantSearchServerContext';

import { useForceUpdate } from './useForceUpdate';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useStableValue } from './useStableValue';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const serverContext = useInstantSearchServerContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  // On SSR rendering, we add the Index early to render the initial results in
  // the render pass. Since the Index is added already, we need to skip the
  // usual browser effect that adds the widget when client-side rendering.
  // We still need to run the effect lifecycle on all the other renders.
  // This ref lets us keep track whether the initial effect to add the Index
  // should be skipped.
  // const shouldAddIndexRef = useRef(true);
  const indexWidget = useMemo(() => index(stableProps), [stableProps]);
  const helper = indexWidget.getHelper();
  const forceUpdate = useForceUpdate();

  // @TODO: make test fail when using `useEffect()`
  useIsomorphicLayoutEffect(() => {
    forceUpdate();
  }, [helper, forceUpdate]);

  useIsomorphicLayoutEffect(() => {
    parentIndex.addWidgets([indexWidget]);

    return () => {
      parentIndex.removeWidgets([indexWidget]);
    };
  }, [parentIndex, indexWidget]);

  // On the server, we directly add the Index widget early to retrieve it's child
  // widgets' search parameters in the render pass.
  // On SSR, we also add the Index here to synchronize the search state associated
  // to the widgets.
  // In these environments, we flag that we've added the widgets early to skip
  // the initial browser effect that would otherwise add the Index a second time.
  if (serverContext && !parentIndex.getWidgets().includes(indexWidget)) {
    parentIndex.addWidgets([indexWidget]);
  }

  return indexWidget;
}
