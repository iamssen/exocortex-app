import { Format, FormatConfig } from '@iamssen/format';
import type { ExtendedSummary } from '@ui/data-utils';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface PortfolioDistributionProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> {
  summary: ExtendedSummary;
}

export function PortfolioDistribution({
  summary,
  ...props
}: PortfolioDistributionProps): ReactNode {
  return (
    <FormatConfig krwShortUnits>
      <section {...props}>
        <dl>
          <dt>
            <strong>Portfolio</strong>
          </dt>
          <dd></dd>

          <dt>
            USD{' '}
            <sub>
              (
              <Format
                format="KRW"
                n={
                  summary.ingredients.usd.cash +
                  summary.ingredients.usd.riskless +
                  summary.ingredients.usd.stocks
                }
              />
              )
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={
                ((summary.ingredients.usd.cash +
                  summary.ingredients.usd.riskless +
                  summary.ingredients.usd.stocks) /
                  summary.marketValue) *
                100
              }
            />
            <sub>
              {' → '}
              <Format
                format="PERCENT"
                n={
                  summary.ingredients.purpose.usd.cash +
                  summary.ingredients.purpose.usd.riskless +
                  summary.ingredients.purpose.usd.stocks
                }
              />
            </sub>
          </dd>
          <dt data-depth="1">
            Cash{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.usd.cash} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.usd.cash / summary.marketValue) * 100}
            />
            {' → '}
            <Format format="PERCENT" n={summary.ingredients.purpose.usd.cash} />
          </dd>
          <dt data-depth="1">
            Riskless{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.usd.riskless} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.usd.riskless / summary.marketValue) * 100}
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.usd.riskless}
            />
          </dd>
          <dt data-depth="1">
            Stocks{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.usd.stocks} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.usd.stocks / summary.marketValue) * 100}
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.usd.stocks}
            />
          </dd>

          <dt>
            KRW{' '}
            <sub>
              (
              <Format
                format="KRW"
                n={
                  summary.ingredients.krw.cash +
                  summary.ingredients.krw.riskless +
                  summary.ingredients.krw.stocks
                }
              />
              )
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={
                ((summary.ingredients.krw.cash +
                  summary.ingredients.krw.riskless +
                  summary.ingredients.krw.stocks) /
                  summary.marketValue) *
                100
              }
            />
            <sub>
              {' → '}
              <Format
                format="PERCENT"
                n={
                  summary.ingredients.purpose.krw.cash +
                  summary.ingredients.purpose.krw.riskless +
                  summary.ingredients.purpose.krw.stocks
                }
              />
            </sub>
          </dd>
          <dt data-depth="1">
            Cash{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.krw.cash} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.krw.cash / summary.marketValue) * 100}
            />
            {' → '}
            <Format format="PERCENT" n={summary.ingredients.purpose.krw.cash} />
          </dd>
          <dt data-depth="1">
            Riskless{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.krw.riskless} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.krw.riskless / summary.marketValue) * 100}
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.krw.riskless}
            />
          </dd>
          <dt data-depth="1">
            Stocks{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.krw.stocks} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.krw.stocks / summary.marketValue) * 100}
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.krw.stocks}
            />
          </dd>

          <dt>
            JPY{' '}
            <sub>
              (
              <Format
                format="KRW"
                n={
                  summary.ingredients.jpy.cash + summary.ingredients.jpy.stocks
                }
              />
              )
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={
                ((summary.ingredients.jpy.cash +
                  summary.ingredients.jpy.stocks) /
                  summary.marketValue) *
                100
              }
            />
            <sub>
              {' → '}
              <Format
                format="PERCENT"
                n={
                  summary.ingredients.purpose.jpy.cash +
                  summary.ingredients.purpose.jpy.stocks
                }
              />
            </sub>
          </dd>
          <dt data-depth="1">
            Cash{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.jpy.cash} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.jpy.cash / summary.marketValue) * 100}
            />
            {' → '}
            <Format format="PERCENT" n={summary.ingredients.purpose.jpy.cash} />
          </dd>
          <dt data-depth="1">
            Stocks{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.jpy.stocks} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.jpy.stocks / summary.marketValue) * 100}
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.jpy.stocks}
            />
          </dd>

          <dt>
            CRYPTO{' '}
            <sub>
              (
              <Format
                format="KRW"
                n={
                  summary.ingredients.crypto.stable +
                  summary.ingredients.crypto.coins
                }
              />
              )
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={
                ((summary.ingredients.crypto.stable +
                  summary.ingredients.crypto.coins) /
                  summary.marketValue) *
                100
              }
            />
            <sub>
              {' → '}
              <Format
                format="PERCENT"
                n={
                  summary.ingredients.purpose.crypto.stable +
                  summary.ingredients.purpose.crypto.coins
                }
              />
            </sub>
          </dd>
          <dt data-depth="1">
            Stable{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.crypto.stable} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={
                (summary.ingredients.crypto.stable / summary.marketValue) * 100
              }
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.crypto.stable}
            />
          </dd>
          <dt data-depth="1">
            Coins{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.crypto.coins} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.crypto.coins / summary.marketValue) * 100}
            />
            {' → '}
            <Format
              format="PERCENT"
              n={summary.ingredients.purpose.crypto.coins}
            />
          </dd>

          <dt>
            HOUSING{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.housing} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.housing / summary.marketValue) * 100}
            />
            <sub>
              {' → '}
              <Format
                format="PERCENT"
                n={summary.ingredients.purpose.housing}
              />
            </sub>
          </dd>

          <dt>
            GOLD{' '}
            <sub>
              (
              <Format format="KRW" n={summary.ingredients.gold} />)
            </sub>
          </dt>
          <dd>
            <Format
              format="PERCENT"
              n={(summary.ingredients.gold / summary.marketValue) * 100}
            />
            <sub>
              {' → '}
              <Format format="PERCENT" n={summary.ingredients.purpose.gold} />
            </sub>
          </dd>
        </dl>
      </section>
    </FormatConfig>
  );
}
