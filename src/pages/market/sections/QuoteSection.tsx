import type { Iso8601 } from '@iamssen/exocortex';
import {
  evaluateWatchConditions,
  hasMatchHigh,
  hasMatchLow,
} from '@iamssen/exocortex/projector';
import { useElementIntersection } from '@iamssen/use-element-intersection';
import { useQuery } from '@tanstack/react-query';
import { QuoteChart } from '@ui/charts';
import { QuoteLinkIcons } from '@ui/components';
import { useQuoteInfo } from '@ui/data-utils';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { MatchSymbol } from './helpers/MatchSymbol.tsx';
import { useSectionAttributes } from './helpers/useSectionAttributes.ts';
import styles from './styles.module.css';

export interface QuoteSectionProps {
  symbol: string;
  chartStart: Iso8601;
  observeIntersection?: boolean;
}

export function QuoteSection({
  symbol,
  chartStart,
  observeIntersection = false,
}: QuoteSectionProps): ReactNode {
  const elementRef = useRef<HTMLElement>(null);

  const intersection = useElementIntersection({
    elementRef,
    threshold: 0.1,
    observeOnce: true,
  });

  return (
    <figure ref={elementRef} className={styles.figure}>
      {(!observeIntersection || intersection?.isIntersecting) && (
        <Content symbol={symbol} chartStart={chartStart} />
      )}
    </figure>
  );
}

function Content({ symbol, chartStart }: QuoteSectionProps) {
  const info = useQuoteInfo(symbol);

  const { data: { data: financeData } = {} } = useQuery(api('portfolio'));
  const { data: quoteData } = useQuery(api(`finance/quote/${symbol}`));
  const { data: statisticData } = useQuery(
    api(`finance/quote-statistics/${symbol}`),
  );
  const { data: historyData } = useQuery(
    api(`finance/quote-history/${symbol}`),
  );

  const matches = useMemo(() => {
    if (financeData?.watches[symbol] && quoteData?.data) {
      const match = evaluateWatchConditions(
        financeData.watches[symbol],
        quoteData.data,
        statisticData?.data,
        undefined,
      );

      return {
        high: hasMatchHigh(match) || undefined,
        low: hasMatchLow(match) || undefined,
      };
    }

    return {
      high: undefined,
      low: undefined,
    };
  }, [financeData, quoteData, statisticData, symbol]);

  const attributes = useSectionAttributes(matches, quoteData?.refreshDate);

  return (
    <>
      {historyData && (
        <QuoteChart
          start={chartStart}
          info={info}
          history={historyData.data}
          quote={quoteData?.data}
          watch={financeData?.watches[symbol]}
          statistic={statisticData?.data}
          trades={financeData?.holdings.index[symbol]?.trades}
        />
      )}
      <figcaption {...attributes}>
        <h3>
          <Link to={`/quote/${info.symbol}`}>
            {info.symbol} <sub>({info.displayName})</sub>
          </Link>
          <MatchSymbol {...matches} />
        </h3>
        <QuoteLinkIcons info={info} />
      </figcaption>
    </>
  );
}
