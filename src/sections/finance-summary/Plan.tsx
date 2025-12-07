import { Format, FormatConfig } from '@iamssen/format';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export interface PlanProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> {
  marketValue: number;
  investment: number;
}

export function Plan({
  marketValue,
  investment,
  ...props
}: PlanProps): ReactNode {
  const buyNewCar = 120_000_000;
  const buyNewHouse = 920_000_000;
  const availableAmount = marketValue - buyNewCar - buyNewHouse;
  const travelPerYear = 10_000_000;
  const livingCostPerMonth = 4_000_000;
  const availableYears =
    availableAmount / (travelPerYear + livingCostPerMonth * 12);
  const untilWhatAge = new Date().getFullYear() - 1980 + availableYears;
  const availableYearsResellHouse =
    (availableAmount + buyNewHouse) / (travelPerYear + livingCostPerMonth * 12);
  const untilWhatAgeResellHouse =
    new Date().getFullYear() - 1980 + availableYearsResellHouse;
  const availableYearsWithoutInvestment =
    (availableAmount - investment) / (travelPerYear + livingCostPerMonth * 12);

  return (
    <FormatConfig krwShortUnits>
      <section {...props}>
        <dl>
          <dt>
            <strong>Plan</strong>
          </dt>
          <dd></dd>

          <dt>Market value</dt>
          <dd>
            <Format format="KRW" n={marketValue} />
          </dd>
          <dt data-depth="1">Buy new car</dt>
          <dd>
            <Format format="KRW" n={-buyNewCar} />
          </dd>
          <dt data-depth="1">Buy new house</dt>
          <dd>
            <Format format="KRW" n={-buyNewHouse} />
          </dd>

          <dt>Available amount</dt>
          <dd>
            = <Format format="KRW" n={availableAmount} />
          </dd>
          <dt data-depth="1">Travel / Year</dt>
          <dd>
            <Format format="KRW" n={-travelPerYear} />
          </dd>
          <dt data-depth="1">Living cost / Month</dt>
          <dd>
            <Format format="KRW" n={-livingCostPerMonth} />
          </dd>

          <dt>Available years</dt>
          <dd>
            = <Format n={availableYears} />{' '}
            <sub>
              (<Format n={untilWhatAge} /> olds)
            </sub>
          </dd>
          <dt data-depth="1">Resell house</dt>
          <dd>
            = <Format n={availableYearsResellHouse} />{' '}
            <sub>
              (<Format n={untilWhatAgeResellHouse} /> olds)
            </sub>
          </dd>
          <dt style={{ letterSpacing: -0.7 }}>
            Living years without investment
          </dt>
          <dd>
            <Format n={availableYearsWithoutInvestment} />
          </dd>
        </dl>
      </section>
    </FormatConfig>
  );
}
