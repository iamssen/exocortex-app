import { useLocalStorageJson } from '@iamssen/use-local-storage';
import { useCallback, useMemo } from 'react';
import type { Stacked } from './StackedLegend.tsx';

interface Data {
  selected: string[];
}

export function useStackedLegend<T extends Stacked>(
  key: string,
  data: T[],
): [string[], (enableNames: string[], disableNames: string[]) => void, T[]] {
  const [persist, setPersist] = useLocalStorageJson<Data>(key, () => ({
    selected: data.map(({ name }) => name),
  }));

  const update = useCallback(
    (enableNames: string[], disableNames: string[]) => {
      const selectedNames = new Set(persist.selected);

      for (const name of enableNames) {
        if (!selectedNames.has(name)) {
          selectedNames.add(name);
        }
      }

      for (const name of disableNames) {
        if (selectedNames.has(name)) {
          selectedNames.delete(name);
        }
      }

      const selected = data
        .filter(({ name }) => selectedNames.has(name))
        .map(({ name }) => name);

      setPersist({
        selected,
      });
    },
    [data, persist.selected, setPersist],
  );

  const selected = useMemo(() => {
    return data.filter(({ name }) => persist.selected.includes(name));
  }, [data, persist.selected]);

  return [persist.selected, update, selected];
}
