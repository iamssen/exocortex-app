import type { Body } from '@iamssen/exocortex';
import { useQuery } from '@tanstack/react-query';
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
import { EnergiesAndExercisesSection } from './sections/EnergiesAndExercisesSection.tsx';
import { KcalSection } from './sections/KcalSection.tsx';
import { RescuetimeSection } from './sections/RescuetimeSection.tsx';
import { SkinSection } from './sections/SkinSection.tsx';
import { WeightAndWaistSection } from './sections/WeightAndWaistSection.tsx';

export function BodySummaryPage(): ReactNode {
  const { data } = useQuery(api('body'));

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
        <EnergiesAndExercisesSection
          dataKey={dataKey}
          chartStartDate={chartStartDate}
        />
      </Suspense>

      <Suspense>
        <WeightAndWaistSection
          dataKey={dataKey}
          chartStartDate={chartStartDate}
        />
      </Suspense>

      <Suspense>
        <SkinSection chartStartDate={chartStartDate} />
      </Suspense>

      <Suspense>
        <RescuetimeSection dataKey={dataKey} chartStartDate={chartStartDate} />
      </Suspense>
    </Page>
  );
}
