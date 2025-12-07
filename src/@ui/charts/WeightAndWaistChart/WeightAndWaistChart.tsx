import { useFormat } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import type { CartesianChartProps } from '@ui/cartesian-chart';
import {
  CartesianChart,
  DateLines,
  EventIndicator,
  HistoryBar,
  HistoryLine,
  HorizontalLine,
} from '@ui/cartesian-chart';
import { api } from '@ui/query';
import { type ReactNode, useMemo } from 'react';
import styles from '../styles.module.css';
import type { WeightAndWaistChartParams } from './data.ts';
import { createWeightAndWaistChartData } from './data.ts';

export interface WeightAndWaistChartProps
  extends WeightAndWaistChartParams, Omit<CartesianChartProps, 'children'> {}

const dateLinesData = { timezone: 'Asia/Seoul' };

export function WeightAndWaistChart({
  data,
  start,
  end,
  ...props
}: WeightAndWaistChartProps): ReactNode {
  const { data: { data: lifeIndicatorData } = {} } = useQuery(
    api('life-indicator'),
  );

  const chart = useMemo(
    () => createWeightAndWaistChartData({ data: data, start, end }),
    [end, start, data],
  );

  const kgFormat = useFormat('KILOGRAM');
  const cmFormat = useFormat('CENTIMETER');

  return chart ? (
    <CartesianChart {...props}>
      <DateLines
        key={`line:${chart.weightAxis.x.min}`}
        className={styles.dateLines}
        {...dateLinesData}
        axis={chart.weightAxis}
      />
      {lifeIndicatorData && (
        <EventIndicator
          data={lifeIndicatorData}
          axis={chart.weightAxis}
          className={styles.eventIndicator}
        />
      )}
      <HistoryBar
        className={styles.historyBar}
        {...chart.weightHistory}
        axis={chart.weightAxis}
      />
      <HistoryLine
        className={styles.historyLine}
        {...chart.waistHistory}
        axis={chart.waistAxis}
      />
      {typeof chart.latestWeight.avgDayWeight === 'number' && (
        <HorizontalLine
          className={styles.priceLine}
          style={{ color: 'deepskyblue', opacity: 0.6 }}
          axis={chart.weightAxis}
          value={chart.latestWeight.avgDayWeight}
          label={`${kgFormat(chart.latestWeight.avgDayWeight)}`}
        />
      )}
      {typeof chart.latestWaist.avgDayWaist === 'number' && (
        <HorizontalLine
          className={styles.priceLine}
          axis={chart.waistAxis}
          value={chart.latestWaist.avgDayWaist}
          label={`${cmFormat(chart.latestWaist.avgDayWaist)}`}
        />
      )}
    </CartesianChart>
  ) : null;
}
