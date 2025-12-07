import { Format } from '@iamssen/format';
import type { ExtendedSummary } from '@ui/data-utils';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface TotalGainProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> {
  summary: ExtendedSummary;
  totalGainDetail: 'show' | 'hide';
}

export function TotalGain({
  summary,
  totalGainDetail,
  ...props
}: TotalGainProps): ReactNode {
  return (
    <section {...props}>
      <h1>Market Value</h1>
      <Format data-id="market-value" format="KRW" n={summary.marketValue} />
      <dl>
        <dt>Risk</dt>
        <dd>
          <Format format="PERCENT" n={summary.risklessPercent} />
          {' : '}
          <Format
            format="PERCENT"
            n={summary.stocksPercent + summary.cryptoPercent}
          />
        </dd>
        <dt data-depth="1">Riskless</dt>
        <dd>
          <Format format="KRW" n={summary.risklessValue} />{' '}
          <sub>
            (<Format format="PERCENT" n={summary.risklessPercent} />)
          </sub>
        </dd>
        <dt data-depth="1">Stocks</dt>
        <dd>
          <Format format="KRW" n={summary.stocksValue} />{' '}
          <sub>
            (<Format format="PERCENT" n={summary.stocksPercent} />)
          </sub>
        </dd>
        <dt data-depth="1">Crypto</dt>
        <dd>
          <Format format="KRW" n={summary.cryptoValue} />{' '}
          <sub>
            (<Format format="PERCENT" n={summary.cryptoPercent} />)
          </sub>
        </dd>

        {totalGainDetail === 'show' && (
          <>
            <dt>Principal amount</dt>
            <dd>
              <Format format="KRW" n={summary.principal} />
            </dd>
            <dt data-depth="1">Purchase USD</dt>
            <dd>
              <Format format="KRW" n={summary.purchaseUSDKRW} />{' '}
              <sub>
                (
                <Format format="USD" n={summary.purchaseUSD} />)
              </sub>
            </dd>
            <dt data-depth="1">Purchase JPY</dt>
            <dd>
              <Format format="KRW" n={summary.purchaseJPYKRW} />{' '}
              <sub>
                (<Format format="JPY" n={summary.purchaseJPY} />)
              </sub>
            </dd>
          </>
        )}

        <dt>Total gain</dt>
        <dd>
          <Format format="KRW" n={summary.totalGain} />{' '}
          <sub>
            (<Format format="PERCENT" n={summary.totalGainPercent} />)
          </sub>
        </dd>
        <dt data-depth="1">USD gain</dt>
        <dd>
          <Format
            format="KRW"
            n={summary.currentUSDKRW - summary.purchaseUSDKRW}
          />{' '}
          <sub>
            (
            <Format format="USD" n={summary.currentUSD - summary.purchaseUSD} />
            )
          </sub>
        </dd>
        <dt data-depth="1">JPY gain</dt>
        <dd>
          <Format
            format="KRW"
            n={summary.currentJPYKRW - summary.purchaseJPYKRW}
          />{' '}
          <sub>
            (
            <Format format="JPY" n={summary.currentJPY - summary.purchaseJPY} />
            )
          </sub>
        </dd>
      </dl>
    </section>
  );
}
