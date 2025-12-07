import type { JoinedHoldings } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import { MarketStateSymbol } from '@ui/components';
import { useJoinedQuoteHistory } from '@ui/data-utils';
import type { ReactNode } from 'react';

export interface JPProps {
  holdings: JoinedHoldings;
}

export function JP({ holdings }: JPProps): ReactNode {
  const n255 = useJoinedQuoteHistory('^N225');

  return (
    <section>
      <dl>
        <dt>
          <strong>JP</strong>{' '}
          <MarketStateSymbol marketState={holdings.marketState} />
        </dt>
        <dd>
          <Format format="JPY" n={holdings.gain.marketValue} />
        </dd>
        {n255?.quote && (
          <>
            <dt data-depth="1">Nikkei</dt>
            <dd>
              <Format format="INTEGER" n={n255.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={n255.quote.changePercent} />
                {' : '}
                <Format format="INTEGER" n={n255.fiftyTwoWeekRange.low} />
                {' - '}
                <Format format="INTEGER" n={n255.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        <dt>Day's gain</dt>
        <dd>
          <Format format="JPY" n={holdings.gain.daysGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={holdings.gain.daysGainPercent} />)
          </sub>
        </dd>
        <dt>Total gain</dt>
        <dd>
          <Format format="JPY" n={holdings.gain.totalGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={holdings.gain.totalGainPercent} />)
          </sub>
        </dd>
      </dl>
    </section>
  );
}
