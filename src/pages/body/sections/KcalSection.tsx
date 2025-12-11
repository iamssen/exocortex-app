import type {
  AggregatedBody,
  ASC,
  Body,
  VersionData,
} from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { KcalChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

export interface KcalSectionProps {
  dataKey: 'weeks' | 'months';
  chartStartDate: DateItem;
}

function selectData({ data }: VersionData<Body>, dataKey: 'weeks' | 'months') {
  const chartData = data[dataKey].filter(
    ({ avgDayKcal }) => typeof avgDayKcal === 'number',
  );

  return {
    chartData: chartData as unknown as ASC<AggregatedBody>,
  };
}

export function KcalSection({
  dataKey,
  chartStartDate,
}: KcalSectionProps): ReactNode {
  const {
    data: { chartData },
  } = useSuspenseQuery(
    api(
      'body',
      {},
      {
        select: (d) => selectData(d, dataKey),
      },
    ),
  );

  return (
    <figure aria-label="Calorie intake history">
      <Link to="./kcal">
        <figcaption>
          Kcal
          <sub>{chartData.at(-1)?.dayKcals.findLast((o) => !!o)?.date}</sub>
        </figcaption>
        <KcalChart data={chartData} start={chartStartDate.value} />
      </Link>
    </figure>
  );
}
