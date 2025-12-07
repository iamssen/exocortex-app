import type { Iso8601 } from '@iamssen/exocortex';
import { useLocalStorageJson } from '@iamssen/use-local-storage';
import { useMemo } from 'react';

export function useMultiDateSelectState(
  persistKey: string,
  dates: Iso8601[],
  defaultState: Iso8601[],
): [Iso8601[], (nextValue: Iso8601[]) => void] {
  const [persistState, setPersistState] = useLocalStorageJson(
    persistKey,
    () => defaultState,
  );

  const state = useMemo<Iso8601[]>(() => {
    return dates.filter((d) => persistState.includes(d));
  }, [dates, persistState]);

  return [state, setPersistState];
}
