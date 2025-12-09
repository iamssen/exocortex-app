import useResizeObserver from '@iamssen/exocortex-appkit/use-resize-observer';
import type {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { CartesianChartContext } from './CartesianChart.context.ts';

export interface CartesianChartProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function CartesianChart({
  className,
  style,
  children,
  ...props
}: CartesianChartProps): ReactNode {
  // TODO change ResizeObserver react hook
  // @ts-ignore
  const { width = 600, height = 300, ref } = useResizeObserver();

  return (
    <CartesianChartContext.Provider value={{ width, height }}>
      <div
        ref={ref}
        className={className}
        style={{ position: 'relative', ...style }}
        {...props}
      >
        <svg
          width={width + 20}
          height={height + 20}
          style={{ position: 'absolute', margin: 0, left: -10, top: -10 }}
        >
          {children}
        </svg>
      </div>
    </CartesianChartContext.Provider>
  );
}

export interface CartesianChartAxis {
  x: {
    min: number;
    max: number;
  };
  y: {
    min: number;
    max: number;
  };
}
