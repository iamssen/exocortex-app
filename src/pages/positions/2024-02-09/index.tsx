import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { PositionBar } from '@ui/charts';
import { TradesGrid } from '@ui/grids';
import { api } from '@ui/query';
import { clsx } from 'clsx/lite';
import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import styles from '../PositionsPage.module.css';
import { targets, useAggregate, usePosition, useTotalAmount } from './data.ts';

export function Position20240209(): ReactNode {
  const position = usePosition();
  const agg = useAggregate(position?.initialSellTrades);
  const initialSell = useTotalAmount(position?.initialSellTrades);
  const rebuyAfterDrop = useTotalAmount(position?.rebuyAfterDropTrades);
  const intermediate = useTotalAmount(position?.intermediateTrades);

  const { data: description } = useQuery(api('position/2024-02-09'));

  return (
    <article className={styles.article}>
      {position && (
        <>
          <header className={styles.header}>
            <table>
              <thead>
                <tr>
                  <th>Trade</th>
                  <th>Current</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Format format="USD" n={initialSell.tradeAmount} />
                  </td>
                  <td>
                    <Format format="USD" n={initialSell.currentAmount} />
                  </td>
                  <td>
                    <Format format="USD" n={initialSell.gain} />
                  </td>
                  <td>
                    <sub>
                      (
                      <Format
                        format="PERCENT_SIGN"
                        n={initialSell.gainRatio * 100}
                      />
                      )
                    </sub>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Format format="USD" n={intermediate.tradeAmount} />
                  </td>
                  <td>
                    <Format format="USD" n={intermediate.currentAmount} />
                  </td>
                  <td>
                    <Format format="USD" n={intermediate.gain} />
                  </td>
                  <td>
                    <sub>
                      (
                      <Format
                        format="PERCENT_SIGN"
                        n={intermediate.gainRatio * 100}
                      />
                      )
                    </sub>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Format format="USD" n={rebuyAfterDrop.tradeAmount} />
                  </td>
                  <td>
                    <Format format="USD" n={rebuyAfterDrop.currentAmount} />
                  </td>
                  <td>
                    <Format format="USD" n={rebuyAfterDrop.gain} />
                  </td>
                  <td>
                    <sub>
                      (
                      <Format
                        format="PERCENT_SIGN"
                        n={rebuyAfterDrop.gainRatio * 100}
                      />
                      )
                    </sub>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    <Format
                      format="USD"
                      n={
                        initialSell.gain +
                        intermediate.gain +
                        rebuyAfterDrop.gain
                      }
                    />
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </header>

          <PositionBar
            currency="USD"
            trade={agg.tradeAmount}
            current={agg.currentAmount}
            children={agg.children}
            targets={targets}
          />

          <TradesGrid
            className={styles.grid}
            currency="USD"
            portfolio="us"
            rows={position.initialSellTrades}
            style={{
              height: 25 * 10,
              maxHeight: '40vh',
              marginTop: 20,
            }}
          />

          <TradesGrid
            className={styles.grid}
            currency="USD"
            portfolio="us"
            rows={position.intermediateTrades}
            style={{
              height: 25 * 10,
              maxHeight: '40vh',
              marginTop: 20,
            }}
          />

          <TradesGrid
            className={styles.grid}
            currency="USD"
            portfolio="us"
            rows={position.rebuyAfterDropTrades}
            style={{
              height: 25 * 9,
              maxHeight: '40vh',
              marginTop: 20,
            }}
          />
        </>
      )}

      {description && (
        <article className={clsx('markdown-body', styles.description)}>
          <Markdown remarkPlugins={[gfm]}>{description}</Markdown>
        </article>
      )}
    </article>
  );
}

export function Badge20240209(): ReactNode {
  const position = usePosition();
  const agg = useAggregate(position?.initialSellTrades);

  return (
    <figure className={styles.badge}>
      <PositionBar
        currency="USD"
        trade={agg.tradeAmount}
        current={agg.currentAmount}
        children={agg.children}
        targets={targets}
        height={85}
        baseline={45}
      />
      <figcaption>
        US MARKET SELL 10% <time dateTime="2024-02-09">2024-02-09</time>{' '}
        <Format format="USD" n={agg.gain} />{' '}
        <sub>
          (
          <Format format="PERCENT_SIGN" n={agg.gainRatio * 100} />)
        </sub>
      </figcaption>
    </figure>
  );
}
