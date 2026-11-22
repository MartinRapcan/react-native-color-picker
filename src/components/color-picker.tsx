import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Modal, Pressable, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import { useIsomorphicLayoutEffect, useLatestRef } from "../hooks/use-latest-ref";
import { DEFAULT_COLOR, DEFAULT_LABELS, DEFAULT_TABS, resolveTheme } from "../shared/const";
import type { ColorPickerLabels, ColorPickerRef, ColorPickerThemeProp, TabId } from "../types/misc";
import {
  formatColor,
  getContrastColor,
  hsbToHex,
  normalizeHex,
  parseColor,
  rgbToHsb,
  type Hsb,
  type Hsba,
  type Rgb,
} from "../utils/colors";
import { ColorFill } from "./color-fill";
import type { ColorPalette } from "./palettes-tab";
import { PickerPanel, type PickerPanelProps } from "./picker-panel";

export type ColorPickerProps = {
  /** Current color. Accepts #RGB, #RGBA, #RRGGBB and #RRGGBBAA (default `"#007AFF"`). */
  value?: string;
  /**
   * Called whenever the color changes — on every drag frame, so keep it cheap.
   * Receives `#RRGGBB`, or `#RRGGBBAA` when `showAlpha` is on (always uppercase).
   */
  onChange?: (hex: string) => void;
  /**
   * Called once when an interaction finishes: finger lifted from the pad or a
   * slider, a value typed in the Values tab, a palette swatch tapped, or
   * `ref.setColor()`. Use it for expensive work (saving, network…).
   */
  onChangeComplete?: (hex: string) => void;
  /** Tabs to show (default `["picker", "values", "palettes"]`). `"picker"` is added if missing. */
  tabs?: readonly TabId[];
  /** Tab selected when the picker is first shown (default: the first tab). */
  initialTab?: TabId;
  /** Panel width in modal mode (default `"100%"`). Ignored in inline mode. */
  panelWidth?: DimensionValue;
  /** Hue / alpha slider height (default 28). */
  hueStripHeight?: number;
  /**
   * `"dark"` (default), `"light"`, or a partial theme object merged on top of
   * `base` — e.g. `{ base: "light", background: "#F5F5F5" }`.
   */
  theme?: ColorPickerThemeProp;
  /** Disable all input. */
  disabled?: boolean;
  /** Style for the picker panel. */
  style?: StyleProp<ViewStyle>;
  /** Swatch size (default 48). */
  swatchSize?: number;
  /** Swatch border radius (default 12). */
  swatchBorderRadius?: number;
  /** Style for the swatch trigger. */
  swatchStyle?: StyleProp<ViewStyle>;
  /** Render inline instead of a swatch + modal (default false). */
  inline?: boolean;
  /** Override default labels (i18n, including screen-reader labels). */
  labels?: ColorPickerLabels;
  /** Style for the modal content wrapper. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Show the alpha slider and emit 8-digit hex (default false). */
  showAlpha?: boolean;
  /** Color palettes for the Palettes tab. Define them outside render (or memoize) to avoid re-renders. */
  palettes?: ColorPalette[];
  /** Saved colors (controlled). When provided, the component doesn't keep its own list. */
  savedColors?: string[];
  /** Initial saved colors when uncontrolled. */
  defaultSavedColors?: string[];
  /** Called with the full new list whenever saved colors change (save, remove, clear). Works in both modes. */
  onSavedColorsChange?: (colors: string[]) => void;
  /** Called when the user saves a color. */
  onSaveColor?: (hex: string) => void;
  /** Called when the user clears saved colors. */
  onClearSaved?: () => void;
  /** Called when the user removes a single saved color. */
  onRemoveSavedColor?: (hex: string) => void;
  /** Require a second tap on "Clear" before clearing saved colors (default true). */
  confirmClear?: boolean;
};

function normalizeTabs(tabs: readonly TabId[]): TabId[] {
  const unique = tabs.filter((tab, i) => tabs.indexOf(tab) === i);
  // The picker tab is the primary way to choose a color — always keep it.
  return unique.includes("picker") ? unique : ["picker", ...unique];
}

function initialColor(value: string, showAlpha: boolean): Hsba {
  const parsed = parseColor(value) ?? parseColor(DEFAULT_COLOR)!;
  return showAlpha ? parsed : { ...parsed, a: 100 };
}

