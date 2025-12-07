import type { DV, ExpiryData, Iso8601 } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { type PriceLineData } from '@ui/cartesian-chart';
import { BenchmarkChart } from '@ui/charts';
import { api } from '@ui/query';
import { DateTime } from 'luxon';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { MatchSymbol } from './helpers/MatchSymbol.tsx';
import { useSectionAttributes } from './helpers/useSectionAttributes.ts';
import styles from './styles.module.css';

export interface BenchmarkSectionProps {
  benchmark:
    | 'finance/shiller-pe'
    | 'finance/sp500-pe'
    | 'finance/sp500-earnings'
    | `finance/fred/${string}`;
  formatString?: string;
  watches?: PriceLineData[];
  start: Iso8601;
  end?: Iso8601;
  children: ReactNode;
  durationInDays?: number;
}

export function BenchmarkSection({
  benchmark,
  watches = [],
  formatString,
  start,
  end,
  children,
  durationInDays,
}: BenchmarkSectionProps): ReactNode {
  const { data } = useQuery<ExpiryData<DV<number>[]>>(api(benchmark));

  if (!data) {
    return null;
  }

  const chartData = data.data as DV<number>[];
  const lastRecord = chartData.at(-1);

  return (
    <Component
      watches={watches}
      chartData={chartData}
      lastRecord={lastRecord}
      start={start}
      end={end}
      children={children}
      formatString={formatString}
      durationInDays={durationInDays}
    />
  );
}

function Component({
  watches,
  chartData,
  lastRecord,
  formatString,
  children,
  start,
  end,
  durationInDays,
}: {
  watches: PriceLineData[];
  chartData: DV<number>[];
  lastRecord: DV<number> | undefined;
} & Omit<BenchmarkSectionProps, 'benchmark' | 'watches'>) {
  const matches = useMemo(() => {
    if (watches.length > 0 && lastRecord) {
      return {
        high:
          watches.some(
            ({ price, watchFor }) =>
              watchFor === 'high' && lastRecord.value > price,
          ) || undefined,
        low:
          watches.some(
            ({ price, watchFor }) =>
              watchFor === 'low' && lastRecord.value < price,
          ) || undefined,
      };
    }

    return {
      high: undefined,
      low: undefined,
    };
  }, [lastRecord, watches]);

  const attributes = useSectionAttributes(
    matches,
    lastRecord?.date,
    durationInDays,
  );

  return (
    <figure className={styles.figure}>
      <BenchmarkChart
        formatString={formatString}
        data={chartData}
        watches={watches}
        start={start}
        end={end}
      />
      <figcaption {...attributes}>
        <h3>
          {children}
          <MatchSymbol {...matches} />
        </h3>
        {lastRecord && (
          <span>
            <Format format={formatString} n={lastRecord.value} />{' '}
            <sub>
              (
              {typeof durationInDays === 'number'
                ? DateTime.fromISO(lastRecord.date)
                    .plus({ days: durationInDays })
                    .toISODate() +
                  ' -' +
                  durationInDays
                : lastRecord.date}
              )
            </sub>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
