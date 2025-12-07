import type {
  AggregatedTrade,
  JoinedTrade,
  PortfolioMarket,
} from '@iamssen/exocortex';
import {
  aggregateTrades,
  joinTradesAndQuotes,
} from '@iamssen/exocortex/projector';
import type { CurrencyType } from '@iamssen/format';
import { FormatConfig } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { TradeAmountChart } from '@ui/charts';
import { useQuotes } from '@ui/data-utils';
import { TradesGrid } from '@ui/grids';
import { api } from '@ui/query';
import { type ReactNode, useMemo } from 'react';
import { Page } from '../../Page.tsx';
import styles from './TradeHistoryPage.module.css';

export interface TradeHistoryPageProps {
  currency: CurrencyType;
  benchmarkSymbol: string;
  portfolio: PortfolioMarket;
  printDisplayName?: boolean;
}

export function TradeHistoryPage({
  currency,
  portfolio,
  benchmarkSymbol,
  printDisplayName,
}: TradeHistoryPageProps): ReactNode {
  const { data: { data: financeData } = {} } = useQuery(api(`portfolio`));

  const { data: benchmarkHistory } = useQuery(
    api(`finance/quote-history/${benchmarkSymbol}`),
  );

  const symbols = useMemo(
    () => financeData?.holdings[portfolio].symbols ?? [],
    [financeData?.holdings, portfolio],
  );

  const quotes = useQuotes(symbols);

  const trades = useMemo<JoinedTrade[] | undefined>(() => {
    return financeData
      ? joinTradesAndQuotes(financeData.holdings[portfolio].trades, quotes)
      : undefined;
  }, [financeData, portfolio, quotes]);

  const aggregated = useMemo<AggregatedTrade[] | undefined>(() => {
    return trades ? aggregateTrades(trades) : undefined;
  }, [trades]);

  return (
    <Page layout="fixed" className={styles.style}>
      <FormatConfig krwShortUnits>
        {aggregated && (
          <TradeAmountChart
            role="figure"
            trades={aggregated}
            benchmarkHistory={benchmarkHistory?.data}
            currency={currency}
          />
        )}
        {trades && (
          <TradesGrid
            role="grid"
            key={portfolio}
            currency={currency}
            portfolio={portfolio}
            printDisplayName={printDisplayName}
            rows={trades}
          />
        )}
      </FormatConfig>
    </Page>
  );
}
