import type {
  JoinedQuoteStatistics,
  PortfolioMarket,
  Quote,
} from '@iamssen/exocortex';
import { joinHoldingsAndQuotes } from '@iamssen/exocortex/projector';
import type { CurrencyType } from '@iamssen/format';
import { Format, Scope } from '@iamssen/format';
import {
  useLocalStorage,
  useLocalStorageJson,
} from '@iamssen/use-local-storage';
import { useQuery } from '@tanstack/react-query';
import { useQuotes, useQuoteStatistics } from '@ui/data-utils';
import type {
  HoldingsGridPerspectives,
  HoldingsGridViewConfig,
} from '@ui/grids';
import { HoldingsGrid } from '@ui/grids';
import { api } from '@ui/query';
import { type ReactNode, useMemo } from 'react';
import { MdDashboard, MdDeleteForever } from 'react-icons/md';
import styles from './HoldingsPage.module.css';

export interface ViewProps {
  currency: CurrencyType;
  krwExchangeRate?: Quote;
  portfolio: PortfolioMarket;
  printDisplayName?: boolean;
}

export function View({
  currency,
  portfolio,
  krwExchangeRate,
  printDisplayName,
}: ViewProps): ReactNode {
  const [perspective, setPerspective] =
    useLocalStorage<HoldingsGridPerspectives>(
      'holdings_perspective',
      () => 'daysGain',
    );

  const [config, setConfig] = useLocalStorageJson<HoldingsGridViewConfig>(
    'holdings_config',
    () => ({
      includeNonHoldings: false,
      expandDetails: false,
    }),
  );

  const { data: { data: financeData } = {} } = useQuery(api(`portfolio`));

  const symbols = useMemo(() => {
    if (financeData) {
      return config.includeNonHoldings
        ? financeData.holdings[portfolio].symbols
        : financeData.holdings[portfolio].holdSymbols;
    } else {
      return [];
    }
  }, [config.includeNonHoldings, financeData, portfolio]);

  const quotes = useQuotes(symbols);
  const statistics = useQuoteStatistics(symbols);

  const holdings = useMemo(() => {
    return financeData
      ? joinHoldingsAndQuotes(
          financeData.holdings[portfolio].list,
          quotes,
          statistics,
        )
      : undefined;
  }, [financeData, portfolio, quotes, statistics]);

  const market52WeekBenchmark = useMemo<
    JoinedQuoteStatistics | undefined
  >(() => {
    switch (portfolio) {
      case 'fx': {
        return holdings?.holdings.find(
          ({ holding }) => holding.symbol === 'KRW=X',
        )?.statistic;
      }
      case 'us': {
        return holdings?.holdings.find(
          ({ holding }) => holding.symbol === 'SPY',
        )?.statistic;
      }
      case 'kr': {
        return holdings?.holdings.find(
          ({ holding }) => holding.symbol === '069500.KS',
        )?.statistic;
      }
      case 'crypto': {
        return holdings?.holdings.find(
          ({ holding }) => holding.symbol === 'BTC-USD',
        )?.statistic;
      }
    }
  }, [holdings, portfolio]);

  return (
    <>
      {holdings?.gain && (
        <header className={styles.header}>
          <button
            role="tab"
            aria-selected={perspective === 'daysGain'}
            onClick={() => setPerspective('daysGain')}
          >
            <ul>
              <li>Day's Gain</li>
              <li>
                <Format format={currency} n={holdings.gain.daysGain} />{' '}
                <sub>
                  (
                  <Format format="PERCENT" n={holdings.gain.daysGainPercent} />)
                </sub>
              </li>
              {krwExchangeRate && (
                <li>
                  <Format
                    format="KRW"
                    n={holdings.gain.daysGain * krwExchangeRate.price}
                  />
                </li>
              )}
            </ul>
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'totalGain'}
            onClick={() => setPerspective('totalGain')}
          >
            <ul>
              <li>Total Gain</li>
              <li>
                <Format format={currency} n={holdings.gain.totalGain} />{' '}
                <sub>
                  (
                  <Format format="PERCENT" n={holdings.gain.totalGainPercent} />
                  )
                </sub>
              </li>
              {krwExchangeRate && (
                <li>
                  <Format
                    format="KRW"
                    n={holdings.gain.totalGain * krwExchangeRate.price}
                  />
                </li>
              )}
            </ul>
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'sharesGain'}
            onClick={() => setPerspective('sharesGain')}
          >
            <ul>
              <li>Shares Gain</li>
              <li>
                <Format format={currency} n={holdings.gain.sharesGain} />{' '}
                <sub>
                  (
                  <Format
                    format="PERCENT"
                    n={holdings.gain.sharesGainPercent}
                  />
                  )
                </sub>
              </li>
              {krwExchangeRate && (
                <li>
                  <Format
                    format="KRW"
                    n={holdings.gain.sharesGain * krwExchangeRate.price}
                  />
                </li>
              )}
            </ul>
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'realizedGain'}
            onClick={() => setPerspective('realizedGain')}
          >
            <ul>
              <li>Realized Gain</li>
              <li>
                <Format format={currency} n={holdings.gain.realizedGain} />
              </li>
              {krwExchangeRate && (
                <li>
                  <Format
                    format="KRW"
                    n={holdings.gain.realizedGain * krwExchangeRate.price}
                  />
                </li>
              )}
            </ul>
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'marketValue'}
            onClick={() => setPerspective('marketValue')}
          >
            <ul>
              <li>Market Value</li>
              <li>
                <Format format={currency} n={holdings.gain.marketValue} />
              </li>
              {krwExchangeRate && (
                <li>
                  <Format
                    format="KRW"
                    n={holdings.gain.marketValue * krwExchangeRate.price}
                  />
                </li>
              )}
            </ul>
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'fiftyTwoWeek'}
            onClick={() => setPerspective('fiftyTwoWeek')}
          >
            <ul>
              <li>52 Week</li>
              <li>
                <Format format={currency} n={market52WeekBenchmark?.price} />{' '}
                {typeof market52WeekBenchmark?.fiftyTwoWeekPosition ===
                  'number' && (
                  <sub>
                    (<Format n={market52WeekBenchmark.fiftyTwoWeekPosition} />)
                  </sub>
                )}
              </li>
              {market52WeekBenchmark?.fiftyTwoWeekRange && (
                <>
                  <Format
                    format={currency}
                    n={market52WeekBenchmark.fiftyTwoWeekRange.low}
                  />
                  {' - '}
                  <Format
                    format={currency}
                    n={market52WeekBenchmark.fiftyTwoWeekRange.high}
                  />
                </>
              )}
            </ul>
          </button>
          <button
            role="tab"
            aria-selected={perspective === 'price'}
            onClick={() => setPerspective('price')}
          >
            <ul>
              <li>Price</li>
            </ul>
          </button>
          {(portfolio === 'us' || portfolio === 'kr' || portfolio === 'jp') && (
            <>
              <button
                role="tab"
                aria-selected={perspective === 'per'}
                onClick={() => setPerspective('per')}
              >
                <ul>
                  <li>P/E</li>
                </ul>
              </button>
              <button
                role="tab"
                aria-selected={perspective === 'pbr'}
                onClick={() => setPerspective('pbr')}
              >
                <ul>
                  <li>P/B</li>
                </ul>
              </button>
            </>
          )}
          {(portfolio === 'us' || portfolio === 'jp') && (
            <button
              role="tab"
              aria-selected={perspective === 'beta'}
              onClick={() => setPerspective('beta')}
            >
              <ul>
                <li>BETA</li>
              </ul>
            </button>
          )}
          <div className={styles.configGrid}>
            <button
              role="tab"
              aria-selected={config.includeNonHoldings}
              onClick={() =>
                setConfig({
                  ...config,
                  includeNonHoldings: !config.includeNonHoldings,
                })
              }
            >
              <MdDeleteForever />
            </button>
            <button
              role="tab"
              aria-selected={config.expandDetails}
              onClick={() =>
                setConfig({
                  ...config,
                  expandDetails: !config.expandDetails,
                })
              }
            >
              <MdDashboard />
            </button>
          </div>
        </header>
      )}

      {holdings?.holdings && (
        <Scope value={{ totalMarketValue: holdings.gain.marketValue }}>
          <HoldingsGrid
            key={portfolio}
            className={styles.grid}
            rows={holdings.holdings}
            portfolio={portfolio}
            perspective={perspective}
            currency={currency}
            printDisplayName={printDisplayName}
            {...config}
          />
        </Scope>
      )}
    </>
  );
}