export const ColorPicker = forwardRef<ColorPickerRef, ColorPickerProps>(function ColorPicker(
  {
    value = DEFAULT_COLOR,
    onChange,
    onChangeComplete,
    tabs: tabsProp = DEFAULT_TABS,
    initialTab,
    panelWidth = "100%",
    hueStripHeight = 28,
    theme: themeProp = "dark",
    disabled = false,
    style,
    swatchSize = 48,
    swatchBorderRadius = 12,
    swatchStyle,
    inline = false,
    labels: userLabels,
    contentStyle,
    showAlpha = false,
    palettes,
    savedColors: savedColorsProp,
    defaultSavedColors,
    onSavedColorsChange,
    onSaveColor,
    onClearSaved,
    onRemoveSavedColor,
    confirmClear = true,
  },
  ref,
) {
  // Inline objects/arrays are common for these props — key the memos by content
  // so the memoized children don't re-render on every parent render.
  const themeKey = typeof themeProp === "string" ? themeProp : JSON.stringify(themeProp);
  // oxlint-disable-next-line react/exhaustive-deps
  const t = useMemo(() => resolveTheme(themeProp), [themeKey]);
  const labelsKey = JSON.stringify(userLabels ?? null);
  // oxlint-disable-next-line react/exhaustive-deps
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...userLabels }), [labelsKey]);
  const tabsKey = tabsProp.join(",");
  // oxlint-disable-next-line react/exhaustive-deps
  const tabs = useMemo(() => normalizeTabs(tabsProp), [tabsKey]);

  // ── Color state ────────────────────────────────────────────────────────────
  // HSBA is stored as unrounded floats: hex → HSB → hex is lossless, and the
  // hue survives greys/black/white.
  const [color, setColor] = useState<Hsba>(() => initialColor(value, showAlpha));
  const colorRef = useRef(color);
  useIsomorphicLayoutEffect(() => {
    colorRef.current = color;
  }, [color]);

  // Sync from the `value` prop. This is React's "adjust state when a prop
  // changes" pattern (state only, no refs written during render). Echoes of
  // our own onChange are ignored, so in-flight floats aren't re-quantized.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const parsed = parseColor(value, color.h);
    if (parsed) {
      const next = showAlpha ? parsed : { ...parsed, a: 100 };
      if (formatColor(next, showAlpha) !== formatColor(color, showAlpha)) setColor(next);
    }
  }

  const showAlphaRef = useLatestRef(showAlpha);
  const onChangeRef = useLatestRef(onChange);
  const onChangeCompleteRef = useLatestRef(onChangeComplete);

  /** Applies a change, notifies `onChange` (only if the hex actually changed) and optionally `onChangeComplete`. */
  const apply = useCallback(
    (patch: Partial<Hsba>, complete: boolean) => {
      const withAlpha = showAlphaRef.current;
      const prev = colorRef.current;
      const next: Hsba = { ...prev, ...patch };
      if (!withAlpha) next.a = 100;
      colorRef.current = next;
      setColor(next);
      const out = formatColor(next, withAlpha);
      if (out !== formatColor(prev, withAlpha)) onChangeRef.current?.(out);
      if (complete) onChangeCompleteRef.current?.(out);
    },
    [showAlphaRef, onChangeRef, onChangeCompleteRef],
  );

  /** Parses a hex and applies it. Keeps the hue for greys; keeps alpha unless the hex has one (or `resetAlpha`). */
  const applyHex = useCallback(
    (hex: string, resetAlpha: boolean) => {
      const full = normalizeHex(hex);
      const parsed = full ? parseColor(full, colorRef.current.h) : null;
      if (!full || !parsed) return;
      const { a, ...hsb } = parsed;
      apply(full.length === 9 || resetAlpha ? { ...hsb, a } : hsb, true);
    },
    [apply],
  );

  const handleHueChange = useCallback((h: number) => apply({ h }, false), [apply]);
  const handleSatBrightChange = useCallback(
    ({ s, b }: { s: number; b: number }) => apply({ s, b }, false),
    [apply],
  );
  const handleAlphaChange = useCallback((a: number) => apply({ a }, false), [apply]);
  const handleChangeEnd = useCallback(() => {
    onChangeCompleteRef.current?.(formatColor(colorRef.current, showAlphaRef.current));
  }, [onChangeCompleteRef, showAlphaRef]);

  const handleHexCommit = useCallback((hex: string) => applyHex(hex, false), [applyHex]);
  const handleRgbCommit = useCallback((rgb: Rgb) => apply(rgbToHsb(rgb, colorRef.current.h), true), [apply]);
  const handleHsbCommit = useCallback((hsb: Partial<Hsb>) => apply(hsb, true), [apply]);
  const handleAlphaCommit = useCallback((a: number) => apply({ a }, true), [apply]);
  // Palette colors are complete colors: a 6-digit swatch resets alpha to 100%.
  const handleSelectColor = useCallback((hex: string) => applyHex(hex, true), [applyHex]);

  // ── Saved colors ───────────────────────────────────────────────────────────
  const isControlled = savedColorsProp !== undefined;
  const [internalSaved, setInternalSaved] = useState<string[]>(() => defaultSavedColors ?? []);
  const savedColors = isControlled ? savedColorsProp : internalSaved;
  const savedRef = useLatestRef(savedColors);
  const isControlledRef = useLatestRef(isControlled);
  const savedCallbacksRef = useLatestRef({
    onSaveColor,
    onClearSaved,
    onRemoveSavedColor,
    onSavedColorsChange,
  });

  const updateSaved = useCallback(
    (next: string[]) => {
      savedRef.current = next; // so two quick actions before re-render don't lose one
      if (!isControlledRef.current) setInternalSaved(next);
      savedCallbacksRef.current.onSavedColorsChange?.(next);
    },
    [savedRef, isControlledRef, savedCallbacksRef],
  );

  const handleSaveColor = useCallback(() => {
    const hex = formatColor(colorRef.current, showAlphaRef.current);
    if (savedRef.current.some((c) => normalizeHex(c) === hex)) return;
    savedCallbacksRef.current.onSaveColor?.(hex);
    updateSaved([hex, ...savedRef.current]);
  }, [showAlphaRef, savedRef, savedCallbacksRef, updateSaved]);

  const handleRemoveSavedColor = useCallback(
    (hex: string) => {
      savedCallbacksRef.current.onRemoveSavedColor?.(hex);
      updateSaved(savedRef.current.filter((c) => c !== hex));
    },
    [savedRef, savedCallbacksRef, updateSaved],
  );

  const handleClearSaved = useCallback(() => {
    savedCallbacksRef.current.onClearSaved?.();
    updateSaved([]);
  }, [savedCallbacksRef, updateSaved]);

  // In controlled mode, only offer remove/clear when the parent can react to it.
  const canEditSaved = !isControlled || !!onSavedColorsChange;

  // ── Tabs & modal ───────────────────────────────────────────────────────────
  const [activeTabState, setActiveTab] = useState<TabId>(() =>
    initialTab && tabs.includes(initialTab) ? initialTab : tabs[0]!,
  );
  // Kept here (not in the panel) so the selected tab survives closing the modal.
  const activeTab = tabs.includes(activeTabState) ? activeTabState : tabs[0]!;
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  useImperativeHandle(
    ref,
    () => ({
      getColor: () => formatColor(colorRef.current, showAlphaRef.current),
      setColor: (hex: string) => applyHex(hex, false),
      clearSaved: handleClearSaved,
      removeSavedColor: handleRemoveSavedColor,
      open: openModal,
      close: closeModal,
    }),
    [showAlphaRef, applyHex, handleClearSaved, handleRemoveSavedColor, openModal, closeModal],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const currentHex = hsbToHex(color.h, color.s, color.b);
  const outputHex = formatColor(color, showAlpha);
  const displayAlpha = showAlpha ? color.a : 100;

  const panelProps: PickerPanelProps = {
    hue: color.h,
    sat: color.s,
    bright: color.b,
    alpha: showAlpha ? color.a : undefined,
    currentHex,
    outputHex,
    contrastColor: getContrastColor(currentHex, displayAlpha),
    savedColors,
    tabs,
    activeTab,
    onTabChange: setActiveTab,
    hueStripHeight,
    disabled,
    t,
    labels,
    palettes,
    confirmClear,
    onHueChange: handleHueChange,
    onSatBrightChange: handleSatBrightChange,
    onAlphaChange: handleAlphaChange,
    onChangeEnd: handleChangeEnd,
    onHexCommit: handleHexCommit,
    onRgbCommit: handleRgbCommit,
    onHsbCommit: handleHsbCommit,
    onAlphaCommit: handleAlphaCommit,
    onSaveColor: handleSaveColor,
    onSelectColor: handleSelectColor,
    onClearSaved: canEditSaved || onClearSaved ? handleClearSaved : undefined,
    onRemoveSavedColor: canEditSaved || onRemoveSavedColor ? handleRemoveSavedColor : undefined,
  };

  if (inline) {
    return <PickerPanel {...panelProps} style={style} />;
  }

  return (
    <>
      <Pressable
        testID="color-picker-swatch"
        onPress={openModal}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={labels.openPicker}
        accessibilityValue={{ text: outputHex }}
        accessibilityState={{ disabled, expanded: modalVisible }}
        style={[
          {
            width: swatchSize,
            height: swatchSize,
            borderRadius: swatchBorderRadius,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: t.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          },
          swatchStyle,
        ]}
      >
        <ColorFill color={currentHex} alpha={displayAlpha} />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View
          style={{
            flex: 1,
            backgroundColor: t.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          {/* Backdrop — absolutely positioned behind the content */}
          <Pressable
            testID="color-picker-backdrop"
            onPress={closeModal}
            accessibilityRole="button"
            accessibilityLabel={labels.closePicker}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View style={[{ width: "100%", alignItems: "center" }, contentStyle]}>
            <PickerPanel {...panelProps} style={[{ width: panelWidth }, style]} />
          </View>
        </View>
      </Modal>
    </>
  );
});
