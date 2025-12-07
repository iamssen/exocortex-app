import type { JoinedHoldings } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { MarketStateSymbol } from '@ui/components';
import { useJoinedQuoteHistory } from '@ui/data-utils';
import { api } from '@ui/query';
import type { ReactNode } from 'react';

export interface USProps {
  holdings: JoinedHoldings;
}

export function US({ holdings }: USProps): ReactNode {
  const { data: sp500Pe } = useQuery(api('finance/sp500-pe'));

  const spy = useJoinedQuoteHistory('SPY');
  const qqq = useJoinedQuoteHistory('QQQ');

  return (
    <section>
      <dl>
        <dt>
          <strong>US</strong>{' '}
          <MarketStateSymbol marketState={holdings.marketState} />
        </dt>
        <dd>
          <Format format="USD" n={holdings.gain.marketValue} />
        </dd>
        {sp500Pe && sp500Pe.data.length > 0 && (
          <>
            <dt data-depth="1">S&P 500 P/E</dt>
            <dd>
              <Format n={sp500Pe.data.at(-1)?.value} />
            </dd>
          </>
        )}
        {/*{nasdaqPe && nasdaqPe.data.length > 0 && (*/}
        {/*  <>*/}
        {/*    <dt data-depth="1">Nasdaq P/E</dt>*/}
        {/*    <dd>*/}
        {/*      <Format n={nasdaqPe.data[nasdaqPe.data.length - 1].pe} />*/}
        {/*    </dd>*/}
        {/*  </>*/}
        {/*)}*/}
        {spy?.quote && (
          <>
            <dt data-depth="1">SPY</dt>
            <dd>
              <Format format="USD" n={spy.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={spy.quote.changePercent} />
                {' : '}
                <Format n={spy.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={spy.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        {qqq?.quote && (
          <>
            <dt data-depth="1">QQQ</dt>
            <dd>
              <Format format="USD" n={qqq.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={qqq.quote.changePercent} />
                {' : '}
                <Format n={qqq.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={qqq.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        <dt>Day's gain</dt>
        <dd>
          <Format format="USD" n={holdings.gain.daysGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={holdings.gain.daysGainPercent} />)
          </sub>
        </dd>
        <dt>Total gain</dt>
        <dd>
          <Format format="USD" n={holdings.gain.totalGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={holdings.gain.totalGainPercent} />)
          </sub>
        </dd>
      </dl>
    </section>
  );
}
