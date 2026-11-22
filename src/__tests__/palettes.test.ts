import { tailwindColors, tailwindPalette, type ColorPalette } from "../index";

describe("tailwindPalette", () => {
  it("keeps its exact type (type-checked by `bun run typecheck`)", () => {
    // These lines must compile without casts — they broke in 1.3.0.
    const shade: string = tailwindPalette.colors.red[500];
    const name: string = tailwindPalette.name;
    expect(shade).toBe("#FB2C36");
    expect(name).toBe("Tailwind");
  });

  it("is still assignable to ColorPalette", () => {
    const palettes: ColorPalette[] = [tailwindPalette];
    expect(palettes[0]!.colors).toBe(tailwindColors);
  });
});
