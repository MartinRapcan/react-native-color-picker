import { useCallback, useRef, useState } from "react";

/**
 * Text-input state for a field that mirrors an external value but lets the
 * user type freely while focused. The draft is committed exactly once per
 * editing session, whether editing ends via submit, blur, or both (which is
 * what happens on iOS/Android when you press return).
 */
export function useDraftInput(display: string, commit: (text: string) => void) {
  const [draft, setDraft] = useState<string | null>(null);
  const draftRef = useRef<string | null>(null);
  const committedRef = useRef(false);

  const onFocus = useCallback(() => {
    committedRef.current = false;
    draftRef.current = display;
    setDraft(display);
  }, [display]);

  const onChangeText = useCallback((text: string) => {
    committedRef.current = false;
    draftRef.current = text;
    setDraft(text);
  }, []);

  const finish = useCallback(() => {
    const text = draftRef.current;
    if (!committedRef.current && text !== null && text !== display) {
      commit(text);
    }
    committedRef.current = true;
    draftRef.current = null;
    setDraft(null);
  }, [commit, display]);

  return {
    value: draft ?? display,
    onFocus,
    onChangeText,
    onBlur: finish,
    onSubmitEditing: finish,
  };
}
