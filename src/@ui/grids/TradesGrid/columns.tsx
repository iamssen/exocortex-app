import type { JoinedTrade, PortfolioMarket } from '@iamssen/exocortex';
import type { CurrencyType } from '@iamssen/format';
import { Format } from '@iamssen/format';
import type { Column } from 'react-data-grid';
import { Link } from 'react-router';
import styles from '../styles.module.css';

interface ColumnOptions {
  portfolio: PortfolioMarket;
  currency: CurrencyType;
  printDisplayName?: boolean;
}

export interface Columns {
  date: Column<JoinedTrade>;
  symbol: Column<JoinedTrade>;
  price: Column<JoinedTrade>;
  quantity: Column<JoinedTrade>;
  totalAmount: Column<JoinedTrade>;
  currentPrice: Column<JoinedTrade>;
  gain: Column<JoinedTrade>;
  comment: Column<JoinedTrade>;
}

export function createColumns({
  portfolio,
  currency,
  printDisplayName = false,
}: ColumnOptions): Columns {
  const date: Column<JoinedTrade> = {
    key: 'date',
    name: 'Date',
    frozen: true,
    minWidth: 100,
    renderCell: ({ row: { isFirstAppearedDate, trade } }) => (
      <time
        dateTime={trade.date}
        style={{ opacity: !isFirstAppearedDate ? 0.2 : undefined }}
      >
        {trade.date}
      </time>
    ),
  };

  const symbol: Column<JoinedTrade> = {
    key: 'symbol',
    name: 'Symbol',
    frozen: true,
    minWidth: portfolio === 'kr' ? 130 : 90,
    maxWidth: portfolio === 'kr' ? 190 : 120,
    renderCell: ({ row: { trade, quote } }) => (
      <Link
        to={`/quote/${trade.symbol}`}
        style={{
          fontSize: portfolio === 'kr' ? '0.8em' : undefined,
          letterSpacing: portfolio === 'kr' ? '-0.1em' : undefined,
        }}
      >
        {printDisplayName ? (quote?.displayName ?? trade.symbol) : trade.symbol}
      </Link>
    ),
  };

  const price: Column<JoinedTrade> = {
    key: 'price',
    name: 'Price',
    minWidth: 100,
    renderCell: ({ row: { trade } }) => (
      <div className={styles.gridCellRightAlign}>
        <Format format={currency} n={trade.price} />
      </div>
    ),
  };

  const quantity: Column<JoinedTrade> = {
    key: 'quantity',
    name: 'Quantity',
    minWidth: 70,
    renderCell: ({ row: { trade } }) => (
      <div className={styles.gridCellRightAlign}>
        <Format n={trade.quantity} />
      </div>
    ),
  };

  const totalAmount: Column<JoinedTrade> = {
    key: 'totalAmount',
    name: 'Total Amount',
    minWidth: 120,
    renderCell: ({ row: { trade } }) => (
      <div className={styles.gridCellRightAlign}>
        <Format format={currency} n={trade.price * trade.quantity} />
      </div>
    ),
  };

  const currentPrice: Column<JoinedTrade> = {
    key: 'currentPrice',
    name: 'Current Price',
    minWidth: 140,
    renderCell: ({ row: { trade, quote } }) => {
      if (!quote) {
        return null;
      }

      return (
        <div className={styles.gridCellSpaceBetween}>
          {trade.price > 0 ? (
            <sub>
              (
              <Format
                format="PERCENT"
                n={((quote.price - trade.price) / trade.price) * 100}
              />
              )
            </sub>
          ) : (
            <sub />
          )}
          <Format format={currency} n={quote.price} />
        </div>
      );
    },
  };

  const gain: Column<JoinedTrade> = {
    key: 'gain',
    name: 'Gain',
    minWidth: 120,
    renderCell: ({ row: { trade, quote } }) => {
      if (!quote) {
        return null;
      }

      return (
        <div className={styles.gridCellRightAlign}>
          <Format
            format={currency}
            n={(quote.price - trade.price) * trade.quantity}
          />
        </div>
      );
    },
  };

  const comment: Column<JoinedTrade> = {
    key: 'comment',
    name: 'Comment',
    renderCell: ({ row: { trade } }) => {
      return <div>{trade.comment}</div>;
    },
  };

  return {
    date,
    symbol,
    price,
    quantity,
    totalAmount,
    currentPrice,
    gain,
    comment,
  };
}
