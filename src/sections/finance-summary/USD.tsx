import type { Iso8601, KRW, Portfolio } from '@iamssen/exocortex';
import { sumBondsGain } from '@iamssen/exocortex/projector';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { api } from '@ui/query';
import { DateTime } from 'luxon';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { Fragment } from 'react';
import { BondsGainList } from './BondsGainList.tsx';
import { BondsList } from './BondsList.tsx';

export interface USDProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> {
  financeData: Portfolio;
  view: 'simple' | 'detail';
}

export function USD({ financeData, view, ...props }: USDProps): ReactNode {
  const { data: usdkrw } = useQuery(api('finance/quote/KRW=X'));

  const getCouponTax = usdkrw?.data
    ? (amount: number) => (amount * usdkrw.data.price * 0.154) as KRW
    : undefined;

  const staledBondsGain = new Map([
    [
      new Date().getFullYear(),
      sumBondsGain(
        financeData.bonds.us.list,
        DateTime.now().startOf('year').toISODate() as Iso8601,
        DateTime.now().toISODate() as Iso8601,
      ),
    ],
  ]);

  return (
    <section {...props}>
      <dl>
        <dt>
          <strong>USD</strong>
        </dt>
        <dd>
          <Format
            format="USD"
            n={
              financeData.balances.usd.totalAmount +
              financeData.bonds.us.totalPurchasePrice
            }
          />
        </dd>
        <dt>Balances</dt>
        <dd>
          <Format format="USD" n={financeData.balances.usd.totalAmount} />
        </dd>
        {view === 'detail' &&
          financeData.balances.usd.list.map(({ name, amount }) => (
            <Fragment key={`usd-balance-${name}`}>
              <dt data-depth="1">{name}</dt>
              <dd>
                <Format format="USD" n={amount} />
              </dd>
            </Fragment>
          ))}
        <dt>Bonds</dt>
        <dd>
          <Format format="USD" n={financeData.bonds.us.totalAmount} />
        </dd>
        {view === 'simple' && (
          <BondsGainList
            gain={financeData.bonds.us.gain}
            staledGain={staledBondsGain}
            currency="USD"
          />
        )}
        {view === 'detail' && (
          <BondsList
            list={financeData.bonds.us.list}
            currency="USD"
            getCouponTax={getCouponTax}
          />
        )}
      </dl>
    </section>
  );
}
