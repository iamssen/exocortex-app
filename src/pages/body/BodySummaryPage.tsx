import type {
  AggregatedBody,
  AggregatedRescuetimeHistory,
  ASC,
  Body,
  RescuetimeHistory,
} from '@iamssen/exocortex';
import { useQuery } from '@tanstack/react-query';
import {
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
import { Suspense, useMemo, type ReactNode } from 'react';
import { bodyChartStartDurations } from '../../env.ts';
import { Page } from '../../Page.tsx';
import styles from './BodySummaryPage.module.css';
import { rescuetimeSummaryQuery } from './env.ts';
import { EnergiesAndExerciesSection } from './sections/EnergiesAndExerciesSection.tsx';
import { getExist } from './sections/getExist.ts';
import { KcalSection } from './sections/KcalSection.tsx';

export function BodySummaryPage(): ReactNode {
  const { data } = useQuery(api('body'));
  const { data: rescuetimeData } = useQuery(api('rescuetime'));

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

  const weightsAndWaist = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data[dataKey].filter(
      (d) =>
        typeof d.avgDayWeight === 'number' || typeof d.avgDayWaist === 'number',
    ) as unknown as ASC<AggregatedBody>;
  }, [dataKey, data]);

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

      <Suspense>
        <KcalSection dataKey={dataKey} chartStartDate={chartStartDate} />
      </Suspense>

      <Suspense>
        <EnergiesAndExerciesSection
          dataKey={dataKey}
          chartStartDate={chartStartDate}
        />
      </Suspense>

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
