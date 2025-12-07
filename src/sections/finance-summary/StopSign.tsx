import type { FearAndGreed, Ratio } from '@iamssen/exocortex';
import { joinQuoteStatisticsAndQuote } from '@iamssen/exocortex/projector';
import { Format } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { api } from '@ui/query';
import { clsx } from 'clsx/lite';
import type { ReactNode } from 'react';
import { type DetailedHTMLProps, type HTMLAttributes, useMemo } from 'react';
import styles from './StopSign.module.css';

type Rating = 'over shooting' | 'under shooting' | 'neutral';

interface Status {
  rating: Rating;
  fearAndGreedRating: Rating;
  fiftyTwoWeekPositionOfSPYRating: Rating;
  sp500PeRating: Rating;
  fearAndGreed: FearAndGreed;
  fiftyTwoWeekPositionOfSPY: Ratio;
  sp500Pe: Ratio;
}

function check(
  fearAndGreed: FearAndGreed,
  fiftyTwoWeekPositionOfSPY: Ratio,
  sp500Pe: Ratio,
): Status {
  const fearAndGreedRating: Rating =
    fearAndGreed.rating === 'extreme greed'
      ? 'over shooting'
      : fearAndGreed.rating === 'extreme fear'
        ? 'under shooting'
        : 'neutral';
  const fiftyTwoWeekPositionOfSPYRating: Rating =
    fiftyTwoWeekPositionOfSPY >= 0.85
      ? 'over shooting'
      : fiftyTwoWeekPositionOfSPY <= 0.15
        ? 'under shooting'
        : 'neutral';
  const sp500PeRating: Rating =
    sp500Pe >= 30
      ? 'over shooting'
      : sp500Pe <= 22
        ? 'under shooting'
        : 'neutral';
  const rating: Rating =
    fearAndGreedRating === 'over shooting' &&
    fiftyTwoWeekPositionOfSPYRating === 'over shooting' &&
    sp500PeRating === 'over shooting'
      ? 'over shooting'
      : fearAndGreedRating === 'under shooting' &&
          fiftyTwoWeekPositionOfSPYRating === 'under shooting' &&
          sp500PeRating === 'under shooting'
        ? 'under shooting'
        : 'neutral';

  return {
    rating,
    fearAndGreedRating,
    fiftyTwoWeekPositionOfSPYRating,
    sp500PeRating,
    fearAndGreed,
    fiftyTwoWeekPositionOfSPY,
    sp500Pe,
  };
}

type StopSignProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

export function StopSign({ className, ...props }: StopSignProps): ReactNode {
  const { data: fearAndGreed } = useQuery(api('finance/fear-and-greed'));
  const { data: spyQuote } = useQuery(api(`finance/quote/SPY`));
  const { data: spyStatistic } = useQuery(api(`finance/quote-statistics/SPY`));

  const spy =
    spyStatistic?.data && spyQuote?.data
      ? joinQuoteStatisticsAndQuote(spyStatistic.data, spyQuote.data)
      : undefined;

  const { data: sp500PeData } = useQuery(api(`finance/sp500-pe`));

  const sp500Pe = sp500PeData ? sp500PeData.data.at(-1)?.value : undefined;

  const status = useMemo(() => {
    if (!fearAndGreed || !spy?.fiftyTwoWeekPosition || !sp500Pe) {
      console.error(`Status:`, JSON.stringify({ fearAndGreed, spy, sp500Pe }));
      return;
    }

    return check(fearAndGreed.data, spy.fiftyTwoWeekPosition, sp500Pe);
  }, [fearAndGreed, sp500Pe, spy]);

  if (!status) {
    return;
  }

  return (
    <section
      className={clsx(className, styles.style)}
      data-rating={status.rating}
      {...props}
    >
      <h3>
        {status.rating === 'over shooting' ? (
          <>🚀 OVER SHOOTING</>
        ) : status.rating === 'under shooting' ? (
          <>👌 UNDER SHOOTING</>
        ) : (
          <>NEUTRAL ✋ STOP BUY / SELL</>
        )}
      </h3>
      <ul>
        <li data-rating={status.fearAndGreedRating}>
          <data value={status.fearAndGreed.rating}>
            {status.fearAndGreed.rating.toUpperCase()}
            <sub>
              {' : '}
              {status.fearAndGreed.fearAndGreed.at(-1)?.value.toFixed(0)}
            </sub>
          </data>
        </li>
        <li data-rating={status.fiftyTwoWeekPositionOfSPYRating}>
          SPY <Format n={status.fiftyTwoWeekPositionOfSPY} />
        </li>
        <li data-rating={status.sp500PeRating}>
          S&P500 P/E <Format n={sp500Pe} />
        </li>
      </ul>
    </section>
  );
}
