import type {
  AggregatedRescuetimeHistory,
  ASC,
  Rescuetime,
  RescuetimeHistory,
} from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { RescuetimeSummaryChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import styles from '../BodySummaryPage.module.css';
import { rescuetimeSummaryQuery } from '../env.ts';

export interface RescuetimeSectionProps {
  dataKey: 'weeks' | 'months';
  chartStartDate: DateItem;
}

function selectData(
  { data }: { data: Rescuetime },
  dataKey: 'weeks' | 'months',
) {
  const history = data[
    dataKey === 'weeks' ? 'weekly' : 'monthly'
  ] as ASC<AggregatedRescuetimeHistory>;

  const lastRecord = history
    .at(-1)
    ?.children.findLast((item): item is RescuetimeHistory => !!item);

  return {
    history,
    lastRecord,
  };
}

export function RescuetimeSection({
  dataKey,
  chartStartDate,
}: RescuetimeSectionProps): ReactNode {
  const {
    data: { history, lastRecord },
  } = useSuspenseQuery(
    api(
      'rescuetime',
      {},
      {
        select: (d) => selectData(d, dataKey),
      },
    ),
  );

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <figure aria-label="RescueTime activity history">
      <figcaption>
        Rescue Time
        <sub aria-label="The date of the last collected data">
          {lastRecord?.date.slice(0, 10)}
        </sub>
      </figcaption>
      <RescuetimeSummaryChart
        data={history}
        queries={rescuetimeSummaryQuery}
        className={styles.chart}
        start={chartStartDate.value}
      />
    </figure>
  );
}
