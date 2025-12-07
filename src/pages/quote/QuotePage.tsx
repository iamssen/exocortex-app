import type { Iso8601, JoinedTrade } from '@iamssen/exocortex';
import {
  joinHoldingAndQuote,
  joinQuoteStatisticsAndQuote,
  joinTradesAndQuotes,
} from '@iamssen/exocortex/projector';
import type { CurrencyType } from '@iamssen/format';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { QuoteChart } from '@ui/charts';
import {
  MultiDateSelect,
  QuoteLinkIcons,
  SingleDateSelect,
  toDateItem,
  useMultiDateSelectState,
  useSingleDateState,
} from '@ui/components';
import { useQuoteInfo } from '@ui/data-utils';
import type { TradesGridColumns } from '@ui/grids';
import { TradesGrid } from '@ui/grids';
import { api } from '@ui/query';
import { type ReactNode, useMemo } from 'react';
import { useParams } from 'react-router';
import { quoteStartDates } from '../../env.ts';
import { Page } from '../../Page.tsx';
import styles from './QuotePage.module.css';
import { RefLinks } from './RefLinks.tsx';
import { EquityValueHistorySection } from './sections/EquityValueHistorySection.tsx';
import { EtfHoldingsSection } from './sections/EtfHoldingsSection.tsx';
import type { TrendComparingQuote } from './sections/QuoteTrendSection.tsx';
import { QuoteTrendSection } from './sections/QuoteTrendSection.tsx';
import { QuoteYearlyTrendSection } from './sections/QuoteYearlyTrendSection.tsx';

const trendComparingQuotes: TrendComparingQuote[] = [
  { symbol: 'DIA', style: { color: 'gray', opacity: 0.4 } },
  { symbol: 'QQQ', style: { color: 'darkorange', opacity: 0.4 } },
  { symbol: 'SPY', style: { color: 'blueviolet' } },
];

const zeroResetDates: Iso8601[] = [
  '2009-02-01' as Iso8601,
  '2020-03-31' as Iso8601,
  '2021-12-31' as Iso8601,
  '2022-10-01' as Iso8601,
];

export function QuotePage(): ReactNode {
  const { symbol } = useParams<{ symbol: string }>();
  return symbol ? <Component symbol={symbol} /> : null;
}

const excludeColumns = new Set<keyof TradesGridColumns>(['symbol']);

