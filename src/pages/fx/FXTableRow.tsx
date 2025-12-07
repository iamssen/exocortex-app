import type { Ratio } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { OutLink } from '@ui/components';
import { useQuoteInfo } from '@ui/data-utils';
import { QUOTE_HISTORY_SUMMARY_CONFIG } from '@ui/env';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import { useFXTable } from './FXTableContext.ts';

export interface FXTableRowProps {
  symbol: string;
  displayName?: string;
}

export function FXTableRow({
  symbol,
  displayName,
}: FXTableRowProps): ReactNode {
  const { format, cellColor } = useFXTable();

  const { links } = useQuoteInfo(symbol);
  const { data: quote } = useQuery(api(`finance/quote/${symbol}`));
  const { data: matches } = useQuery(
    api(`finance/quote-history-summary/${symbol}`),
  );

  if (!quote || !matches) {
    return null;
  }

  return (
    <tr>
      <th>
        <OutLink href={links.yahoo}>
          {displayName?.slice(0, 3) ?? symbol}
        </OutLink>
      </th>
      <th>
        <Format format={format} n={quote.data.price} />
      </th>
      {matches.data.map((m, i) => {
        let n: number;

        if (m.match === 'ranged') {
          const r1 = new Date(m.data[0].date).getTime();
          const r2 = new Date(m.data[1].date).getTime();
          const p = new Date(m.searchDate).getTime();

          const r = ((r2 - p) / (r2 - r1)) as Ratio;

          n = m.data[0].close * r + m.data[1].close * (1 - r);
        } else {
          n = m.data.close;
        }

        const updown = (quote.data.price - n) / n;

        return (
          <td
            data-duration={QUOTE_HISTORY_SUMMARY_CONFIG.at(i)?.duration}
            key={m.searchDate}
            style={{ backgroundColor: cellColor(updown) }}
          >
            <Format format="PERCENT_SIGN" n={updown * 100} />
            <br />
            <sub
              style={{ fontSize: '0.8em', opacity: 0.3, fontWeight: 'bold' }}
            >
              <Format format={format} n={n} />
            </sub>
          </td>
        );
      })}
    </tr>
  );
}
