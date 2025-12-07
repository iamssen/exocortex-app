import type { FormatFunction } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import type {
  CartesianChartProps,
  HorizontalLineProps,
  PointProps,
} from '@ui/cartesian-chart';
import {
  CartesianChart,
  DateLines,
  EventIndicator,
  HorizontalLine,
  Point,
  StackedHistoryArea,
} from '@ui/cartesian-chart';
import { api } from '@ui/query';
import { type ReactNode, useMemo } from 'react';
import styles from '../styles.module.css';
import type { MoneybookSummaryChartParams } from './data.ts';
import { createMoneybookSummaryChart } from './data.ts';

export interface MoneybookSummaryChartProps
  extends MoneybookSummaryChartParams, Omit<CartesianChartProps, 'children'> {
  format: FormatFunction;
}

const dateLinesData = { timezone: 'Asia/Seoul' };

export function MoneybookSummaryChart({
  data,
  queries,
  start,
  end,
  format,
  ...props
}: MoneybookSummaryChartProps): ReactNode {
  const { data: { data: lifeIndicatorData } = {} } = useQuery(
    api('life-indicator'),
  );

  const { data: { data: financeIndicatorData } = {} } = useQuery(
    api('finance-indicator'),
  );

  const chart = useMemo(
    () =>
      createMoneybookSummaryChart({
        data,
        queries,
        start,
        end,
      }),
    [data, end, queries, start],
  );

  const latestLine = useMemo<
    Pick<HorizontalLineProps, 'value' | 'label'> | undefined
  >(() => {
    const v = chart.latest?.stackedValues.at(-1);
    if (typeof v !== 'number') {
      return undefined;
    }
    let fl = '';
    const fv = chart.first?.stackedValues.at(-1);
    if (typeof fv === 'number') {
      const diff = v - fv;
      fl = ` (${diff > 0 ? '+' : ''}${format(diff)})`;
    }
    return {
      value: v,
      label: format(v) + fl,
    };
  }, [chart.first?.stackedValues, chart.latest?.stackedValues, format]);

  const firstPoint = useMemo<
    Pick<PointProps, 'xValue' | 'yValue' | 'label'> | undefined
  >(() => {
    const t = chart.first?.timestamp;
    const v = chart.first?.stackedValues.at(-1);
    if (typeof t !== 'number' || typeof v !== 'number') {
      return undefined;
    }
    return {
      xValue: t,
      yValue: v,
      label: format(v),
    };
  }, [chart.first?.stackedValues, chart.first?.timestamp, format]);

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
          baseY={40}
        />
      )}
      {financeIndicatorData && (
        <EventIndicator
          data={financeIndicatorData}
          axis={chart.axis}
          className={styles.eventIndicator}
        />
      )}
      <StackedHistoryArea
        className={styles.stackedHistoryArea}
        {...chart.history}
        axis={chart.axis}
      />
      {firstPoint && (
        <Point
          className={styles.point}
          axis={chart.axis}
          {...firstPoint}
          style={{ color: '#aaaaaa' }}
        />
      )}
      {latestLine && (
        <HorizontalLine
          className={styles.priceLine}
          axis={chart.axis}
          {...latestLine}
        />
      )}
    </CartesianChart>
  ) : null;
}
