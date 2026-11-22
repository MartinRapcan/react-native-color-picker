import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ColorPicker, tailwindPalette, type ColorPickerRef, type ColorPalette } from "../index";
import { hsbToHex } from "../utils/colors";

const PALETTE: ColorPalette[] = [
  { name: "Test", colors: { red: "#FB2C36", grey: "#808080", translucent: "#33669980" } },
];

const header = () => screen.getByTestId("color-picker-header-hex");

/** Lets the palettes tab finish its frame-by-frame progressive rendering (needs fake timers). */
async function flushFrames() {
  await act(() => {
    jest.runAllTimers();
  });
}

async function commitText(testID: string, text: string) {
  const input = screen.getByTestId(testID);
  await fireEvent(input, "focus");
  await fireEvent.changeText(input, text);
  // iOS/Android fire both submit and blur when pressing return — must commit once.
  await fireEvent(input, "submitEditing");
  await fireEvent(input, "blur");
}

/** Minimal touch history so PanResponder can compute gesture deltas. */
function touchEvent(x: number, y: number, ts: number, start: { x: number; y: number }) {
  return {
    nativeEvent: { locationX: x, locationY: y, pageX: x, pageY: y, touches: [{}], changedTouches: [{}] },
    touchHistory: {
      numberActiveTouches: 1,
      indexOfSingleActiveTouch: 0,
      mostRecentTimeStamp: ts,
      touchBank: [
        {
          touchActive: true,
          startPageX: start.x,
          startPageY: start.y,
          startTimeStamp: 0,
          currentPageX: x,
          currentPageY: y,
          currentTimeStamp: ts,
          previousPageX: start.x,
          previousPageY: start.y,
          previousTimeStamp: 0,
        },
      ],
    },
  };
}

afterEach(() => {
  jest.useRealTimers();
});

