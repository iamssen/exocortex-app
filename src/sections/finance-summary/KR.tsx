import type { JoinedHoldings } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { MarketStateSymbol } from '@ui/components';
import { useJoinedQuoteHistory } from '@ui/data-utils';
import { api } from '@ui/query';
import type { ReactNode } from 'react';

export interface KRProps {
  holdings: JoinedHoldings;
}

export function KR({ holdings }: KRProps): ReactNode {
  const { data: kospiPe } = useQuery(api('finance/kospi-pe'));

  const ks11 = useJoinedQuoteHistory('^KS11');
  const kq11 = useJoinedQuoteHistory('^KQ11');
  const kodex200 = useJoinedQuoteHistory('069500.KS');

  return (
    <section>
      <dl>
        <dt>
          <strong>KR</strong>{' '}
          <MarketStateSymbol marketState={holdings.marketState} />
        </dt>
        <dd>
          <Format format="KRW" n={holdings.gain.marketValue} />
        </dd>
        {kospiPe && kospiPe.data.length > 0 && (
          <>
            <dt data-depth="1">Kospi P/E</dt>
            <dd>
              <Format n={kospiPe.data.at(-1)?.all} />
            </dd>
          </>
        )}
        {ks11?.quote && (
          <>
            <dt data-depth="1">Kospi</dt>
            <dd>
              <Format n={ks11.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={ks11.quote.changePercent} />
                {' : '}
                <Format n={ks11.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={ks11.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        {kq11?.quote && (
          <>
            <dt data-depth="1">Kosdaq</dt>
            <dd>
              <Format n={kq11.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={kq11.quote.changePercent} />
                {' : '}
                <Format n={kq11.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={kq11.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        {kodex200?.quote && (
          <>
            <dt data-depth="1">Kodex 200</dt>
            <dd>
              <Format format="KRW" n={kodex200.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={kodex200.quote.changePercent} />
                {' : '}
                <Format n={kodex200.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={kodex200.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        <dt>Day's gain</dt>
        <dd>
          <Format format="KRW" n={holdings.gain.daysGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={holdings.gain.daysGainPercent} />)
          </sub>
        </dd>
        <dt>Total gain</dt>
        <dd>
          <Format format="KRW" n={holdings.gain.totalGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={holdings.gain.totalGainPercent} />)
          </sub>
        </dd>
      </dl>
    </section>
  );
}
