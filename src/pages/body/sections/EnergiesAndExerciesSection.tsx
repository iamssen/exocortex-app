import type { AggregatedBody, ASC } from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { EnergyAndExerciseChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import styles from '../BodySummaryPage.module.css';
import { getExist } from './getExist.ts';

export interface EnergiesAndExerciesSectionProps {
  dataKey: 'weeks' | 'months';
  chartStartDate: DateItem;
}

export function EnergiesAndExerciesSection({
  dataKey,
  chartStartDate,
}: EnergiesAndExerciesSectionProps): ReactNode {
  const {
    data: { chartData, lastDate },
  } = useSuspenseQuery(
    api(
      'body',
      {},
      {
        select: ({ data: d }) => {
          const weeksOrMonths = d[dataKey];
          const lastWeekOrMonth = weeksOrMonths.at(-1);

          return {
            lastDate: getExist(
              lastWeekOrMonth,
              'dayEnergies',
              'dayExercises',
            )?.findLast((o) => !!o)?.date,
            chartData: weeksOrMonths.filter(
              ({ avgDayEnergy, avgDayKcal }) =>
                typeof avgDayEnergy === 'number' ||
                typeof avgDayKcal === 'number',
            ) as unknown as ASC<AggregatedBody>,
          };
        },
      },
    ),
  );

  return (
    <figure aria-label="Calories burned and exercise times">
      <figcaption>
        Energy & Exercise
        <sub aria-label="The date of the last collected data">{lastDate}</sub>
      </figcaption>
      <EnergyAndExerciseChart
        data={chartData}
        className={styles.chart}
        start={chartStartDate.value}
      />
    </figure>
  );
}
