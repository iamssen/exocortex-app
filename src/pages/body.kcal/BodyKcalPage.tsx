import { useDialog } from '@iamssen/dialog';
import type { ASC, DESC, MonthlyBody, WeeklyBody } from '@iamssen/exocortex';
import { useQuery } from '@tanstack/react-query';
import { KcalChart } from '@ui/charts';
import { WeeklyKcalGrid } from '@ui/grids';
import { api } from '@ui/query';
import { type ReactNode, useCallback, useMemo } from 'react';
import type { CellSelectArgs } from 'react-data-grid';
import { Page } from '../../Page.tsx';
import styles from './BodyKcalPage.module.css';
import { DayKcalDialog } from './DayKcalDialog.tsx';

export function BodyKcalPage(): ReactNode {
  const { data: { data } = {} } = useQuery(api('body'));

  const [openDetail, detailElement] = useDialog(DayKcalDialog);

  const months = useMemo(() => {
    return data?.months.filter((d) => typeof d.avgDayKcal === 'number') as
      | ASC<MonthlyBody>
      | undefined;
  }, [data?.months]);

  const weeks = useMemo(() => {
    return data?.weeks
      .filter((d) => typeof d.avgDayKcal === 'number')
      .toReversed() as DESC<WeeklyBody> | undefined;
  }, [data?.weeks]);

  const onCellClick = useCallback(
    ({ column, row }: CellSelectArgs<WeeklyBody>) => {
      const dayKcal = row?.dayKcals[column.idx - 1];

      if (dayKcal) {
        openDetail({ dayKcal });
      } else {
        globalThis.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape' }),
        );
      }
    },
    [openDetail],
  );

  if (!months || !weeks) {
    return null;
  }

  return (
    <Page layout="fixed" className={styles.style}>
      <KcalChart role="figure" data={months} />
      <WeeklyKcalGrid role="grid" rows={weeks} onCellClick={onCellClick} />
      {detailElement}
    </Page>
  );
}
