import type { AggregatedBody, ASC } from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { KcalChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from '../BodySummaryPage.module.css';

export interface KcalSectionProps {
  dataKey: 'weeks' | 'months';
  chartStartDate: DateItem;
}

export function KcalSection({
  dataKey,
  chartStartDate,
}: KcalSectionProps): ReactNode {
  const { data } = useSuspenseQuery(
    api(
      'body',
      {},
      {
        select: ({ data: d }) =>
          d[dataKey].filter(
            ({ avgDayKcal }) => typeof avgDayKcal === 'number',
          ) as unknown as ASC<AggregatedBody>,
      },
    ),
  );

  return (
    <figure aria-label="Calorie intake history">
      <Link to="./kcal">
        <figcaption>
          Kcal
          <sub>{data.at(-1)?.dayKcals.findLast((o) => !!o)?.date}</sub>
        </figcaption>
        <KcalChart
          data={data}
          className={styles.chart}
          start={chartStartDate.value}
        />
      </Link>
    </figure>
  );
}
