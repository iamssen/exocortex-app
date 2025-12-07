import type { JoinedTrade, PortfolioMarket } from '@iamssen/exocortex';
import type { CurrencyType } from '@iamssen/format';
import { type ReactNode, useMemo } from 'react';
import type { Column, DataGridProps } from 'react-data-grid';
import { DataGrid } from 'react-data-grid';
import styles from '../styles.module.css';
import type { Columns } from './columns.tsx';
import { createColumns } from './columns.tsx';
import { rowClass } from './rowClass.ts';

export interface TradesGridProps extends Omit<
  DataGridProps<JoinedTrade>,
  'columns' | 'rowClass' | 'rowHeight'
> {
  currency: CurrencyType;
  portfolio: PortfolioMarket;
  printDisplayName?: boolean;
  excludeColumns?: Set<keyof Columns>;
}

export type TradesGridColumns = Columns;

const columnNames = [
  'date',
  'symbol',
  'price',
  'quantity',
  'totalAmount',
  'currentPrice',
  'gain',
  'comment',
] as (keyof Columns)[];

export function TradesGrid({
  currency,
  portfolio,
  printDisplayName,
  className,
  excludeColumns,
  ...props
}: TradesGridProps): ReactNode {
  const columns = useMemo(() => {
    return createColumns({
      portfolio,
      currency,
      printDisplayName,
    });
  }, [currency, portfolio, printDisplayName]);

  const printColumns = useMemo(() => {
    const filteredColumnNames = excludeColumns
      ? columnNames.filter((columnName) => !excludeColumns.has(columnName))
      : columnNames;

    return filteredColumnNames.map(
      (columnName) => columns[columnName],
    ) as Column<JoinedTrade>[];
  }, [columns, excludeColumns]);

  return (
    <DataGrid
      {...props}
      className={`${styles.gridStyle} ${className}`}
      columns={printColumns}
      rowClass={rowClass}
      rowHeight={25}
    />
  );
}