describe("ColorPicker", () => {
  it("shows the exact value it was given (no HSB rounding drift)", async () => {
    await render(<ColorPicker inline value="#007AFF" />);
    expect(header()).toHaveTextContent("#007AFF");
  });

  it("falls back to the default color for an invalid value", async () => {
    await render(<ColorPicker inline value="not-a-color" />);
    expect(header()).toHaveTextContent("#007AFF");
  });

  it("emits the exact palette color", async () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    const onChangeComplete = jest.fn();
    await render(
      <ColorPicker
        inline
        initialTab="palettes"
        palettes={[tailwindPalette]}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />,
    );
    await flushFrames();
    await fireEvent.press(screen.getByLabelText("500, #FB2C36"));
    expect(onChange).toHaveBeenLastCalledWith("#FB2C36");
    expect(onChangeComplete).toHaveBeenLastCalledWith("#FB2C36");
    expect(header()).toHaveTextContent("#FB2C36");
  });

  it("keeps the hue when a grey is selected", async () => {
    await render(<ColorPicker inline value="#336699" palettes={PALETTE} initialTab="palettes" />);
    await fireEvent.press(screen.getByLabelText("grey, #808080"));
    await fireEvent.press(screen.getByTestId("color-picker-tab-picker"));
    expect(screen.getByTestId("color-picker-hue")).toHaveAccessibilityValue({ now: 210 });
  });

  describe("hex input", () => {
    it("commits once on submit + blur", async () => {
      const onChange = jest.fn();
      const onChangeComplete = jest.fn();
      await render(
        <ColorPicker inline initialTab="values" onChange={onChange} onChangeComplete={onChangeComplete} />,
      );
      await commitText("color-picker-hex-input", "#336699");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("#336699");
      expect(onChangeComplete).toHaveBeenCalledTimes(1);
    });

    it("accepts 8-digit hex when alpha is on", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline showAlpha initialTab="values" onChange={onChange} />);
      expect(screen.getByTestId("color-picker-hex-input")).toHaveProp("maxLength", 9);
      await commitText("color-picker-hex-input", "#33669980");
      expect(onChange).toHaveBeenLastCalledWith("#33669980");
    });

    it("keeps the current alpha when a 6-digit hex is typed", async () => {
      const onChange = jest.fn();
      await render(
        <ColorPicker inline showAlpha value="#00000080" initialTab="values" onChange={onChange} />,
      );
      await commitText("color-picker-hex-input", "#336699");
      expect(onChange).toHaveBeenLastCalledWith("#33669980");
    });

    it("accepts shorthand", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline initialTab="values" onChange={onChange} />);
      await commitText("color-picker-hex-input", "f0f");
      expect(onChange).toHaveBeenLastCalledWith("#FF00FF");
    });

    it("reverts invalid input", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline value="#336699" initialTab="values" onChange={onChange} />);
      await commitText("color-picker-hex-input", "zzz");
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByTestId("color-picker-hex-input")).toHaveDisplayValue("#336699");
    });
  });

  describe("numeric fields", () => {
    it("edits RGB channels", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline value="#336699" initialTab="values" onChange={onChange} />);
      await commitText("color-picker-r", "255");
      expect(onChange).toHaveBeenLastCalledWith("#FF6699");
    });

    it("clamps and edits HSB", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline value="#FF0000" initialTab="values" onChange={onChange} />);
      await commitText("color-picker-h", "999");
      // Clamped to 360°, which is the same red → no change is reported.
      expect(screen.getByTestId("color-picker-h")).toHaveDisplayValue("360");
      expect(onChange).not.toHaveBeenCalled();
      await commitText("color-picker-h", "120");
      expect(onChange).toHaveBeenLastCalledWith("#00FF00");
    });

    it("edits alpha", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline showAlpha value="#336699" initialTab="values" onChange={onChange} />);
      await commitText("color-picker-a", "50");
      expect(onChange).toHaveBeenLastCalledWith("#33669980");
    });
  });

  describe("value prop", () => {
    it("follows external changes", async () => {
      await render(<ColorPicker inline value="#336699" />);
      await screen.rerender(<ColorPicker inline value="#FB2C36" />);
      expect(header()).toHaveTextContent("#FB2C36");
    });

    it("ignores echoes of its own onChange", async () => {
      const onChange = jest.fn();
      await render(<ColorPicker inline value="#336699" initialTab="values" onChange={onChange} />);
      await commitText("color-picker-h", "100");
      const emitted = onChange.mock.calls.at(-1)![0] as string;
      await screen.rerender(<ColorPicker inline value={emitted} initialTab="values" onChange={onChange} />);
      // Hue stays exactly what the user typed instead of being re-derived from the 8-bit hex.
      expect(screen.getByTestId("color-picker-h")).toHaveDisplayValue("100");
    });
  });

  describe("sliders", () => {
    it("supports screen-reader increment/decrement", async () => {
      const onChange = jest.fn();
      const onChangeComplete = jest.fn();
      await render(
        <ColorPicker inline value="#FF0000" onChange={onChange} onChangeComplete={onChangeComplete} />,
      );
      const hue = screen.getByTestId("color-picker-hue");
      expect(hue).toHaveAccessibleName("Hue");
      await fireEvent(hue, "accessibilityAction", { nativeEvent: { actionName: "increment" } });
      expect(onChange).toHaveBeenLastCalledWith(hsbToHex(5, 100, 100));
      expect(onChangeComplete).toHaveBeenCalledTimes(1);
      expect(hue).toHaveAccessibilityValue({ now: 5, text: "5°" });
    });

    it("maps drags on the pad and reports completion on release", async () => {
      const onChange = jest.fn();
      const onChangeComplete = jest.fn();
      await render(
        <ColorPicker inline value="#FF0000" onChange={onChange} onChangeComplete={onChangeComplete} />,
      );
      const pad = screen.getByTestId("color-picker-pad");
      await fireEvent.layout(pad, { width: 200, height: 200 });

      const start = { x: 100, y: 50 };
      await fireEvent(pad, "responderGrant", touchEvent(100, 50, 1, start));
      expect(onChange).toHaveBeenLastCalledWith(hsbToHex(0, 50, 75));
      expect(onChangeComplete).not.toHaveBeenCalled();

      await fireEvent(pad, "responderMove", touchEvent(200, 0, 2, start));
      expect(onChange).toHaveBeenLastCalledWith("#FF0000");

      await fireEvent(pad, "responderRelease", touchEvent(200, 0, 3, start));
      expect(onChangeComplete).toHaveBeenCalledWith("#FF0000");
    });

    it("hides the alpha slider unless showAlpha is set", async () => {
      await render(<ColorPicker inline />);
      expect(screen.queryByTestId("color-picker-alpha")).not.toBeOnTheScreen();
    });
  });

  describe("ref API", () => {
    it("includes alpha in getColor and keeps alpha in setColor", async () => {
      const ref = createRef<ColorPickerRef>();
      const onChange = jest.fn();
      await render(<ColorPicker ref={ref} inline showAlpha value="#00000080" onChange={onChange} />);
      expect(ref.current!.getColor()).toBe("#00000080");
      await act(() => ref.current!.setColor("#FB2C36"));
      expect(onChange).toHaveBeenLastCalledWith("#FB2C3680");
      expect(ref.current!.getColor()).toBe("#FB2C3680");
    });

    it("ignores invalid colors", async () => {
      const ref = createRef<ColorPickerRef>();
      const onChange = jest.fn();
      await render(<ColorPicker ref={ref} inline onChange={onChange} />);
      await act(() => ref.current!.setColor("nope"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("saved colors", () => {
    it("saves, removes and clears (with confirmation) when uncontrolled", async () => {
      const onSavedColorsChange = jest.fn();
      await render(
        <ColorPicker
          inline
          value="#336699"
          initialTab="palettes"
          onSavedColorsChange={onSavedColorsChange}
        />,
      );
      await fireEvent.press(screen.getByTestId("color-picker-save"));
      await fireEvent.press(screen.getByTestId("color-picker-save")); // duplicate is ignored
      expect(onSavedColorsChange).toHaveBeenCalledTimes(1);
      expect(onSavedColorsChange).toHaveBeenLastCalledWith(["#336699"]);
      expect(screen.getByLabelText("#336699")).toBeOnTheScreen();

      await fireEvent.press(screen.getByLabelText("Remove color #336699"));
      expect(onSavedColorsChange).toHaveBeenLastCalledWith([]);
      expect(screen.getByText("No saved colors")).toBeOnTheScreen();

      await fireEvent.press(screen.getByTestId("color-picker-save"));
      const clear = screen.getByTestId("color-picker-clear-saved");
      await fireEvent.press(clear);
      expect(screen.getByText("Confirm?")).toBeOnTheScreen();
      expect(onSavedColorsChange).toHaveBeenLastCalledWith(["#336699"]);
      await fireEvent.press(clear);
      expect(onSavedColorsChange).toHaveBeenLastCalledWith([]);
    });

    it("clears immediately when confirmClear is false", async () => {
      await render(
        <ColorPicker inline initialTab="palettes" defaultSavedColors={["#FF0000"]} confirmClear={false} />,
      );
      await fireEvent.press(screen.getByTestId("color-picker-clear-saved"));
      expect(screen.getByText("No saved colors")).toBeOnTheScreen();
    });

    it("hides remove/clear for a controlled list without handlers", async () => {
      await render(<ColorPicker inline initialTab="palettes" savedColors={["#FF0000"]} />);
      expect(screen.queryByTestId("color-picker-clear-saved")).not.toBeOnTheScreen();
      expect(screen.queryByLabelText("Remove color #FF0000")).not.toBeOnTheScreen();
    });

    it("calls the controlled callbacks", async () => {
      const onSaveColor = jest.fn();
      const onRemoveSavedColor = jest.fn();
      await render(
        <ColorPicker
          inline
          value="#00FF00"
          initialTab="palettes"
          savedColors={["#FF0000"]}
          onSaveColor={onSaveColor}
          onRemoveSavedColor={onRemoveSavedColor}
        />,
      );
      await fireEvent.press(screen.getByTestId("color-picker-save"));
      expect(onSaveColor).toHaveBeenCalledWith("#00FF00");
      await fireEvent.press(screen.getByLabelText("Remove color #FF0000"));
      expect(onRemoveSavedColor).toHaveBeenCalledWith("#FF0000");
    });
  });

  describe("tabs & modal", () => {
    it("always includes the picker tab and honours initialTab", async () => {
      await render(<ColorPicker inline tabs={["values"]} initialTab="values" />);
      expect(screen.getByTestId("color-picker-tab-picker")).toBeOnTheScreen();
      expect(screen.getByTestId("color-picker-tab-values")).toBeSelected();
      expect(screen.getByTestId("color-picker-hex-input")).toBeOnTheScreen();
    });

    it("opens from the swatch and remembers the tab after closing", async () => {
      await render(<ColorPicker value="#336699" />);
      const swatch = screen.getByRole("button", { name: "Open color picker" });
      expect(swatch).toHaveAccessibilityValue({ text: "#336699" });

      await fireEvent.press(swatch);
      await fireEvent.press(screen.getByTestId("color-picker-tab-values"));
      await fireEvent.press(screen.getByTestId("color-picker-backdrop"));
      await fireEvent.press(swatch);
      expect(screen.getByTestId("color-picker-tab-values")).toBeSelected();
    });

    it("does not open when disabled", async () => {
      await render(<ColorPicker disabled />);
      expect(screen.getByRole("button", { name: "Open color picker" })).toBeDisabled();
    });
  });

  it("applies theme overrides", async () => {
    await render(<ColorPicker inline theme={{ base: "light", background: "#123456" }} />);
    expect(screen.getByTestId("color-picker-panel")).toHaveStyle({ backgroundColor: "#123456" });
  });

  it("uses unique SVG ids for multiple pickers", async () => {
    await render(
      <>
        <ColorPicker inline showAlpha value="#33669980" />
        <ColorPicker inline showAlpha value="#33669980" />
      </>,
    );
    for (const testID of ["color-picker-pad", "color-picker-hue", "color-picker-alpha"]) {
      for (const el of screen.getAllByTestId(testID)) await fireEvent.layout(el, { width: 200, height: 200 });
    }
    const ids: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);
      const { type, props, children } = node as {
        type: string;
        props: Record<string, unknown>;
        children?: unknown;
      };
      if (/Gradient|Pattern/.test(type) && typeof props.name === "string") ids.push(props.name);
      walk(children);
    };
    walk(screen.toJSON());
    expect(ids.length).toBeGreaterThan(4);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
