import { Format, FormatConfig } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { EventExpensesChart } from '@ui/charts';
import { FilterTextForm } from '@ui/components';
import { filterMoneybookHistory, useScreen } from '@ui/data-utils';
import { MoneybookHistoryGrid } from '@ui/grids';
import { api } from '@ui/query';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { DataGridHandle } from 'react-data-grid';
import { Link, useParams } from 'react-router';
import { Page } from '../../Page.tsx';
import { Categories } from './Categories.tsx';
import styles from './MoneybookEventPage.module.css';

export function MoneybookEventPage(): ReactNode {
  const { screen } = useScreen();

  const { '*': event } = useParams<{ '*': string }>();

  const { data } = useQuery(api('moneybook'));

  const selectedEvent = useMemo(() => {
    return data?.data.events.find(({ name }) => event === name);
  }, [data?.data.events, event]);

  const [filterText, setFilterText] = useState('');

  const onFilterTextChange = useCallback((nextFilterText: string) => {
    setFilterText(nextFilterText);
  }, []);

  const rows = useMemo(
    () =>
      selectedEvent
        ? filterMoneybookHistory(selectedEvent.children, filterText)
        : undefined,
    [filterText, selectedEvent],
  );

  const colors = useMemo(() => {
    const topItems = new Set<string>(
      selectedEvent?.children.map(({ category }) => category.split('/')[0]),
    );

    return scaleOrdinal([...topItems], schemeTableau10);
  }, [selectedEvent?.children]);

  const gridRef = useRef<DataGridHandle>(null);

  const onCategorySelect = useCallback((category: string) => {
    setFilterText(`--category ${category}`);
  }, []);

  if (!selectedEvent) {
    return null;
  }

  return (
    <Page layout="fixed" className={styles.article}>
      <FormatConfig krwShortUnits>
        <header className={styles.header}>
          <h1>{event && <EventPaths event={event} />}</h1>

          <h2>
            <Format format="KRW" n={selectedEvent.total} />
          </h2>
        </header>

        <Categories
          history={selectedEvent.children}
          colors={colors}
          onSelect={onCategorySelect}
        />

        <EventExpensesChart
          className={styles.chart}
          history={selectedEvent.children}
          colors={colors}
        />

        {rows && (
          <MoneybookHistoryGrid
            gridRef={gridRef}
            className={styles.grid}
            rows={rows}
            currentEvent={event}
          />
        )}

        <search>
          <FilterTextForm
            filterText={filterText}
            placeholderText="Search --category --from --to --min --max"
            onChange={onFilterTextChange}
            autoFocus={screen === 'desktop'}
          />
        </search>
      </FormatConfig>
    </Page>
  );
}

function EventPaths({ event }: { event: string }) {
  const paths = event.split('/');

  if (paths.length <= 1) {
    return <span>{event}</span>;
  }

  const nodes: ReactElement[] = [
    <span key={`path-${paths.at(-1)}`}>/{paths.at(-1)}</span>,
  ];

  let i: number = paths.length - 1;
  while (--i >= 0) {
    const str = paths[i];
    const to = `/moneybook/event/${paths.slice(0, i + 1).join('/')}`;
    nodes.push(
      <Link key={`path-${str}`} to={to}>
        {i > 0 && '/'}
        {str}
      </Link>,
    );
  }

  return nodes.toReversed();
}
