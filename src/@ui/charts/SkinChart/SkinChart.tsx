import { useFormat } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import {
  CartesianChart,
  DateLines,
  EventIndicator,
  HistoryLine,
  HorizontalLine,
  StackedHistoryArea,
  type CartesianChartProps,
} from '@ui/cartesian-chart';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import styles from '../styles.module.css';
import type { SkinChartParams } from './data';
import { createSkinChartData } from './data';

export interface SkinChartProps
  extends SkinChartParams, Omit<CartesianChartProps, 'children'> {}

const dateLinesData = { timezone: 'Asia/Seoul' };

export function SkinChart({
  data,
  start,
  end,
  ...props
}: SkinChartProps): ReactNode {
  const { data: { data: skinIndicatorData } = {} } = useQuery(
    api('skin-indicator'),
  );

  const chart = useMemo(
    () => createSkinChartData({ data, start, end }),
    [data, start, end],
  );

  const pointFormat = useFormat('POINT');

  return chart ? (
    <CartesianChart {...props}>
      <DateLines
        key={`line:${chart.severityAxis.x.min}`}
        className={styles.dateLines}
        {...dateLinesData}
        axis={chart.severityAxis}
      />
      {skinIndicatorData && (
        <EventIndicator
          data={skinIndicatorData}
          axis={chart.severityAxis}
          className={styles.eventIndicator}
        />
      )}
      <StackedHistoryArea
        className={styles.stackedHistoryArea}
        {...chart.severityHistory}
        axis={chart.severityAxis}
        drawLine={false}
      />
      <HistoryLine
        className={styles.historyLine}
        {...chart.pustulesHistory}
        axis={chart.pustulesAxis}
      />
      {chart.lastSeverity &&
        typeof chart.lastSeverity.severity === 'number' && (
          <HorizontalLine
            className={styles.priceLine}
            style={{ color: 'deepskyblue', opacity: 0.6 }}
            axis={chart.severityAxis}
            value={chart.lastSeverity.severity}
            label={`${pointFormat(chart.lastSeverity.severity)}`}
          />
        )}
      {chart.lastPustules &&
        typeof chart.lastPustules.pustules === 'number' && (
          <HorizontalLine
            className={styles.priceLine}
            axis={chart.pustulesAxis}
            value={chart.lastPustules.pustules}
            label={`${pointFormat(chart.lastPustules.pustules)}`}
          />
        )}
    </CartesianChart>
  ) : null;
}
