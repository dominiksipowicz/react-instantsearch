import { useEffect, useRef } from 'react';

import { useStableValue } from './useStableValue';

function splitPropsByType<TProps>(props: TProps): {
  regularProps: Partial<TProps>;
  fnProps: Record<string, (...args: any[]) => any>;
} {
  const regularProps = {};
  const fnProps = {};

  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'function') {
      fnProps[key] = value;
    } else {
      regularProps[key] = value;
    }
  });

  return {
    regularProps,
    fnProps,
  };
}

function useStableFunctionProps<TFunction extends (...args: any[]) => any>(
  fns: Record<string, TFunction>
) {
  const fnsRef = useRef(fns);
  const propsRef = useRef(
    Object.keys(fnsRef.current).reduce((acc, key) => {
      acc[key] =
        typeof fnsRef.current[key] === 'function'
          ? (...args) => fnsRef.current[key]!(...args)
          : undefined;

      return acc;
    }, {})
  );

  useEffect(() => {
    fnsRef.current = fns;
  });

  return propsRef.current;
}

export function useStableProps<TProps>(props: TProps = {} as TProps) {
  const { regularProps, fnProps } = splitPropsByType(props);
  const stableFnProps = useStableFunctionProps(fnProps);
  const stableProps = useStableValue<TProps>({
    ...regularProps,
    ...stableFnProps,
  } as TProps);

  return stableProps;
}
