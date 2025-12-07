import type {
  JoinedQuoteStatistics,
  Match,
  Quote,
  Watch,
} from '@iamssen/exocortex';
import {
  evaluateWatchConditions,
  hasMatchHigh,
  hasMatchLow,
  joinQuoteStatisticsAndQuote,
} from '@iamssen/exocortex/projector';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { useQuoteInfo, useQuotes, useQuoteStatistics } from '@ui/data-utils';
import { api } from '@ui/query';
import { Fragment, type ReactNode, useMemo } from 'react';
import { Link } from 'react-router';
import { Page } from '../../Page.tsx';
import styles from './WatchPage.module.css';

export function WatchPage(): ReactNode {
  const { data: { data: financeData } = {} } = useQuery(api('portfolio'));

  const symbols = useMemo(
    () => Object.keys(financeData?.watches ?? {}),
    [financeData?.watches],
  );

  const quotes = useQuotes(symbols);
  const statistics = useQuoteStatistics(symbols);

  const watches = useMemo<WatchItemProps[]>(() => {
    return Object.entries(financeData?.watches ?? {})
      .map(([symbol, watch]) => {
        const quote = quotes.get(symbol);
        const statistic = statistics.get(symbol);
        const match = evaluateWatchConditions(
          watch,
          quote,
          statistic,
          undefined,
        );

        return {
          symbol,
          watch,
          match,
          matchScore: match.reduce((total, m) => total + (m.match ? 1 : 0), 0),
          matchHigh: hasMatchHigh(match),
          matchLow: hasMatchLow(match),
          quote,
          statistic:
            quote && statistic
              ? joinQuoteStatisticsAndQuote(statistic, quote)
              : undefined,
        };
      })
      .toSorted((a, b) => {
        return b.matchScore - a.matchScore;
      });
  }, [financeData?.watches, quotes, statistics]);

  return (
    <Page layout="scrollable" className={styles.container}>
      <ul className={styles.grid}>
        {watches.map((props) => (
          <WatchItem key={props.symbol} {...props} />
        ))}
      </ul>
    </Page>
  );
}

interface WatchItemProps {
  symbol: string;
  watch: Watch;
  match: Match;
  matchHigh: boolean;
  matchLow: boolean;
  matchScore: number;
  quote?: Quote;
  statistic?: JoinedQuoteStatistics;
}

function WatchItem({
  symbol,
  match,
  matchScore,
  matchHigh,
  matchLow,
  quote,
}: WatchItemProps) {
  const info = useQuoteInfo(symbol);

  if (!quote) {
    return null;
  }

  return (
    <li
      data-match={matchScore}
      data-match-high={matchHigh || undefined}
      data-match-low={matchLow || undefined}
    >
      <Link to={`/quote/${symbol}`}>
        <header>
          <h3>
            {info.portfolio === 'kr' || info.portfolio === 'jp'
              ? info.displayName
              : symbol}
          </h3>
          <Format format="PERCENT" n={quote.changePercent} />
        </header>
        {match && (
          <dl>
            {match.map((m) => {
              if ('high_price' in m) {
                return (
                  <Fragment key={`high_price-${m.high_price}`}>
                    <dt data-match={m.match}>High</dt>
                    <dd>
                      <Format
                        format={info.currency}
                        n={m.current_price}
                        replacer="-"
                      />
                      {' / '}
                      <Format format={info.currency} n={m.high_price} />
                    </dd>
                  </Fragment>
                );
              } else if ('low_price' in m) {
                return (
                  <Fragment key={`low_price-${m.low_price}`}>
                    <dt data-match={m.match}>Low</dt>
                    <dd>
                      <Format
                        format={info.currency}
                        n={m.current_price}
                        replacer="-"
                      />
                      {' / '}
                      <Format format={info.currency} n={m.low_price} />
                    </dd>
                  </Fragment>
                );
              } else if ('high_pe' in m) {
                return (
                  <Fragment key={`high_pe-${m.high_pe}`}>
                    <dt data-match={m.match}>High P/E</dt>
                    <dd>
                      <Format n={m.current_pe} replacer="-" />
                      {' / '}
                      <Format n={m.high_pe} />
                    </dd>
                  </Fragment>
                );
              } else if ('low_pe' in m) {
                return (
                  <Fragment key={`low_pe-${m.low_pe}`}>
                    <dt data-match={m.match}>Low P/E</dt>
                    <dd>
                      <Format n={m.current_pe} replacer="-" />
                      {' / '}
                      <Format n={m.low_pe} />
                    </dd>
                  </Fragment>
                );
              } else if ('high_52week' in m) {
                return (
                  <Fragment key={`high_52week-${m.high_52week}`}>
                    <dt data-match={m.match}>High 52Week</dt>
                    <dd>
                      <Format n={m.current_52week} replacer="-" />
                      {' / '}
                      <Format n={m.high_52week} />
                    </dd>
                  </Fragment>
                );
              } else if ('low_52week' in m) {
                return (
                  <Fragment key={`low_52week-${m.low_52week}`}>
                    <dt data-match={m.match}>Low 52Week</dt>
                    <dd>
                      <Format n={m.current_52week} replacer="-" />
                      {' / '}
                      <Format n={m.low_52week} />
                    </dd>
                  </Fragment>
                );
              } else {
                return null;
              }
            })}
          </dl>
        )}
      </Link>
    </li>
  );
}
