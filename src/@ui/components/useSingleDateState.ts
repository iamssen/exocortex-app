import { useLocalStorageJson } from '@iamssen/use-local-storage';
import { useMemo } from 'react';
import type { DateItem } from './SingleDateSelect.tsx';

export function useSingleDateState(
  persistKey: string,
  dates: DateItem[],
  defaultState: (draftDate: DateItem) => boolean,
): [DateItem, (nextValue: DateItem) => void] {
  const [persistState, setPersistState] = useLocalStorageJson(
    persistKey,
    () => {
      return dates.find(defaultState) ?? dates[0];
    },
  );

  const state = useMemo<DateItem>(() => {
    const valid = dates.some(({ label }) => persistState.label === label);
    return valid ? persistState : (dates.find(defaultState) ?? dates[0]);
  }, [dates, defaultState, persistState]);

  return [state, setPersistState];
}
