import type { JoinedHolding, PortfolioMarket } from '@iamssen/exocortex';
import type { CurrencyType } from '@iamssen/format';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import type { DataGridHandle, DataGridProps } from 'react-data-grid';
import { DataGrid } from 'react-data-grid';
import styles from '../styles.module.css';
import { createColumns } from './columns.tsx';
import { filterColumns } from './filterColumns.ts';
import type { Perspectives } from './perspectives.tsx';
import { createPerspectives } from './perspectives.tsx';

export interface HoldingsGridViewConfig {
  includeNonHoldings: boolean;
  expandDetails: boolean;
}

export interface HoldingsGridProps
  extends
    HoldingsGridViewConfig,
    Omit<DataGridProps<JoinedHolding>, 'columns' | 'rowClass' | 'rowHeight'> {
  currency: CurrencyType;
  portfolio: PortfolioMarket;
  printDisplayName?: boolean;
  perspective: keyof Perspectives;
}

export type HoldingsGridPerspectives = keyof Perspectives;

export function HoldingsGrid({
  currency,
  portfolio,
  printDisplayName,
  perspective,
  includeNonHoldings,
  expandDetails,
  className,
  rows,
  ...props
}: HoldingsGridProps): ReactNode {
  const dataGrid = useRef<DataGridHandle | null>(null);

  const columns = useMemo(() => {
    return createColumns({
      portfolio,
      currency,
      printDisplayName,
      expandDetails,
    });
  }, [currency, expandDetails, portfolio, printDisplayName]);

  const perspectives = useMemo(() => {
    return createPerspectives(columns);
  }, [columns]);

  const selectedPerspective = useMemo(() => {
    return perspectives[perspective];
  }, [perspective, perspectives]);

  const printColumns = useMemo(() => {
    return filterColumns(selectedPerspective.columns, portfolio);
  }, [portfolio, selectedPerspective.columns]);

  const sortedRows = useMemo<JoinedHolding[]>(() => {
    return rows
      .filter(({ holding }) => includeNonHoldings || holding.shares > 0)
      .toSorted(selectedPerspective.sort);
  }, [includeNonHoldings, rows, selectedPerspective.sort]);

  useEffect(() => {
    dataGrid.current?.scrollToCell({ idx: 0 });
    //dataGrid.current?.scrollToColumn(0);
  }, [perspective]);

  return (
    <DataGrid
      ref={dataGrid}
      {...props}
      className={`${styles.gridStyle} ${className}`}
      columns={printColumns}
      rowClass={selectedPerspective.rowClass}
      rows={sortedRows}
      rowHeight={25}
    />
  );
}
