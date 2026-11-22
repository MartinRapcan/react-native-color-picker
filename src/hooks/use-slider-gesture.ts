import { useCallback, useState } from "react";
import { PanResponder, type LayoutChangeEvent } from "react-native";
import { useIsomorphicLayoutEffect } from "./use-latest-ref";

export type SliderPosition = { x: number; y: number; width: number; height: number };

type Options = {
  disabled: boolean;
  /** Called on touch start and on every move, with coordinates relative to the container. */
  onMove: (pos: SliderPosition) => void;
  /** Called when the finger is lifted (or the gesture is cancelled). */
  onEnd?: () => void;
};

/**
 * Maps a position along an axis to a 0–1 ratio. `inset` keeps the thumb's
 * centre away from the track ends, so the thumb never sticks out.
 */
export function positionToRatio(pos: number, length: number, inset = 0): number {
  const usable = length - inset * 2;
  if (usable <= 0) return 0;
  return Math.min(1, Math.max(0, (pos - inset) / usable));
}

/** Inverse of `positionToRatio`. */
export function ratioToPosition(ratio: number, length: number, inset = 0): number {
  return inset + Math.min(1, Math.max(0, ratio)) * Math.max(0, length - inset * 2);
}

/**
 * Shared touch handling for the saturation pad and the hue/alpha sliders.
 *
 * Uses the touch position *inside* the container at grant time
 * (`locationX/Y`) plus the gesture delta (`dx/dy`). That avoids the async
 * `measure()` call — and the race where the first move events used a stale
 * origin — and works inside scroll views and modals. Children of the
 * container must have `pointerEvents="none"` so the container is always the
 * touch target.
 */
type GestureState = {
  width: number;
  height: number;
  startX: number;
  startY: number;
  active: boolean;
  disabled: boolean;
  onMove: Options["onMove"];
  onEnd: Options["onEnd"];
};

/**
 * Created once per slider. Holds the mutable gesture state and the latest
 * callbacks outside of React state, so the PanResponder never has to be
 * recreated and nothing is read during render.
 */
function createSliderGesture(options: Options) {
  const state: GestureState = {
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
    active: false,
    disabled: options.disabled,
    onMove: options.onMove,
    onEnd: options.onEnd,
  };
  const emit = (x: number, y: number) => {
    if (state.width === 0 || state.height === 0) return;
    state.onMove({ x, y, width: state.width, height: state.height });
  };
  const end = () => {
    if (!state.active) return;
    state.active = false;
    state.onEnd?.();
  };
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !state.disabled,
    onStartShouldSetPanResponderCapture: () => !state.disabled,
    onMoveShouldSetPanResponder: () => !state.disabled,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      state.startX = locationX;
      state.startY = locationY;
      state.active = true;
      emit(locationX, locationY);
    },
    onPanResponderMove: (_evt, g) => emit(state.startX + g.dx, state.startY + g.dy),
    onPanResponderRelease: end,
    onPanResponderTerminate: end,
  });
  return {
    panHandlers: panResponder.panHandlers,
    setOptions(next: Options) {
      state.disabled = next.disabled;
      state.onMove = next.onMove;
      state.onEnd = next.onEnd;
    },
    setSize(width: number, height: number) {
      state.width = width;
      state.height = height;
    },
  };
}

/**
 * Shared touch handling for the saturation pad and the hue/alpha sliders.
 *
 * Uses the touch position *inside* the container at grant time
 * (`locationX/Y`) plus the gesture delta (`dx/dy`). That avoids the async
 * `measure()` call — and the race where the first move events used a stale
 * origin — and works inside scroll views and modals. Children of the
 * container must have `pointerEvents="none"` so the container is always the
 * touch target.
 */
export function useSliderGesture(options: Options) {
  const [gesture] = useState(() => createSliderGesture(options));
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { disabled, onMove, onEnd } = options;

  // Keep the latest props for the gesture callbacks (written after commit, not during render).
  useIsomorphicLayoutEffect(() => {
    gesture.setOptions({ disabled, onMove, onEnd });
  }, [gesture, disabled, onMove, onEnd]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      gesture.setSize(width, height);
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    },
    [gesture],
  );

  return { panHandlers: gesture.panHandlers, onLayout, width: size.width, height: size.height };
}
