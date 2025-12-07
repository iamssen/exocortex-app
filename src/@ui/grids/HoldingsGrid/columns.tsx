import type { JoinedHolding, PortfolioMarket } from '@iamssen/exocortex';
import type { CurrencyType } from '@iamssen/format';
import { Evaluate, Format } from '@iamssen/format';
import { MarketStateSymbol } from '@ui/components';
import type { CSSProperties } from 'react';
import type { Column } from 'react-data-grid';
import { Link } from 'react-router';
import styles from '../styles.module.css';

interface ColumnOptions {
  portfolio: PortfolioMarket;
  currency: CurrencyType;
  printDisplayName?: boolean;
  expandDetails: boolean;
}

export interface Columns {
  symbol: Column<JoinedHolding>;
  avgCostPerShare: Column<JoinedHolding>;
  price: Column<JoinedHolding>;
  change: Column<JoinedHolding>;
  daysGain: Column<JoinedHolding>;
  sharesGain: Column<JoinedHolding>;
  realizedGain: Column<JoinedHolding>;
  totalGain: Column<JoinedHolding>;
  marketValue: Column<JoinedHolding>;
  shares: Column<JoinedHolding>;
  per: Column<JoinedHolding>;
  pbr: Column<JoinedHolding>;
  fiftyTwoWeek: Column<JoinedHolding>;
  buy: Column<JoinedHolding>;
  sell: Column<JoinedHolding>;
  roa: Column<JoinedHolding>;
  roe: Column<JoinedHolding>;
  beta: Column<JoinedHolding>;
}

