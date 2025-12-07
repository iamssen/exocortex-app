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
import type { EnergyAndExerciseChartParams } from './data.ts';
import { createEnergyAndExerciseChartData } from './data.ts';

export interface EnergyAndExerciseChartProps
  extends EnergyAndExerciseChartParams, Omit<CartesianChartProps, 'children'> {}

const dateLinesData = { timezone: 'Asia/Seoul' };

export function EnergyAndExerciseChart({
  data,
  start,
  end,
  ...props
}: EnergyAndExerciseChartProps): ReactNode {
  const { data: { data: lifeIndicatorData } = {} } = useQuery(
    api('life-indicator'),
  );

  const chart = useMemo(
    () => createEnergyAndExerciseChartData({ data: data, start, end }),
    [end, data, start],
  );

  const timeFormat = useFormat('00:00:00');
  const kcalFormat = useFormat('KCAL');

  return chart ? (
    <CartesianChart {...props}>
      <DateLines
        key={`line:${chart.energyAxis.x.min}`}
        className={styles.dateLines}
        {...dateLinesData}
        axis={chart.energyAxis}
      />
      {lifeIndicatorData && (
        <EventIndicator
          data={lifeIndicatorData}
          axis={chart.energyAxis}
          className={styles.eventIndicator}
        />
      )}
      <HistoryBar
        className={styles.historyBar}
        {...chart.exerciseHistory}
        axis={chart.exerciseAxis}
      />
      <HistoryLine
        className={styles.historyLine}
        {...chart.energyHistory}
        axis={chart.energyAxis}
      />
      {chart.latestExercise &&
        typeof chart.latestExercise.totalExercise === 'number' && (
          <HorizontalLine
            className={styles.priceLine}
            style={{ color: 'deepskyblue', opacity: 0.6 }}
            axis={chart.exerciseAxis}
            value={chart.latestExercise.totalExercise}
            label={`${timeFormat(chart.latestExercise.totalExercise * 60)}`}
          />
        )}
      {chart.latestEnergy &&
        typeof chart.latestEnergy.avgDayEnergy === 'number' && (
          <HorizontalLine
            className={styles.priceLine}
            axis={chart.energyAxis}
            value={chart.latestEnergy.avgDayEnergy}
            label={`${kcalFormat(chart.latestEnergy.avgDayEnergy)}`}
          />
        )}
    </CartesianChart>
  ) : null;
}
