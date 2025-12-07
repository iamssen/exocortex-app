import { useFormat } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import type { CartesianChartProps } from '@ui/cartesian-chart';
import {
  CartesianChart,
  DateLines,
  EventIndicator,
  HistoryBar,
  HorizontalLine,
} from '@ui/cartesian-chart';
import {
  EXCESS_CALORIES,
  OPTIMAL_CALORIES,
  SUPER_EXCESS_CALORIES,
} from '@ui/env';
import { api } from '@ui/query';
import { type ReactNode, useMemo } from 'react';
import styles from '../styles.module.css';
import type { KcalChartParams } from './data.ts';
import { createKcalChartData } from './data.ts';

export interface KcalChartProps
  extends KcalChartParams, Omit<CartesianChartProps, 'children'> {}

const dateLinesData = { timezone: 'Asia/Seoul' };

export function KcalChart({
  data,
  start,
  end,
  ...props
}: KcalChartProps): ReactNode {
  const { data: { data: lifeIndicatorData } = {} } = useQuery(
    api('life-indicator'),
  );

  const chart = useMemo(
    () => createKcalChartData({ data: data, start, end }),
    [end, data, start],
  );

  const kcalFormat = useFormat('KCAL');

  return chart ? (
    <CartesianChart {...props}>
      <DateLines
        key={`line:${chart.axis.x.min}`}
        className={styles.dateLines}
        {...dateLinesData}
        axis={chart.axis}
      />
      {lifeIndicatorData && (
        <EventIndicator
          data={lifeIndicatorData}
          axis={chart.axis}
          className={styles.eventIndicator}
        />
      )}
      <HistoryBar
        className={styles.historyBar}
        {...chart.historyBar}
        axis={chart.axis}
      />
      <HorizontalLine
        className={styles.horizontalLine}
        axis={chart.axis}
        value={OPTIMAL_CALORIES}
        label="Optimal calories"
        style={{ color: 'royalblue', opacity: 0.7 }}
      />
      <HorizontalLine
        className={styles.horizontalLine}
        axis={chart.axis}
        value={EXCESS_CALORIES}
        label="Excess calories"
        style={{ color: 'indianred', opacity: 0.5 }}
      />
      <HorizontalLine
        className={styles.horizontalLine}
        axis={chart.axis}
        value={SUPER_EXCESS_CALORIES}
        label="Super excess calories"
        style={{ color: 'red', opacity: 0.4 }}
      />
      {chart.latest && typeof chart.latest.avgDayKcal === 'number' && (
        <HorizontalLine
          className={styles.priceLine}
          axis={chart.axis}
          value={chart.latest.avgDayKcal}
          label={`${kcalFormat(chart.latest.avgDayKcal)}`}
        />
      )}
    </CartesianChart>
  ) : null;
}
