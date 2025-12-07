import type { Iso8601 } from '@iamssen/exocortex';
import { useFormat } from '@iamssen/format';
import type { CartesianChartAxis } from '@ui/cartesian-chart';
import { useCartesianChart } from '@ui/cartesian-chart';
import { scaleLinear, scaleTime } from 'd3-scale';
import type { ReactNode, SVGProps, SVGTextElementAttributes } from 'react';
import { Fragment, useMemo } from 'react';

export interface BarRecord {
  timestamps: [number, number];
  range: [Iso8601, Iso8601];
  values: number[];
  labelValue: number;
}

export interface BarData {
  formatString: string | undefined;
  formatReplacer?: string;
  records: BarRecord[];
}

export interface BarProps extends BarData, SVGProps<SVGGElement> {
  axis: CartesianChartAxis;
}

export function Bar({
  formatString,
  formatReplacer = '',
  records,
  axis,
  style,
  ...props
}: BarProps): ReactNode {
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

  const rects = useMemo(() => {
    return records.map(({ timestamps, values, labelValue }) => {
      const x1 = xScale(timestamps[0]);
      const x2 = xScale(timestamps[1]);
      const padding = (x2 - x1) * 0.12;
      const barsWidth = x2 - x1 - padding * 2;
      const gap = barsWidth * 0.1;
      const barWidth = (barsWidth - gap * (values.length - 1)) / values.length;

      return (
        <g
          key={`${timestamps[0]}~${timestamps[1]}`}
          transform={`translate(${x1 + padding} 0)`}
        >
          {values.map((value, i) => {
            if (value === 0) {
              return null;
            }

            const x = (barWidth + gap) * i;
            const y = yScale(value);

            const textProps: SVGTextElementAttributes<SVGTextElement> = {
              x: x + barWidth / 2,
              y: y - 7,
              children: format(value),
            };

            return (
              <Fragment key={`${timestamps[0]}~${timestamps[1]}:${i}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height - y}
                  data-column={i}
                />
                <text
                  {...textProps}
                  data-format={formatString}
                  data-display="border"
                />
                <text
                  {...textProps}
                  data-format={formatString}
                  data-column={i}
                />
              </Fragment>
            );
          })}
          <text
            x={barsWidth / 2}
            y={30}
            data-format={formatString}
            data-negative={labelValue < 0}
          >
            {width > 500 ? format(labelValue) : labelValue > 0 ? '▲' : '▼'}
          </text>
        </g>
      );
    });
  }, [format, formatString, height, records, width, xScale, yScale]);

  return (
    <g {...props} style={{ ...style, transform: 'translate(10px, 10px)' }}>
      {...rects}
    </g>
  );
}
