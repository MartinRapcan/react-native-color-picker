import { useEffect, useLayoutEffect, useRef } from "react";

// useLayoutEffect warns during server rendering (Expo Router static web export).
// (`window` exists on iOS/Android and in browsers, but not during SSR.)
export const useIsomorphicLayoutEffect =
  typeof (globalThis as { window?: unknown }).window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Keeps a ref pointing at the latest value without writing to the ref during
 * render (which is unsafe under concurrent rendering). Read it only from event
 * handlers / effects, never during render.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
