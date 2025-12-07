import type { Iso8601 } from '@iamssen/exocortex';
import { useFormat } from '@iamssen/format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import type { ReactNode, SVGProps } from 'react';
import { useMemo } from 'react';
import { useCartesianChart } from './CartesianChart.context.ts';
import type { CartesianChartAxis } from './CartesianChart.tsx';
import { getHistoryLineLastRecord } from './getHistoryLineLastRecord.ts';

export interface HistoryLineRecord {
  timestamp: number;
  date: Iso8601;
  value: number;
  high?: number;
  low?: number;
}

export interface HistoryLineData {
  formatString: string | undefined;
  formatReplacer?: string;
  records: HistoryLineRecord[][];
}

export interface HistoryLineProps
  extends HistoryLineData, SVGProps<SVGGElement> {
  axis: CartesianChartAxis;
  hideHighAndLow?: boolean;
  hideLast?: boolean;
}

const ARROW_LEFT_MARGIN = -4;

export function HistoryLine({
  formatString,
  formatReplacer = '',
  records,
  axis,
  style,
  hideHighAndLow = false,
  hideLast = false,
  ...props
}: HistoryLineProps): ReactNode {
  const format = useFormat(formatString, formatReplacer);

  const { width, height } = useCartesianChart();

  const xScale = useMemo(
    () => scaleTime().range([0, width]).domain([axis.x.min, axis.x.max]),
    [axis.x.max, axis.x.min, width],
  );

  const yScale = useMemo(
    () => scaleLinear().range([height, 0]).domain([axis.y.min, axis.y.max]),
    [axis.y.max, axis.y.min, height],
  );

  const paths = useMemo(() => {
    const fn = line<HistoryLineRecord>(
      ({ timestamp }) => xScale(timestamp),
      ({ value }) => yScale(value),
    );

    return records.map((r) => fn(r));
  }, [records, xScale, yScale]);

  const textElements = useMemo(() => {
    if (hideHighAndLow) {
      return null;
    }

    const sorted = records
      .flat()
      .toSorted((a, b) => (a.low ?? a.value) - (b.low ?? b.value));

    const low = sorted[0];
    const high = sorted.at(-1);

    if (!high) {
      throw new Error('high must not be undefined');
    }

    const lowPrice = low.low ?? low.value;
    const highPrice = high.high ?? high.value;

    const lowProps: SVGProps<SVGTextElement> = {
      x: xScale(low.timestamp) + ARROW_LEFT_MARGIN,
      y: clamp(20, yScale(lowPrice) + 5, height),
      children: '▼ ' + format(lowPrice),
    };

    const highProps: SVGProps<SVGTextElement> = {
      x: xScale(high.timestamp) + ARROW_LEFT_MARGIN,
      y: clamp(20, yScale(highPrice) - 2, height),
      children: '▲ ' + format(highPrice),
    };

    return (
      <>
        <text {...lowProps} data-id="low" data-display="border" />
        <text {...lowProps} data-id="low" />
        <text {...highProps} data-id="high" data-display="border" />
        <text {...highProps} data-id="high" />
      </>
    );
  }, [hideHighAndLow, records, xScale, yScale, height, format]);

  const last = useMemo(() => {
    if (hideLast) {
      return null;
    }

    const lastRecord = getHistoryLineLastRecord(records);
    const x = xScale(lastRecord.timestamp);
    const y = yScale(lastRecord.value);

    return <circle cx={x} cy={y} r={3} />;
  }, [hideLast, records, xScale, yScale]);

  return (
    <g {...props} style={{ ...style, transform: 'translate(10px, 10px)' }}>
      {paths
        ?.filter((d): d is string => !!d)
        .map((d, i) => (
          <path key={`path-${i}`} d={d} />
        ))}
      {textElements}
      {last}
    </g>
  );
}

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
