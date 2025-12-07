import type { DepositsGain } from '@iamssen/exocortex';
import { reduceDepositsGain } from '@iamssen/exocortex/projector';
import type { CurrencyType } from '@iamssen/format';
import { Format } from '@iamssen/format';
import { Fragment, type ReactNode, useMemo } from 'react';

export interface DepositsGainListProps {
  gain: DepositsGain[];
  staledGain: Map<number, { interestGain: number }>;
  currency: CurrencyType;
}

const filterFromYear = new Date().getFullYear();
const reduceFromYear = filterFromYear + 3;

export function DepositsGainList({
  gain,
  staledGain,
  currency,
}: DepositsGainListProps): ReactNode {
  const { before, after } = useMemo(() => {
    return reduceDepositsGain(gain, filterFromYear, reduceFromYear);
  }, [gain]);

  return (
    <>
      {before.map(({ year, interestGain }) => (
        <Fragment key={`deposits-gain-${year}`}>
          <dt data-depth="1">{year}</dt>
          <dd>
            {staledGain.has(year) &&
              (staledGain.get(year)?.interestGain ?? 0) > 0 && (
                <>
                  <Format
                    format={currency}
                    n={staledGain.get(year)?.interestGain}
                  />
                  {' / '}
                </>
              )}
            <Format format={currency} n={interestGain} />
          </dd>
        </Fragment>
      ))}
      <dt data-depth="1">
        {after.from} ~ {after.to}
      </dt>
      <dd>
        <Format format={currency} n={after.interestGain} />
      </dd>
    </>
  );
}
