import type { JoinedHoldings } from '@iamssen/exocortex';
import { Format, FormatConfig } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { MarketStateSymbol } from '@ui/components';
import { useJoinedQuoteHistory } from '@ui/data-utils';
import { api, upbit } from '@ui/query';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export interface CryptoProps {
  holdings: JoinedHoldings;
}

export function Crypto({ holdings }: CryptoProps): ReactNode {
  const btcUsd = useJoinedQuoteHistory('BTC-USD');
  const ethUsd = useJoinedQuoteHistory('ETH-USD');

  const { data: krwx } = useQuery(api('finance/quote/KRW=X'));
  const { data: krwUsdt } = useQuery(upbit('KRW-USDT'));
  const { data: krwBtc } = useQuery(upbit('KRW-BTC'));
  const { data: krwEth } = useQuery(upbit('KRW-ETH'));

  const btcKimp = useMemo(() => {
    if (krwx && krwBtc && btcUsd?.quote) {
      const krwBtcInUsd = krwBtc.trade_price / krwx.data.price;
      return (krwBtcInUsd - btcUsd.quote.price) / btcUsd.quote.price;
    }
  }, [btcUsd, krwBtc, krwx]);

  const ethKimp = useMemo(() => {
    if (krwx && krwEth && ethUsd?.quote) {
      const krwEthInUsd = krwEth.trade_price / krwx.data.price;
      return (krwEthInUsd - ethUsd.quote.price) / ethUsd.quote.price;
    }
  }, [ethUsd, krwEth, krwx]);

  const usdtKimp = useMemo(() => {
    if (krwx && krwUsdt) {
      return (krwUsdt.trade_price - krwx.data.price) / krwx.data.price;
    }
  }, [krwUsdt, krwx]);

  return (
    <FormatConfig krwShortUnits>
      <section>
        <dl>
          <dt>
            <strong>Crypto</strong>{' '}
            <MarketStateSymbol marketState={holdings.marketState} />
          </dt>
          <dd>
            <Format format="USD" n={holdings.gain.marketValue} />
          </dd>
          {btcUsd?.quote && (
            <>
              <dt data-depth="1">BTC-USD</dt>
              <dd>
                <Format format="USD" n={btcUsd.quote.price} />{' '}
                <sub>
                  (
                  <Format format="PERCENT" n={btcUsd.quote.changePercent} />
                  {' : '}
                  <Format format="INTEGER" n={btcUsd.fiftyTwoWeekRange.low} />
                  {' - '}
                  <Format format="INTEGER" n={btcUsd.fiftyTwoWeekRange.high} />)
                </sub>
              </dd>
            </>
          )}
          {ethUsd?.quote && (
            <>
              <dt data-depth="1">ETH-USD</dt>
              <dd>
                <Format format="USD" n={ethUsd.quote.price} />{' '}
                <sub>
                  (
                  <Format format="PERCENT" n={ethUsd.quote.changePercent} />
                  {' : '}
                  <Format format="INTEGER" n={ethUsd.fiftyTwoWeekRange.low} />
                  {' - '}
                  <Format format="INTEGER" n={ethUsd.fiftyTwoWeekRange.high} />)
                </sub>
              </dd>
            </>
          )}
          {btcKimp && (
            <>
              <dt data-depth="2">BTC KIMP</dt>
              <dd>
                <Format format="PERCENT_SIGN" n={btcKimp * 100} />{' '}
                <sub>
                  (<Format format="KRW" n={krwBtc?.trade_price} />)
                </sub>
              </dd>
            </>
          )}
          {ethKimp && (
            <>
              <dt data-depth="2">ETH KIMP</dt>
              <dd>
                <Format format="PERCENT_SIGN" n={ethKimp * 100} />{' '}
                <sub>
                  (<Format format="KRW" n={krwEth?.trade_price} />)
                </sub>
              </dd>
            </>
          )}
          {usdtKimp && (
            <>
              <dt data-depth="2">USDT KIMP</dt>
              <dd>
                <Format format="PERCENT_SIGN" n={usdtKimp * 100} />{' '}
                <sub>
                  (<Format format="KRW" n={krwUsdt?.trade_price} />)
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
    </FormatConfig>
  );
}
