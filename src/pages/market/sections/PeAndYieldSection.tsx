import type { ExpiryData, PeAndYields } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import type { ReactNode } from 'react';
import styles from '../MarketPage.module.css';

export interface PeAndYieldSectionProps {
  data: ExpiryData<PeAndYields[]>;
}

export function PeAndYieldSection({ data }: PeAndYieldSectionProps): ReactNode {
  return (
    <table className={styles.peAndYields}>
      <colgroup className="my-colgroup">
        <col />
        <col />
        <col />
        <col />
        <col />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th>{data.refreshDate.slice(0, 10)}</th>
          <th>P/E</th>
          <th>52W AGO</th>
          <th>ESTIMATE</th>
          <th>YIELD</th>
          <th>52W AGO</th>
        </tr>
      </thead>
      <tbody>
        {data.data.map((r) => {
          const maxPe = Math.max(
            r.priceEarningsRatio,
            r.priceEarningsRatio52WeekAgo,
            r.priceEarningsRatioEstimate,
          );
          const maxYields = Math.max(r.yield, r.yield52WeekAgo);

          return (
            <tr
              key={r.name}
              data-label={`${r.ticker}: ${r.name}`}
              title={r.name}
            >
              <th>
                <a
                  href="https://www.wsj.com/market-data/stocks/peyields"
                  target="_blank"
                  rel="noreferrer"
                >
                  {r.name}
                </a>
              </th>
              <td data-highest={r.priceEarningsRatio === maxPe}>
                <Format n={r.priceEarningsRatio} />
              </td>
              <td data-highest={r.priceEarningsRatio52WeekAgo === maxPe}>
                <Format n={r.priceEarningsRatio52WeekAgo} />
              </td>
              <td data-highest={r.priceEarningsRatioEstimate === maxPe}>
                <Format n={r.priceEarningsRatioEstimate} />
              </td>
              <td data-highest={r.yield === maxYields}>
                <Format format="PERCENT" n={r.yield} />
              </td>
              <td data-highest={r.yield52WeekAgo === maxYields}>
                <Format format="PERCENT" n={r.yield52WeekAgo} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
