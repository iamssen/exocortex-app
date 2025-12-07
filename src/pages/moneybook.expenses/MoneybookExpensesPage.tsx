import type { DESC, MoneybookHistory } from '@iamssen/exocortex';
import { FormatConfig } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { FilterTextForm } from '@ui/components';
import { filterMoneybookHistory, useScreen } from '@ui/data-utils';
import { MoneybookHistoryGrid } from '@ui/grids';
import { api } from '@ui/query';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { Page } from '../../Page.tsx';
import styles from './MoneybookExpenses.module.css';

export function MoneybookExpensesPage(): ReactNode {
  const { screen } = useScreen();

  const { data: { data } = {} } = useQuery(api('moneybook'));

  const expenses = useMemo<DESC<MoneybookHistory> | undefined>(() => {
    if (!data) {
      return undefined;
    }
    return data.expenses.toReversed() as DESC<MoneybookHistory>;
  }, [data]);

  const [filterText, setFilterText] = useState('');

  const onFilterTextChange = useCallback((nextFilterText: string) => {
    setFilterText(nextFilterText);
  }, []);

  const rows = useMemo(
    () => (expenses ? filterMoneybookHistory(expenses, filterText) : undefined),
    [expenses, filterText],
  );

  if (!rows) {
    return null;
  }

  return (
    <Page layout="fixed" className={styles.article}>
      <FormatConfig krwShortUnits>
        <MoneybookHistoryGrid role="grid" rows={rows} />
        <search>
          <FilterTextForm
            placeholderText="Search --category --from --to --min --max"
            filterText={filterText}
            onChange={onFilterTextChange}
            autoFocus={screen === 'desktop'}
          />
        </search>
      </FormatConfig>
    </Page>
  );
}
