import { useId } from "react";

/**
 * Unique, SVG-safe id. Gradient/pattern ids must be unique per document on
 * web (react-native-web renders real DOM ids), otherwise two pickers on one
 * screen would share — and overwrite — each other's gradients.
 */
export function useSvgId(prefix: string): string {
  const id = useId();
  return `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
