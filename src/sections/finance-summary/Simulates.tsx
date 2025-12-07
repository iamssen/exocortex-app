import type { ExpiryData, Quote } from '@iamssen/exocortex';
import { Format, FormatConfig } from '@iamssen/format';
import type { ExtendedSummary } from '@ui/data-utils';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { Fragment } from 'react';

export interface SimulatesProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> {
  summary: ExtendedSummary;
  usdkrw: ExpiryData<Quote> | undefined;
  jpykrw: ExpiryData<Quote> | undefined;
  quotes: Map<string, Quote>;
}

export function Simulates({
  summary,
  usdkrw,
  jpykrw,
  quotes,
  ...props
}: SimulatesProps): ReactNode {
  if (!summary.simulates) {
    return null;
  }

  return (
    <FormatConfig krwShortUnits>
      <section {...props}>
        <dl>
          <dt>
            <strong>Simulation</strong>
          </dt>
          <dd></dd>
          <dt>Current</dt>
          <dd>
            <sub>
              <Format n={usdkrw?.data.price} />,{' '}
              <Format n={jpykrw?.data.price} />,{' '}
              <Format n={quotes.get('SPY')?.price} />
            </sub>
          </dd>
          {summary && (
            <>
              <dt data-depth="1">Total gain</dt>
              <dd>
                <Format format="KRW" n={summary.totalGain} /> (
                <Format format="PERCENT" n={summary.totalGainPercent} />)
              </dd>
            </>
          )}
          {summary.simulates.map(
            ({
              name,
              usd,
              jpy,
              rise,
              spyPrice,
              totalGain,
              totalGainPercent,
              changeRisk,
            }) => (
              <Fragment key={`simulate-${name}`}>
                <dt>{name}</dt>
                <dd>
                  <sub>
                    <Format n={usd} />, <Format n={jpy} />,{' '}
                    <Format n={spyPrice} /> (
                    <Format format="PERCENT" n={(rise - 1) * 100} />)
                  </sub>
                </dd>
                <dt data-depth="1">Total gain</dt>
                <dd>
                  <Format format="KRW" n={totalGain} />{' '}
                  <sub>
                    (
                    <Format format="PERCENT" n={totalGainPercent} />)
                  </sub>
                </dd>
                {changeRisk.map((item) => {
                  const rowStyle =
                    item.totalGainPercent - totalGainPercent > 0.4
                      ? undefined
                      : { opacity: 0.15 };

                  return (
                    <Fragment key={`simulate-${name}-${item.riskPercent}`}>
                      <dt data-depth="1" style={rowStyle}>
                        Risk{' '}
                        <Format format="PERCENT_SIGN" n={item.riskPercent} />{' '}
                        <Format format="KRW" n={item.riskAmount} />
                      </dt>
                      <dd style={rowStyle}>
                        <Format format="KRW" n={item.totalGain} />{' '}
                        <sub>
                          (
                          <Format format="PERCENT" n={item.totalGainPercent} />)
                        </sub>
                      </dd>
                    </Fragment>
                  );
                })}
              </Fragment>
            ),
          )}
        </dl>
      </section>
    </FormatConfig>
  );
}
