import type { Iso8601 } from '@iamssen/exocortex';
import { useFormat } from '@iamssen/format';
import { scaleLinear, scaleTime } from 'd3-scale';
import type { CSSProperties, ReactElement, ReactNode, SVGProps } from 'react';
import { useMemo } from 'react';
import { useCartesianChart } from './CartesianChart.context.ts';
import type { CartesianChartAxis } from './CartesianChart.tsx';

export interface StackedHistoryBarValue {
  name: string;
  ratio: number;
  value: number;
  style: CSSProperties;
}

export interface StackedHistoryBarRecord {
  timestamps: [number, number];
  range: [Iso8601, Iso8601];
  value: number;
  values: StackedHistoryBarValue[];
}

export interface StackedHistoryBarData {
  formatString: string | undefined;
  formatReplacer?: string;
  records: StackedHistoryBarRecord[];
}

export interface StackedHistoryBarProps
  extends StackedHistoryBarData, SVGProps<SVGGElement> {
  axis: CartesianChartAxis;
  hideValues?: boolean;
}

export function StackedHistoryBar({
  formatString,
  formatReplacer = '',
  records,
  axis,
  style,
  hideValues = false,
  ...props
}: StackedHistoryBarProps): ReactNode {
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

  const elements = useMemo(() => {
    const rects: ReactElement[] = [];
    const texts: ReactElement[] = [];

    let i: number = records.length;
    while (--i >= 0) {
      const { timestamps, value, values } = records[i];

      const x1 = xScale(timestamps[0]);
      const x2 = xScale(timestamps[1]);
      const padding = (x2 - x1) * 0.12;

      const y = yScale(value);
      const totalHeight = height - y;

      let rectY = y;

      let j: number = -1;
      const max: number = values.length;
      while (++j < max) {
        const { name, ratio, style: rectStyle } = values[j];

        const h = totalHeight * ratio;

        if (!Number.isNaN(h)) {
          rects.push(
            <rect
              key={`${timestamps[0]}~${timestamps[1]}:${name}`}
              x={x1 + padding}
              y={rectY}
              width={x2 - x1 - padding * 2}
              height={h}
              style={rectStyle}
            />,
          );
        }

        rectY = rectY + h;
      }

      if (!hideValues) {
        const text = format(value);
        const textProps: SVGProps<SVGTextElement> = {
          x: x1 + (x2 - x1) / 2,
          y: y - 5,
          children: text,
        };

        texts.push(
          <text
            key={`${timestamps[0]}~${timestamps[1]}:text-border`}
            {...textProps}
            data-format={formatString}
            data-display="border"
          />,
          <text
            key={`${timestamps[0]}~${timestamps[1]}:text`}
            {...textProps}
            data-format={formatString}
          />,
        );
      }
    }

    return [...rects, ...texts];
  }, [format, formatString, height, hideValues, records, xScale, yScale]);

  return (
    <g {...props} style={{ ...style, transform: 'translate(10px, 10px)' }}>
      {elements}
    </g>
  );
}
