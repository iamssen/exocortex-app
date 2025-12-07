import type { JoinedFX, JPY, KRW, USD } from '@iamssen/exocortex';
import { sumGain } from '@iamssen/exocortex/projector';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import type { OtherCurrencyBalances } from '@ui/data-utils';
import { useJoinedQuoteHistory } from '@ui/data-utils';
import { upbit } from '@ui/query';
import { Fragment, type ReactNode, useMemo } from 'react';

export interface FXProps {
  usd: JoinedFX<USD>;
  jpy: JoinedFX<JPY>;
  otherCurrencies: OtherCurrencyBalances[];
  otherCurrenciesTotalAmount: KRW;
}

export function FX({
  usd,
  jpy,
  otherCurrencies,
  otherCurrenciesTotalAmount,
}: FXProps): ReactNode {
  const krwx = useJoinedQuoteHistory('KRW=X');
  const jpyx = useJoinedQuoteHistory('JPY=X');
  const dxy = useJoinedQuoteHistory('DX-Y.NYB');
  const tnx = useJoinedQuoteHistory('^TNX');

  const { data: krwUsdt } = useQuery(upbit('KRW-USDT'));

  const gain = useMemo(() => sumGain(usd.gain, jpy.gain), [jpy.gain, usd.gain]);

  return (
    <section>
      <dl>
        <dt>
          <strong>FX</strong>
        </dt>
        <dd>
          <Format
            format="KRW"
            n={usd.gain.marketValue + jpy.gain.marketValue}
          />
        </dd>
        <dt data-depth="1">USD</dt>
        <dd>
          <Format format="USD" n={usd.totalAmount} />{' '}
          {usd.quote && (
            <sub>
              (
              <Format format="KRW" n={usd.quote.price} />)
            </sub>
          )}
        </dd>
        <dt data-depth="1">JPY</dt>
        <dd>
          <Format format="JPY" n={jpy.totalAmount} />{' '}
          {jpy.quote && (
            <sub>
              (
              <Format format="KRW" n={jpy.quote.price} />)
            </sub>
          )}
        </dd>
        {krwx?.quote && (
          <>
            <dt data-depth="1">KRW=X</dt>
            <dd>
              <Format format="KRW" n={krwx.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={krwx.quote.changePercent} />
                {' : '}
                <Format n={krwx.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={krwx.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        {krwUsdt && (
          <>
            <dt data-depth="2">KRW-USDT</dt>
            <dd>
              <Format format="KRW" n={krwUsdt.trade_price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={krwUsdt.change_rate * 100} />
                {' : '}
                <Format n={krwUsdt.lowest_52_week_price} />
                {' - '}
                <Format n={krwUsdt.highest_52_week_price} />)
              </sub>
            </dd>
          </>
        )}
        {jpyx?.quote && (
          <>
            <dt data-depth="1">JPY=X</dt>
            <dd>
              <Format format="JPY" n={jpyx.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={jpyx.quote.changePercent} />
                {' : '}
                <Format n={jpyx.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={jpyx.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        {dxy?.quote && (
          <>
            <dt data-depth="1">DXY</dt>
            <dd>
              <Format n={dxy.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={dxy.quote.changePercent} />
                {' : '}
                <Format n={dxy.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={dxy.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        {tnx?.quote && (
          <>
            <dt data-depth="1">TNX</dt>
            <dd>
              <Format format="RATE" n={tnx.quote.price} />{' '}
              <sub>
                (
                <Format format="PERCENT" n={tnx.quote.changePercent} />
                {' : '}
                <Format n={tnx.fiftyTwoWeekRange.low} />
                {' - '}
                <Format n={tnx.fiftyTwoWeekRange.high} />)
              </sub>
            </dd>
          </>
        )}
        <dt>Day's gain</dt>
        <dd>
          <Format format="KRW" n={gain.daysGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={gain.daysGainPercent} />)
          </sub>
        </dd>
        <dt>Total gain</dt>
        <dd>
          <Format format="KRW" n={gain.totalGain} />{' '}
          <sub>
            (
            <Format format="PERCENT" n={gain.totalGainPercent} />)
          </sub>
        </dd>
        {otherCurrenciesTotalAmount > 0 && (
          <>
            <dt>Other Currencies</dt>
            <dd>
              <Format format="KRW" n={otherCurrenciesTotalAmount} />
            </dd>
            {otherCurrencies.map(({ symbol, totalAmount, krwAmount }) => (
              <Fragment key={symbol}>
                <dt data-depth="1">{symbol}</dt>
                <dd>
                  <Format format="KRW" n={krwAmount} />{' '}
                  <sub>
                    (<Format n={totalAmount} />)
                  </sub>
                </dd>
              </Fragment>
            ))}
          </>
        )}
      </dl>
    </section>
  );
}
