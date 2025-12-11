import type {
  AggregatedBody,
  ASC,
  Body,
  VersionData,
} from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { EnergyAndExerciseChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import styles from '../BodySummaryPage.module.css';
import { getExist } from './getExist.ts';

export interface EnergiesAndExercisesSectionProps {
  dataKey: 'weeks' | 'months';
  chartStartDate: DateItem;
}

function selectData({ data }: VersionData<Body>, dataKey: 'weeks' | 'months') {
  const weeksOrMonths = data[dataKey];
  const lastWeekOrMonth = weeksOrMonths.at(-1);

  const lastDate = getExist(
    lastWeekOrMonth,
    'dayEnergies',
    'dayExercises',
  )?.findLast((o) => !!o)?.date;
  const chartData = weeksOrMonths.filter(
    ({ avgDayEnergy, avgDayKcal }) =>
      typeof avgDayEnergy === 'number' || typeof avgDayKcal === 'number',
  );

  return {
    lastDate,
    chartData: chartData as unknown as ASC<AggregatedBody>,
  };
}

export function EnergiesAndExercisesSection({
  dataKey,
  chartStartDate,
}: EnergiesAndExercisesSectionProps): ReactNode {
  const {
    data: { chartData, lastDate },
  } = useSuspenseQuery(
    api(
      'body',
      {},
      {
        select: (d) => selectData(d, dataKey),
      },
    ),
  );

  return (
    <figure aria-label="Calories burned and exercise duration">
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
