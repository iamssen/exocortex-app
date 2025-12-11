import type {
  AggregatedBody,
  ASC,
  Body,
  VersionData,
} from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { WeightAndWaistChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import styles from '../BodySummaryPage.module.css';
import { getExist } from './getExist.ts';

export interface WeightAndWaistSectionProps {
  dataKey: 'weeks' | 'months';
  chartStartDate: DateItem;
}

function selectData({ data }: VersionData<Body>, dataKey: 'weeks' | 'months') {
  const chartData = data[dataKey].filter(
    (d) =>
      typeof d.avgDayWeight === 'number' || typeof d.avgDayWaist === 'number',
  ) as unknown as ASC<AggregatedBody>;

  return {
    chartData,
  };
}

export function WeightAndWaistSection({
  dataKey,
  chartStartDate,
}: WeightAndWaistSectionProps): ReactNode {
  const {
    data: { chartData },
  } = useSuspenseQuery(
    api(
      'body',
      {},
      {
        select: (d) => selectData(d, dataKey),
      },
    ),
  );

  if (chartData.length === 0) {
    return null;
  }

  return (
    <figure aria-label="Body weight and waist circumference history">
      <figcaption>
        Weight & Waist
        <sub aria-label="The date of the last collected data">
          {getExist(chartData.at(-1), 'dayWeights', 'dayWaists')
            ?.findLast((o) => !!o)
            ?.date.slice(0, 10)}
        </sub>
      </figcaption>
      <WeightAndWaistChart
        data={chartData}
        className={styles.chart}
        start={chartStartDate.value}
      />
    </figure>
  );
}
