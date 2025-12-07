import type { BondsGain } from '@iamssen/exocortex';
import { reduceBondsGain } from '@iamssen/exocortex/projector';
import type { CurrencyType } from '@iamssen/format';
import { Format } from '@iamssen/format';
import { Fragment, type ReactNode, useMemo } from 'react';

export interface BondsGainListProps {
  gain: BondsGain[];
  staledGain: Map<number, { maturityGain: number; couponsGain: number }>;
  currency: CurrencyType;
}

const filterFromYear = new Date().getFullYear();
const reduceFromYear = filterFromYear + 3;

export function BondsGainList({
  gain,
  staledGain,
  currency,
}: BondsGainListProps): ReactNode {
  const { before, after } = useMemo(() => {
    return reduceBondsGain(gain, filterFromYear, reduceFromYear);
  }, [gain]);

  return (
    <>
      {before.map(({ year, couponGain, maturityGain }) => (
        <Fragment key={`bonds-gain-${year}`}>
          <dt data-depth="1">{year}</dt>
          <dd>
            {staledGain.has(year) &&
              ((staledGain.get(year)?.maturityGain ?? 0) > 0 ||
                (staledGain.get(year)?.couponsGain ?? 0) > 0) && (
                <>
                  <Format
                    format={currency}
                    n={
                      (staledGain.get(year)?.maturityGain ?? 0) +
                      (staledGain.get(year)?.couponsGain ?? 0)
                    }
                  />
                  {' / '}
                </>
              )}
            <Format format={currency} n={couponGain + maturityGain} />
          </dd>
        </Fragment>
      ))}
      <dt data-depth="1">
        {after.from} ~ {after.to}
      </dt>
      <dd>
        <Format format={currency} n={after.couponGain + after.maturityGain} />
      </dd>
    </>
  );
}
