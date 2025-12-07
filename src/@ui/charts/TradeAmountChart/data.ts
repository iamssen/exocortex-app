import type {
  AggregatedTrade,
  Iso8601,
  QuoteHistory,
  QuoteRecord,
} from '@iamssen/exocortex';
import { findStartIndex } from '@iamssen/exocortex/date-utils';
import type { CurrencyType } from '@iamssen/format';
import type {
  CartesianChartAxis,
  HistoryLineData,
  HistoryLineRecord,
} from '@ui/cartesian-chart';
import { DateTime } from 'luxon';
import { chartAxis } from '../env.ts';
import type { BarData, BarRecord } from './Bar.tsx';

export interface TradeAmountChartData {
  history: BarData;
  benchmarkHistory: HistoryLineData | undefined;

  axis: CartesianChartAxis;
  benchmarkAxis: CartesianChartAxis;
}

export interface TradeAmountChartParams {
  trades: AggregatedTrade[];
  benchmarkHistory: QuoteHistory | undefined;

  currency: CurrencyType;

  start?: Iso8601;
  end?: Iso8601;
}

export function createTradeAmountChartData({
  trades: _trades,
  benchmarkHistory,
  start: _start,
  end,
  currency,
}: TradeAmountChartParams): TradeAmountChartData {
  const trades = _start ? _trades.slice(findStart(_trades, _start)) : _trades;
  const start = _start ?? trades[0].range[0];

  const historyRecords = trades.map<BarRecord>(
    ({ range, totalBuy, totalSell, totalGain }) => {
      return {
        range,
        timestamps: [
          new Date(range[0]).getTime(),
          new Date(range[1]).getTime(),
        ],
        values: [totalBuy, totalSell],
        labelValue: totalGain,
      };
    },
  );

  const benchmarkHistoryRecords = benchmarkHistory
    ? benchmarkHistory.records
        .slice(findBenchmarkStart(benchmarkHistory.records, start))
        .map<HistoryLineRecord>(({ date, high, low, close }) => {
          return {
            date,
            timestamp: new Date(date).getTime(),
            low,
            high,
            value: close,
          };
        })
    : undefined;

  const values = trades.flatMap(({ totalBuy, totalSell }) => [
    totalBuy,
    totalSell,
  ]);

  const xmin = new Date(start).getTime();
  const xmax = end
    ? new Date(end).getTime()
    : Math.min(
        DateTime.now().endOf('year').toMillis(),
        DateTime.now().plus({ month: 1 }).toMillis(),
      );
  const ymin = 0;
  const ymax = Math.max(...values);
  const benchmarkYmin = benchmarkHistoryRecords
    ? Math.min(...benchmarkHistoryRecords.map(({ low, value }) => low ?? value))
    : 0;
  const benchmarkYmax = benchmarkHistoryRecords
    ? Math.max(
        ...benchmarkHistoryRecords.map(({ high, value }) => high ?? value),
      )
    : 0;

  return {
    history: {
      formatString: currency,
      records: historyRecords,
    },
    benchmarkHistory: benchmarkHistoryRecords
      ? {
          formatString: undefined,
          records: [benchmarkHistoryRecords],
        }
      : undefined,
    axis: {
      x: {
        min: xmin,
        max: xmax,
      },
      y: {
        min: ymin * chartAxis.YMIN,
        max: ymax * (chartAxis.YMAX * 1.3),
      },
    },
    benchmarkAxis: {
      x: {
        min: xmin,
        max: xmax,
      },
      y: {
        min: benchmarkYmin * chartAxis.YMIN,
        max: benchmarkYmax * (chartAxis.YMAX * 1.1),
      },
    },
  };
}

const findStart = findStartIndex<AggregatedTrade>(({ range }) =>
  DateTime.fromISO(range[0]),
);

const findBenchmarkStart = findStartIndex<QuoteRecord>(({ date }) =>
  DateTime.fromISO(date),
);
