import { useFormat } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import type { CartesianChartProps } from '@ui/cartesian-chart';
import {
  CartesianChart,
  DateLines,
  EventIndicator,
  HorizontalLine,
  StackedHistoryBar,
  VerticalLine,
} from '@ui/cartesian-chart';
import { api } from '@ui/query';
import { DateTime } from 'luxon';
import { type ReactNode, useMemo } from 'react';
import styles from '../styles.module.css';
import type { MoneybookChartParams } from './data.ts';
import { createMoneybookChart } from './data.ts';

export interface MoneybookChartProps
  extends MoneybookChartParams, Omit<CartesianChartProps, 'children'> {}

const dateLinesData = { timezone: 'Asia/Seoul' };

export function MoneybookChart({
  data,
  queries,
  start,
  end,
  ...props
}: MoneybookChartProps): ReactNode {
  const { data: { data: lifeIndicatorData } = {} } = useQuery(
    api('life-indicator'),
  );

  const krwFormat = useFormat('KRW');

  const chart = useMemo(
    () => createMoneybookChart({ data, queries, start, end }),
    [data, end, queries, start],
  );

  const latestHorizontal = useMemo(() => {
    return chart.history.records.at(-1);
  }, [chart.history.records]);

  const latestVertical = useMemo(() => {
    return chart.latest?.children.at(-1);
  }, [chart.latest?.children]);

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
      <StackedHistoryBar
        className={styles.stackedHistoryBar}
        {...chart.history}
        axis={chart.axis}
      />
      {latestVertical && (
        <VerticalLine
          className={styles.verticalLine}
          axis={chart.axis}
          value={DateTime.fromISO(latestVertical.date).endOf('day').toMillis()}
          label={latestVertical.date}
        />
      )}
      {latestHorizontal && (
        <HorizontalLine
          className={styles.priceLine}
          axis={chart.axis}
          value={latestHorizontal.value}
          label={krwFormat(latestHorizontal.value)}
        />
      )}
    </CartesianChart>
  ) : null;
}