export function createColumns({
  portfolio,
  currency,
  printDisplayName = false,
  expandDetails,
}: ColumnOptions): Columns {
  const symbol: Column<JoinedHolding> = {
    key: 'symbol',
    name: 'Symbol',
    frozen: true,
    width: '20%',
    minWidth: portfolio === 'kr' ? 130 : 90,
    maxWidth: portfolio === 'kr' ? 190 : 120,
    renderCell: ({ row: { holding, quote } }) => (
      <Link
        to={`/quote/${holding.symbol}`}
        style={{
          fontSize: portfolio === 'kr' ? '0.8em' : undefined,
          letterSpacing: portfolio === 'kr' ? '-0.1em' : undefined,
        }}
      >
        {printDisplayName
          ? (quote?.displayName ?? holding.symbol)
          : holding.symbol}
      </Link>
    ),
  };

  const avgCostPerShare: Column<JoinedHolding> = {
    key: 'avgCost',
    name: 'Avg Cost',
    minWidth: 80,
    renderCell: ({ row: { holding } }) => (
      <div className={styles.gridCellRightAlign}>
        {holding.shares > 0 ? (
          <Format format={currency} n={holding.avgCostPerShare} />
        ) : (
          '-'
        )}
      </div>
    ),
  };

  const price: Column<JoinedHolding> = {
    key: 'price',
    name: 'Price',
    minWidth: 90,
    renderCell: ({ row: { quote } }) => (
      <div className={styles.gridCellSpaceBetween}>
        <MarketStateSymbol marketState={quote?.marketState} />
        <Format format={currency} n={quote?.price} />
      </div>
    ),
  };

  const change: Column<JoinedHolding> = {
    key: 'change',
    name: 'Change',
    minWidth: 120,
    renderCell: ({ row: { quote } }) => (
      <div className={styles.gridCellSpaceBetween}>
        <sub>
          (<Format format="PERCENT" n={quote?.changePercent} />)
        </sub>
        <Format format={currency} n={quote?.change} />
      </div>
    ),
  };

  const daysGain: Column<JoinedHolding> = {
    key: 'daysGain',
    name: `Day's Gain`,
    minWidth: 80,
    renderCell: ({ row: { gain, holding } }) => (
      <div className={styles.gridCellRightAlign}>
        {holding.shares > 0 ? (
          <Format format={currency} n={gain?.daysGain} />
        ) : (
          '-'
        )}
      </div>
    ),
  };

  const sharesGain: Column<JoinedHolding> = {
    key: 'sharesGain',
    name: 'Shares Gain',
    minWidth: 140,
    renderCell: ({ row: { gain, holding, quote } }) =>
      holding.shares > 0 ? (
        <div className={styles.gridCellSpaceBetween}>
          <sub>
            {quote && (
              <>
                (
                <Format
                  format="PERCENT"
                  n={
                    ((quote.price - holding.avgCostPerShare) /
                      holding.avgCostPerShare) *
                    100
                  }
                />
                )
              </>
            )}
          </sub>
          <Format format={currency} n={gain?.sharesGain} />
        </div>
      ) : (
        <div className={styles.gridCellRightAlign}>-</div>
      ),
  };

  const realizedGain: Column<JoinedHolding> = {
    key: 'realizedGain',
    name: 'Realized Gain',
    minWidth: 90,
    renderCell: ({ row: { holding } }) => (
      <div className={styles.gridCellRightAlign}>
        <Format format={currency} n={holding.realizedGain} />
      </div>
    ),
  };

  const totalGain: Column<JoinedHolding> = {
    key: 'totalGain',
    name: 'Total Gain',
    minWidth: 140,
    renderCell: ({ row: { gain, holding } }) =>
      holding.shares > 0 ? (
        <div className={styles.gridCellSpaceBetween}>
          <sub>
            {gain && (
              <>
                (<Format format="PERCENT" n={gain.totalGainPercent} />)
              </>
            )}
          </sub>
          <Format format={currency} n={gain?.totalGain} />
        </div>
      ) : (
        <div className={styles.gridCellRightAlign}>-</div>
      ),
  };

  const marketValue: Column<JoinedHolding> = {
    key: 'marketValue',
    name: 'Market Value',
    minWidth: 150,
    renderCell: ({ row: { gain, holding } }) => (
      <div className={styles.gridCellSpaceBetween}>
        <sub>
          (
          <Evaluate
            format="PERCENT"
            expr="marketValue / totalMarketValue * 100"
            value={{ marketValue: gain.marketValue }}
          />
          )
        </sub>
        {holding.shares > 0 ? (
          <Format format={currency} n={gain.marketValue} />
        ) : (
          <span>-</span>
        )}
      </div>
    ),
  };

  const shares: Column<JoinedHolding> = {
    key: 'shares',
    name: 'Shares',
    minWidth: 70,
    renderCell: ({ row: { holding } }) => (
      <div className={styles.gridCellRightAlign}>
        {holding.shares > 0 ? <Format n={holding.shares} /> : '-'}
      </div>
    ),
  };

  const per: Column<JoinedHolding> = {
    key: 'per',
    name: 'P/E',
    minWidth: 100,
    renderCell: ({ row: { statistic } }) => (
      <div className={styles.gridCellSpaceBetween}>
        {statistic?.type === 'EQUITY' && (
          <>
            <span>
              <Format n={statistic.trailingPE} />
            </span>
            {statistic.forwardPE && (
              <>
                <sub>
                  → <Format n={statistic.forwardPE} />
                </sub>
              </>
            )}
          </>
        )}
      </div>
    ),
  };

  const pbr: Column<JoinedHolding> = {
    key: 'pbr',
    name: 'P/B',
    minWidth: 60,
    renderCell: ({ row: { statistic } }) => (
      <div className={styles.gridCellRightAlign}>
        {statistic?.type === 'EQUITY' && <Format n={statistic?.priceToBook} />}
      </div>
    ),
  };

  const fiftyTwoWeek: Column<JoinedHolding> = {
    key: 'fiftyTwoWeek',
    name: '52 Week',
    minWidth: 130,
    renderCell: ({ row: { statistic } }) => {
      if (!statistic?.fiftyTwoWeekRange) {
        return null;
      }

      let low: CSSProperties | undefined = undefined;
      let high: CSSProperties | undefined = undefined;

      const position = statistic.fiftyTwoWeekPosition ?? 0;
      if (position > 0.8) {
        low = { opacity: 0.3 };
        high = { fontWeight: 'bold', color: 'var(--negative)' };
      } else if (position < 0.2) {
        low = { fontWeight: 'bold', color: 'var(--positive)' };
        high = { opacity: 0.3 };
      } else if (position > 0.5) {
        low = { opacity: 0.5 };
      } else if (position < 0.5) {
        high = { opacity: 0.5 };
      }

      return (
        <div className={styles.gridCellSpaceBetween}>
          <Format
            format={currency}
            n={statistic.fiftyTwoWeekRange.low}
            style={low}
          />
          {' - '}
          <Format
            format={currency}
            n={statistic.fiftyTwoWeekRange.high}
            style={high}
          />
        </div>
      );
    },
  };

  const buy: Column<JoinedHolding> = {
    key: 'buy',
    name: 'Buy',
    minWidth: expandDetails ? 160 : 80,
    renderCell: ({ row: { holding, quote } }) => (
      <div
        className={styles.gridCellSpaceBetween}
        style={{
          color:
            (quote?.price ?? 0) < holding.prices.lastBuy * 0.85
              ? 'var(--negative)'
              : (quote?.price ?? 0) > holding.prices.lastBuy * 1.25
                ? 'var(--positive)'
                : undefined,
        }}
      >
        <sub>
          {expandDetails &&
            holding.prices.lastBuy !== holding.prices.minBuy && (
              <>
                <Format format={currency} n={holding.prices.minBuy} />
                {holding.prices.minBuy !== holding.prices.maxBuy && (
                  <>
                    {' / '}
                    <Format format={currency} n={holding.prices.maxBuy} />
                  </>
                )}
              </>
            )}
        </sub>
        <Format format={currency} n={holding.prices.lastBuy} />
      </div>
    ),
  };

  const sell: Column<JoinedHolding> = {
    key: 'sell',
    name: 'Sell',
    minWidth: expandDetails ? 160 : 80,
    renderCell: ({ row: { holding, quote } }) => {
      if (!holding.prices.lastSell) {
        return null;
      }

      return (
        <div
          className={styles.gridCellSpaceBetween}
          style={{
            color:
              (quote?.price ?? 0) > holding.prices.lastSell * 1.25
                ? 'var(--negative)'
                : (quote?.price ?? 0) < holding.prices.lastSell * 0.85
                  ? 'var(--positive)'
                  : undefined,
          }}
        >
          <sub>
            {expandDetails &&
              holding.prices.lastSell !== holding.prices.minSell && (
                <>
                  <Format format={currency} n={holding.prices.minSell} />
                  {holding.prices.minSell !== holding.prices.maxSell && (
                    <>
                      {' / '}
                      <Format format={currency} n={holding.prices.maxSell} />
                    </>
                  )}
                </>
              )}
          </sub>
          <Format format={currency} n={holding.prices.lastSell} />
        </div>
      );
    },
  };

  const roa: Column<JoinedHolding> = {
    key: 'roa',
    name: 'ROA',
    minWidth: 60,
    renderCell: ({ row: { statistic } }) => (
      <div className={styles.gridCellRightAlign}>
        {statistic?.type === 'EQUITY' && statistic?.returnOnAssets && (
          <Format format="PERCENT" n={statistic.returnOnAssets * 100} />
        )}
      </div>
    ),
  };

  const roe: Column<JoinedHolding> = {
    key: 'roe',
    name: 'ROE',
    minWidth: 60,
    renderCell: ({ row: { statistic } }) => (
      <div className={styles.gridCellRightAlign}>
        {statistic?.type === 'EQUITY' && statistic?.returnOnEquity && (
          <Format format="PERCENT" n={statistic.returnOnEquity * 100} />
        )}
      </div>
    ),
  };

  const beta: Column<JoinedHolding> = {
    key: 'beta',
    name: 'BETA',
    minWidth: 60,
    renderCell: ({ row: { statistic } }) => (
      <div className={styles.gridCellRightAlign}>
        {statistic?.beta && <Format n={statistic.beta} />}
      </div>
    ),
  };

  return {
    sharesGain,
    totalGain,
    daysGain,
    shares,
    avgCostPerShare,
    realizedGain,
    change,
    marketValue,
    price,
    symbol,
    per,
    pbr,
    fiftyTwoWeek,
    buy,
    sell,
    roa,
    roe,
    beta,
  };
}
