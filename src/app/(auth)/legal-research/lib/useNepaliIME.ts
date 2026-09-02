import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSuggestions } from './transliterate';

export interface NepaliIME {
  enabled: boolean;
  toggle: () => void;
  suggestions: string[];
  activeIndex: number;
  composing: string;
  select: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ROMAN = /[A-Za-z]/;

export function useNepaliIME(
  value: string,
  setValue: (v: string) => void,
): NepaliIME {
  const [enabled, setEnabled] = useState(false);
  const [composing, setComposing] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const seqRef = useRef(0);
  const compStartRef = useRef(-1);

  useEffect(() => {
    if (!composing) {
      setSuggestions([]);
      setActiveIndex(0);
      return;
    }
    const seq = ++seqRef.current;
    fetchSuggestions(composing).then((results) => {
      if (seq === seqRef.current) {
        setSuggestions(results);
        setActiveIndex(0);
      }
    });
  }, [composing]);

  const commit = useCallback(
    (index: number, suffix: string) => {
      if (!suggestions.length || compStartRef.current < 0) return;
      const pick = suggestions[index] ?? suggestions[0] ?? composing;
      const before = value.slice(0, compStartRef.current);
      const after = value.slice(compStartRef.current + composing.length);
      setValue(before + pick + suffix + after);
      setComposing('');
      compStartRef.current = -1;
      setSuggestions([]);
      setActiveIndex(0);
    },
    [composing, suggestions, value, setValue],
  );

  const endComposition = useCallback(() => {
    setComposing('');
    compStartRef.current = -1;
    setSuggestions([]);
    setActiveIndex(0);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!enabled) return;

      if (composing && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % suggestions.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
          return;
        }
        if (/^[1-9]$/.test(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx < suggestions.length) {
            e.preventDefault();
            commit(idx, '');
            return;
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          endComposition();
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          commit(activeIndex, '');
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          commit(activeIndex, '');
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          commit(activeIndex, ' ');
          return;
        }
      }
    },
    [enabled, composing, suggestions, activeIndex, commit, endComposition],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;

      if (!enabled) {
        setValue(newVal);
        return;
      }

      if (newVal.length < value.length) {
        setValue(newVal);
        if (composing.length > 0) {
          const newComp = composing.slice(0, -1);
          if (newComp) {
            setComposing(newComp);
            compStartRef.current = newVal.length - newComp.length;
          } else {
            endComposition();
          }
        }
        return;
      }

      const added = newVal.slice(value.length);

      if (added.length === 1 && ROMAN.test(added)) {
        if (!composing) {
          compStartRef.current = value.length;
        }
        setComposing((prev) => prev + added);
        setValue(newVal);
        return;
      }

      if (composing && added === ' ') {
        // Space commits via onKeyDown — this shouldn't fire, but guard anyway
        setValue(newVal);
        return;
      }

      // Non-roman character or paste — end composition first
      if (composing) {
        endComposition();
      }
      setValue(newVal);
    },
    [enabled, value, composing, setValue, endComposition],
  );

  const toggle = useCallback(() => {
    setEnabled((v) => {
      if (v && composing) endComposition();
      return !v;
    });
  }, [composing, endComposition]);

  const select = useCallback(
    (index: number) => commit(index, ''),
    [commit],
  );

  return {
    enabled,
    toggle,
    suggestions,
    activeIndex,
    composing,
    select,
    onKeyDown,
    onChange,
  };
}
