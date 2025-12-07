import type {
  AggregatedBody,
  AggregatedRescuetimeHistory,
  ASC,
  Body,
  RescuetimeHistory,
} from '@iamssen/exocortex';
import { useQuery } from '@tanstack/react-query';
import {
  EnergyAndExerciseChart,
  KcalChart,
  RescuetimeSummaryChart,
  SkinChart,
  WeightAndWaistChart,
} from '@ui/charts';
import type { DateItem } from '@ui/components';
import {
  SingleDateSelect,
  toDateItem,
  useSingleDateState,
} from '@ui/components';
import { api } from '@ui/query';
import { DateTime } from 'luxon';
import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router';
import { bodyChartStartDurations } from '../../env.ts';
import { Page } from '../../Page.tsx';
import styles from './BodySummaryPage.module.css';
import { rescuetimeSummaryQuery } from './env.ts';

export function BodySummaryPage(): ReactNode {
  const { data: { data } = {} } = useQuery(api('body'));
  const { data: { data: rescuetimeData } = {} } = useQuery(api('rescuetime'));

  const firstMonth = useMemo(() => data?.months.at(0)?.month, [data?.months]);

  const chartStartDates = useMemo<DateItem[]>(() => {
    return [
      ...bodyChartStartDurations.map(toDateItem),
      ...(firstMonth
        ? [
            {
              label: 'ALL',
              value: firstMonth,
            },
          ]
        : []),
    ];
  }, [firstMonth]);

  const [chartStartDate, setChartStartDate] = useSingleDateState(
    'body_start_date',
    chartStartDates,
    ({ label }) => label === '5Y',
  );

  const dataKey = useMemo<keyof Pick<Body, 'weeks' | 'months'>>(() => {
    return Math.abs(
      DateTime.fromISO(chartStartDate.value).diffNow('days').days,
    ) < 366
      ? 'weeks'
      : 'months';
  }, [chartStartDate.value]);

  const kcals = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data[dataKey].filter(
      (d) => typeof d.avgDayKcal === 'number',
    ) as unknown as ASC<AggregatedBody>;
  }, [dataKey, data]);

  const weightsAndWaist = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data[dataKey].filter(
      (d) =>
        typeof d.avgDayWeight === 'number' || typeof d.avgDayWaist === 'number',
    ) as unknown as ASC<AggregatedBody>;
  }, [dataKey, data]);

  const energiesAndExercies = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data[dataKey].filter(
      (d) =>
        typeof d.avgDayEnergy === 'number' || typeof d.avgDayKcal === 'number',
    ) as unknown as ASC<AggregatedBody>;
  }, [dataKey, data]);

  // const severitiesAndPustules = useMemo(() => {
  //   if (!data) {
  //     return undefined;
  //   }
  //   return data[dataKey].filter(
  //     (d) =>
  //       typeof d.avgDaySkinSeverity === 'number' ||
  //       typeof d.avgDaySkinPustules === 'number',
  //   ) as unknown as ASC<AggregatedBody>;
  // }, [dataKey, data]);

  const rescuetimeHistory = useMemo(() => {
    if (!rescuetimeData) {
      return undefined;
    }
    return rescuetimeData[
      dataKey === 'weeks' ? 'weekly' : 'monthly'
    ] as ASC<AggregatedRescuetimeHistory>;
  }, [dataKey, rescuetimeData]);

  const rescuetimeLastRecord = useMemo(() => {
    if (!rescuetimeHistory) {
      return undefined;
    }

    return rescuetimeHistory
      .at(-1)
      ?.children.findLast((item): item is RescuetimeHistory => !!item);
  }, [rescuetimeHistory]);

  return (
    <Page
      layout="scrollable"
      className={styles.page}
      aria-label="Summary of life data: body metrics, calorie intake, calories burned, and RescueTime activity"
    >
      <SingleDateSelect
        aria-label="Choose the starting date for the charts"
        dates={chartStartDates}
        selectedDate={chartStartDate}
        onChange={setChartStartDate}
      />

      {kcals && (
        <figure aria-label="Calorie intake history">
          <Link to="./kcal">
            <figcaption>
              Kcal
              <sub>{kcals.at(-1)?.dayKcals.findLast((o) => !!o)?.date}</sub>
            </figcaption>
            <KcalChart
              data={kcals}
              className={styles.chart}
              start={chartStartDate.value}
            />
          </Link>
        </figure>
      )}

      {energiesAndExercies && (
        <figure aria-label="Calories burned and exercise times">
          <figcaption>
            Energy & Exercise
            <sub aria-label="The date of the last collected data">
              {
                getExist(
                  energiesAndExercies.at(-1),
                  'dayEnergies',
                  'dayExercises',
                )?.findLast((o) => !!o)?.date
              }
            </sub>
          </figcaption>
          <EnergyAndExerciseChart
            data={energiesAndExercies}
            className={styles.chart}
            start={chartStartDate.value}
          />
        </figure>
      )}

      {weightsAndWaist && (
        <figure aria-label="Body weight history and waist circumference history">
          <figcaption>
            Weight & Waist
            <sub aria-label="The date of the last collected data">
              {getExist(weightsAndWaist.at(-1), 'dayWeights', 'dayWaists')
                ?.findLast((o) => !!o)
                ?.date.slice(0, 10)}
            </sub>
          </figcaption>
          <WeightAndWaistChart
            data={weightsAndWaist}
            className={styles.chart}
            start={chartStartDate.value}
          />
        </figure>
      )}

      {data?.daySkins && (
        <figure aria-label="Skin severity and pustules history">
          <figcaption>
            Skin
            <sub aria-label="The date of the last collected data">
              {data.daySkins.at(-1)?.date}
            </sub>
          </figcaption>
          <SkinChart
            data={data.daySkins}
            className={styles.chart}
            start={chartStartDate.value}
          />
        </figure>
      )}

      {rescuetimeHistory && (
        <figure aria-label="RescueTime activity history">
          <figcaption>
            Rescue Time
            <sub aria-label="The date of the last collected data">
              {rescuetimeLastRecord?.date.slice(0, 10)}
            </sub>
          </figcaption>
          <RescuetimeSummaryChart
            data={rescuetimeHistory}
            queries={rescuetimeSummaryQuery}
            className={styles.chart}
            start={chartStartDate.value}
          />
        </figure>
      )}
    </Page>
  );
}

function getExist<T extends {}, K extends keyof T>(
  obj: T | undefined | null,
  ...keys: K[]
): T[K] | undefined {
  if (!obj) {
    return undefined;
  }
  const existKey = keys.find((k) => {
    const d = obj[k];
    if (Array.isArray(d)) {
      return d.length > 0;
    }
    return !!d;
  });
  return existKey ? obj[existKey] : undefined;
}
