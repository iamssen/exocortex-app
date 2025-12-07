import type { MoneybookHistory } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import type { ScaleOrdinal } from 'd3-scale';
import { type ReactNode, useMemo } from 'react';
import styles from './MoneybookEventPage.module.css';

export interface CategoriesProps {
  history: MoneybookHistory[];
  colors: ScaleOrdinal<string, string>;
  onSelect: (category: string) => void;
}

export function Categories({
  history,
  colors,
  onSelect,
}: CategoriesProps): ReactNode {
  const categories = useMemo(() => {
    let t = 0;
    const obj: Record<string, number> = {};

    for (const { category, amount } of history) {
      t = t + amount;
      obj[category] = (obj[category] ?? 0) + amount;
    }

    return Object.keys(obj)
      .map((category) => ({
        category,
        amount: obj[category],
        ratio: obj[category] / t,
      }))
      .toSorted((a, b) => b.ratio - a.ratio);
  }, [history]);

  return (
    <ul className={styles.categories}>
      {categories.map(({ category, amount, ratio }) => (
        <li
          key={category}
          style={{ color: colors(category.split('/')[0]) }}
          data-ratio={
            ratio < 0.01 ? 'too small' : ratio < 0.1 ? 'small' : undefined
          }
          onClick={() => onSelect(category)}
        >
          {category}: <Format format="KRW" n={amount} />{' '}
          <sub>
            (<Format format="PERCENT" n={ratio * 100} />)
          </sub>
        </li>
      ))}
    </ul>
  );
}