function Component({ symbol }: { symbol: string }) {
  const comparingQuotes = useMemo(() => {
    return trendComparingQuotes.filter((item) => item.symbol !== symbol);
  }, [symbol]);

  const chartStartDates = useMemo(() => quoteStartDates.map(toDateItem), []);

  const [chartStartDate, setChartStartDate] = useSingleDateState(
    'quote_chart_start_date',
    chartStartDates,
    ({ label }) => label === 'CORONA',
  );

  const [chartZeroResetDates, setChartZeroResetDates] = useMultiDateSelectState(
    'quote_chart_zero_reset_dates',
    zeroResetDates,
    zeroResetDates,
  );

  const info = useQuoteInfo(symbol);

  const { data: { data: financeData } = {} } = useQuery(api('portfolio'));
  const { data: quoteData } = useQuery(api(`finance/quote/${symbol}`));
  const { data: statisticData } = useQuery(
    api(`finance/quote-statistics/${symbol}`),
  );
  const { data: historyData } = useQuery(
    api(`finance/quote-history/${symbol}`),
  );

  const holding = useMemo(() => {
    return financeData && financeData.holdings.index[symbol]
      ? joinHoldingAndQuote(
          financeData.holdings.index[symbol]!,
          quoteData?.data,
          undefined,
        )
      : undefined;
  }, [financeData, quoteData?.data, symbol]);

  const statistic = useMemo(() => {
    return statisticData?.data && quoteData?.data
      ? joinQuoteStatisticsAndQuote(statisticData.data, quoteData.data)
      : undefined;
  }, [quoteData, statisticData]);

  const trades = useMemo<JoinedTrade[] | undefined>(() => {
    return financeData && financeData.holdings.index[symbol]
      ? joinTradesAndQuotes(
          financeData.holdings.index[symbol]!.trades,
          quoteData?.data,
        )
      : undefined;
  }, [financeData, quoteData?.data, symbol]);

  const printDisplayName = useMemo(
    () => info.portfolio === 'kr' || info.portfolio === 'jp',
    [info.portfolio],
  );

  return (
    <Page layout="scrollable">
      {historyData && (
        <QuoteChart
          start={chartStartDate.value}
          info={info}
          history={historyData.data}
          quote={quoteData?.data}
          watch={financeData?.watches[symbol]}
          statistic={statisticData?.data}
          trades={financeData?.holdings.index[symbol]?.trades}
          style={{
            width: '100%',
            height: 'max(30vh, 250px)',
          }}
        />
      )}

      {info.type === 'EQUITY' && (
        <EquityValueHistorySection
          symbol={symbol}
          currentPe={statistic?.trailingPE}
          start={chartStartDate.value}
        />
      )}

      <div className={styles.dateSelection}>
        <SingleDateSelect
          dates={chartStartDates}
          selectedDate={chartStartDate}
          onChange={setChartStartDate}
        />
      </div>

      <QuoteTrendSection
        historyData={historyData}
        comparingQuotes={comparingQuotes}
        start={chartStartDate.value}
        zeroResetDates={chartZeroResetDates}
      />

      <div className={styles.dateSelection}>
        <MultiDateSelect
          dates={zeroResetDates}
          selectedDates={chartZeroResetDates}
          onChange={setChartZeroResetDates}
        />
      </div>

      <QuoteYearlyTrendSection info={info} historyData={historyData} />

      {info.portfolio && trades && trades.length > 0 && (
        <TradesGrid
          key={symbol}
          className={styles.grid}
          style={{ height: `${25 * (Math.min(trades.length, 10) + 1)}px` }}
          currency={info.currency as CurrencyType}
          portfolio={info.portfolio}
          printDisplayName={printDisplayName}
          rows={trades}
          excludeColumns={excludeColumns}
        />
      )}

      <section className={styles.details}>
        {info && (
          <header>
            <h1>
              {info.symbol} <sub>({info.displayName})</sub>
            </h1>

            <QuoteLinkIcons info={info} />
          </header>
        )}

        <dl>
          {quoteData && (
            <>
              <dt>
                {holding && holding.holding.shares > 0 && 'AVG COST, '}PRICE
              </dt>
              <dd>
                {holding && holding.holding.shares > 0 && (
                  <span
                    style={{
                      color:
                        quoteData.data.price > holding.holding.avgCostPerShare
                          ? 'var(--positive)'
                          : 'var(--negative)',
                    }}
                  >
                    <Format
                      format={quoteData.data.currency}
                      n={holding.holding.avgCostPerShare}
                    />
                    {' → '}
                  </span>
                )}
                <Format
                  format={quoteData.data.currency}
                  n={quoteData.data.price}
                />
              </dd>
              <dt>CHANGE</dt>
              <dd>
                <Format
                  format={quoteData.data.currency}
                  n={quoteData.data.change}
                />{' '}
                <sub>
                  (<Format format="PERCENT" n={quoteData.data.changePercent} />)
                </sub>
              </dd>
            </>
          )}
          {holding && holding.holding.shares > 0 && (
            <>
              <dt>SHARES</dt>
              <dd>
                <Format n={holding.holding.shares} />
              </dd>
            </>
          )}
          {holding && (
            <>
              <dt>REALIZED GAIN</dt>
              <dd>
                <Format
                  format={info.currency}
                  n={holding.holding.realizedGain}
                />
              </dd>
            </>
          )}
          {holding?.quote && holding.holding.shares > 0 && (
            <>
              <dt>DAY'S GAIN</dt>
              <dd>
                <Format
                  style={{
                    color:
                      holding.gain.daysGain > 0
                        ? 'var(--positive)'
                        : 'var(--negative)',
                  }}
                  format={holding.quote.currency}
                  n={holding.gain.daysGain}
                />{' '}
                <sub>
                  (<Format format="PERCENT" n={holding.gain.daysGainPercent} />)
                </sub>
              </dd>
              <dt>SHARES GAIN</dt>
              <dd>
                <Format
                  style={{
                    color:
                      holding.gain.sharesGain > 0
                        ? 'var(--positive)'
                        : 'var(--negative)',
                  }}
                  format={holding.quote.currency}
                  n={holding.gain.sharesGain}
                />
              </dd>
              <dt>TOTAL GAIN</dt>
              <dd>
                <Format
                  style={{
                    color:
                      holding.gain.totalGain > 0
                        ? 'var(--positive)'
                        : 'var(--negative)',
                  }}
                  format={holding.quote.currency}
                  n={holding.gain.totalGain}
                />{' '}
                <sub>
                  (<Format format="PERCENT" n={holding.gain.totalGainPercent} />
                  )
                </sub>
              </dd>
              <dt>MARKET VALUE</dt>
              <dd>
                <Format
                  format={holding.quote.currency}
                  n={holding.gain.marketValue}
                />
              </dd>
            </>
          )}
          {(statistic?.trailingPE || statistic?.forwardPE) &&
            statistic?.type === 'EQUITY' && (
              <>
                <dt>P/E</dt>
                <dd>
                  <Format n={statistic.trailingPE} />
                  {statistic.forwardPE && (
                    <sub>
                      {' → '}
                      <Format n={statistic.forwardPE} />
                    </sub>
                  )}
                </dd>
              </>
            )}
          {statistic?.priceToBook && (
            <>
              <dt>P/B</dt>
              <dd>
                <Format n={statistic.priceToBook} />
              </dd>
            </>
          )}
          {statistic?.returnOnAssets && (
            <>
              <dt>ROA</dt>
              <dd>
                <Format format="PERCENT" n={statistic.returnOnAssets * 100} />
              </dd>
            </>
          )}
          {statistic?.returnOnEquity && (
            <>
              <dt>ROE</dt>
              <dd>
                <Format format="PERCENT" n={statistic.returnOnEquity * 100} />
              </dd>
            </>
          )}
          {statistic?.beta && (
            <>
              <dt>BETA</dt>
              <dd>
                <Format n={statistic.beta} />
              </dd>
            </>
          )}
        </dl>

        {info.type === 'ETF' && <EtfHoldingsSection symbol={info.symbol} />}

        <RefLinks symbol={symbol} />
      </section>
    </Page>
  );
}
