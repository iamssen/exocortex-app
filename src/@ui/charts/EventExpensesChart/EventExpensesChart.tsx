import type { ASC, MoneybookHistory } from '@iamssen/exocortex';
import { useFormat } from '@iamssen/format';
import useResizeObserver from '@ssen/use-resize-observer';
import type { HierarchyRectangularNode } from 'd3-hierarchy';
import { hierarchy, treemap, treemapBinary } from 'd3-hierarchy';
import type { ScaleOrdinal } from 'd3-scale';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { useId, useMemo } from 'react';

export interface EventExpensesChartProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  history: ASC<MoneybookHistory>;
  hideText?: boolean;
  colors: ScaleOrdinal<string, string>;
}

const TOP_PADDING = (d: HierarchyRectangularNode<Node>) =>
  d.depth > 0 ? 13 : 0;
const PADDING = (d: HierarchyRectangularNode<Node>) => (d.depth > 0 ? 3 : 0);

export function EventExpensesChart({
  history,
  hideText,
  colors,
  ...props
}: EventExpensesChartProps): ReactNode {
  // TODO change ResizeObserver react hook
  // @ts-ignore
  const { width = 600, height = 300, ref } = useResizeObserver();

  const total = useMemo(() => {
    return history.reduce((t, { amount }) => t + amount, 0);
  }, [history]);

  const nodes = useMemo(() => {
    const root: Node = { name: 'root', children: [] };

    let i: number = history.length;
    while (--i >= 0) {
      const { category, amount } = history[i];
      const _steps = category.split('/');
      const steps = _steps.length > 1 ? _steps : [_steps[0], _steps[0]];

      let selection: Node = root;

      let j: number = -1;
      const max: number = steps.length;
      while (++j < max) {
        const step = steps[j];

        if (!selection.children) {
          selection.children = [];
        }

        let child = selection.children.find((c) => c.name === step);
        if (!child) {
          child = { name: step, children: [] };
          selection.children.push(child);
        }
        selection = child;
      }

      selection.value = (selection?.value ?? 0) + amount;
    }

    return hierarchy(root).sum((d) => d?.value ?? 0);
  }, [history]);

  const tree = useMemo(() => {
    return treemap<Node>()
      .tile(treemapBinary)
      .size([width, height])
      .paddingTop(TOP_PADDING)
      .paddingLeft(PADDING)
      .paddingRight(PADDING)
      .paddingBottom(PADDING)
      .paddingInner(PADDING)
      .round(true);
  }, [height, width]);

  const blocks = useMemo(() => {
    return tree(nodes)
      .descendants()
      .filter(({ depth }) => depth > 0);
  }, [nodes, tree]);

  return (
    <div ref={ref} {...props}>
      <svg width={width} height={height}>
        {blocks.map((b, index) => (
          <Block
            key={index}
            b={b}
            colors={colors}
            total={total}
            hideText={hideText === true}
          />
        ))}
      </svg>
    </div>
  );
}

function Block({
  b,
  colors,
  total,
  hideText,
}: {
  b: HierarchyRectangularNode<Node>;
  colors: ScaleOrdinal<string, string>;
  total: number;
  hideText: boolean;
}) {
  const krw = useFormat('KRW');
  const percent = useFormat('PERCENT');

  const id = useId();

  if (b.depth > 1 && b.parent?.data.name === b.data.name) {
    return null;
  }

  return (
    <>
      <rect
        x={b.x0}
        y={b.y0}
        width={b.x1 - b.x0}
        height={b.y1 - b.y0}
        stroke={b.depth > 0 ? 'rgba(255, 255, 255, 0.3)' : undefined}
        fill={b.depth === 1 ? colors(b.data.name) : 'transparent'}
      />
      {!hideText && (
        <>
          <clipPath id={id}>
            <rect x={b.x0} y={b.y0} width={b.x1 - b.x0} height={b.y1 - b.y0} />
          </clipPath>
          {b.depth > 1 ? (
            <>
              <text
                x={b.x0 + (b.x1 - b.x0) / 2}
                y={b.y0 + (b.y1 - b.y0) / 2}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  opacity: 0.6,
                  clipPath: `url(#${id})`,
                }}
              >
                {b.data.name}
              </text>
              <text
                x={b.x0 + (b.x1 - b.x0) / 2}
                y={b.y0 + (b.y1 - b.y0) / 2 + 9}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  opacity: 0.6,
                  clipPath: `url(#${id})`,
                }}
              >
                {krw(b.value)}
              </text>
              <text
                x={b.x0 + (b.x1 - b.x0) / 2}
                y={b.y0 + (b.y1 - b.y0) / 2 + 18}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  opacity: 0.6,
                  clipPath: `url(#${id})`,
                }}
              >
                {b.value && percent((b.value / total) * 100)}
              </text>
            </>
          ) : (
            <text
              x={b.x0 + 2}
              y={b.y0 + 10}
              style={{
                fontSize: 10,
                opacity: 0.8,
                clipPath: `url(#${id})`,
              }}
            >
              {b.data.name} {krw(b.value)}{' '}
              {b.value && percent((b.value / total) * 100)}
            </text>
          )}
        </>
      )}
    </>
  );
}

type Node = { name: string; children?: Node[]; value?: number };
