import type { CurrencyType } from '@iamssen/format';
import { format } from '@iamssen/format';
import type {
  BarMarker,
  CartesianChartAxis,
  HorizontalBarMarkersData,
} from '@ui/cartesian-chart';
import styles from './styles.module.css';

export interface PositionBarData {
  markers: HorizontalBarMarkersData;

  axis: CartesianChartAxis;
}

export interface PositionBarParams {
  trade: number;
  current: number;

  targets: readonly number[];

  children: { label: string; diffRatio: number }[];

  currency: CurrencyType;
}

export function createPositionBarData({
  trade,
  current,
  targets: _targets,
  children: _children,
  currency,
}: PositionBarParams): PositionBarData {
  const targets: BarMarker[] = _targets.map((t) => {
    const amount = trade * (1 + t);
    const diff = amount - trade;
    const percent = format('PERCENT_SIGN')(t * 100);
    return {
      value: amount,
      label: percent,
      element: (
        <g className={styles.marker} data-marker="target">
          <line y1={-4} y2={5} />
          <text y={19}>{format(currency)(amount)}</text>
          <text y={30}>{format(currency)(diff)}</text>
          <text y={-10}>{percent}</text>
        </g>
      ),
    };
  });

  const min = targets[0].value;
  const max = targets.at(-1)?.value ?? min;

  const children =
    _children?.map(({ label, diffRatio }) => {
      const value = trade + trade * diffRatio;
      return {
        value,
        label,
        element: (
          <g
            className={styles.marker}
            data-marker="child"
            data-value={value}
            data-label={label}
            data-diff={diffRatio}
          >
            <circle r={3} />
          </g>
        ),
      } as BarMarker;
    }) ?? [];

  return {
    markers: {
      markers: [
        ...targets,
        ...children,
        {
          value: trade,
          label: format(currency)(trade),
          element: (
            <g className={styles.marker} data-marker="trade">
              <line y1={-4} y2={5} />
              <text y={19}>{format(currency)(trade)}</text>
              <text y={30}>$0</text>
              <text y={-10}>0%</text>
            </g>
          ),
        },
        {
          value: current,
          label: format(currency)(current),
          element: (
            <g className={styles.marker} data-marker="current">
              <circle r={3} />
              <text y={19}>{format(currency)(current)}</text>
              <text y={30}>{format(currency)(current - trade)}</text>
              <text y={-10}>
                {format('PERCENT_SIGN')((current / trade - 1) * 100)}
              </text>
            </g>
          ),
        },
      ],
    },
    axis: {
      x: {
        min: min * 0.99,
        max: max * 1.01,
      },
      y: {
        min: 0,
        max: 0,
      },
    },
  };
}
