/* eslint-disable @typescript-eslint/no-explicit-any */
import debounce from "lodash/debounce";
import { useMemo, useRef } from "react";

import { useUnmount } from "./use-unmount";

interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface ControlFunctions {
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
}

export type DebouncedState<T extends (...args: any[]) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions;

export function useDebounceCallback<
  T extends (...args: any[]) => ReturnType<T>,
>(func: T, delay = 500, options?: DebounceOptions): DebouncedState<T> {
  const funcRef = useRef(func);
  funcRef.current = func;

  const debouncedFunc = useRef<ReturnType<typeof debounce>>(null);

  useUnmount(() => {
    debouncedFunc.current?.cancel();
  });

  const debounced = useMemo(() => {
    debouncedFunc.current?.cancel();

    let pending = false;

    const debouncedFuncInstance = debounce(
      (...args: Parameters<T>) => {
        pending = false;
        return funcRef.current(...args);
      },
      delay,
      options,
    );

    debouncedFunc.current = debouncedFuncInstance;

    const wrappedFunc: DebouncedState<T> = (...args: Parameters<T>) => {
      pending = true;
      return debouncedFuncInstance(...args);
    };

    wrappedFunc.cancel = () => {
      pending = false;
      debouncedFuncInstance.cancel();
    };

    wrappedFunc.isPending = () => pending;

    wrappedFunc.flush = () => {
      pending = false;
      return debouncedFuncInstance.flush();
    };

    return wrappedFunc;
  }, [delay, options]);

  return debounced;
}
