import type { AggregatedMoneybook, ASC, Iso8601 } from '@iamssen/exocortex';
import { FormatConfig, useFormat } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { StackedLegend, useStackedLegend } from '@ui/cartesian-chart';
import { MoneybookChart, MoneybookSummaryChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import {
  SingleDateSelect,
  toDateItem,
  useSingleDateState,
} from '@ui/components';
import { useSummary } from '@ui/data-utils';
import { api } from '@ui/query';
import { DateTime } from 'luxon';
import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router';
import { moneybookChartStartDurations } from '../../env.ts';
import { Page } from '../../Page.tsx';
import { HierarchyEvents } from './HierarchyEvents.tsx';
import styles from './MoneybookSummaryPage.module.css';
import {
  cryptoSummaryQuery,
  foodQuery,
  investQuery,
  jpySummaryQuery,
  krwSummaryQuery,
  lifeQuery,
  summaryQuery,
  totalQuery,
  usdSummaryQuery,
} from './queries.ts';

export function MoneybookSummaryPage(): ReactNode {
  const krwFormat = useFormat('KRW');
  const jpyFormat = useFormat('JPY');
  const usdFormat = useFormat('USD');

  const { data: { data } = {} } = useQuery(api('moneybook'));
  const { data: { data: summaryHistory } = {} } = useQuery(
    api('portfolio-history'),
  );
  const { summary: currentSummary } = useSummary();

  const summary = useMemo(() => {
    if (!!summaryHistory && !!currentSummary) {
      return {
        ...summaryHistory,
        [DateTime.now().toISODate()]: currentSummary,
      };
    }

    return summaryHistory;
  }, [currentSummary, summaryHistory]);

  const dataStartMonth = useMemo(() => {
    return data?.monthlyExpenses[0].month;
  }, [data?.monthlyExpenses]);

  const chartStartDates = useMemo<DateItem[]>(() => {
    return [
      ...moneybookChartStartDurations.map(toDateItem),
      ...(dataStartMonth ? [{ label: 'ALL', value: dataStartMonth }] : []),
    ];
  }, [dataStartMonth]);

  const [chartStartDate, setChartStartDate] = useSingleDateState(
    'moneybook_start_date',
    chartStartDates,
    ({ label }) => label === '2Y',
  );

  const period = useMemo<'month' | 'year'>(() => {
    return Math.abs(
      DateTime.fromISO(chartStartDate.value).diffNow('months').months,
    ) < 25
      ? 'month'
      : 'year';
  }, [chartStartDate.value]);

  const endDate = useMemo(() => {
    const date =
      period === 'month'
        ? DateTime.now().toISO({ suppressMilliseconds: true })
        : DateTime.now().endOf('year').toISO({ suppressMilliseconds: true });

    return date as Iso8601;
  }, [period]);

  const chartData = useMemo<ASC<AggregatedMoneybook> | undefined>(() => {
    if (!data) {
      return undefined;
    }

    return period === 'month' ? data.monthlyExpenses : data.yearlyExpenses;
  }, [data, period]);

  const [
    selectedSummaryQueryNames,
    onSelectSummaryQueryName,
    selectedSummaryQuery,
  ] = useStackedLegend('moneybook-summary-query', summaryQuery);

  const [
    selectedUsdSummaryQueryNames,
    onSelectUsdSummaryQueryName,
    selectedUsdSummaryQuery,
  ] = useStackedLegend('moneybook-usd-summary-query', usdSummaryQuery);

  const [
    selectedJpySummaryQueryNames,
    onSelectJpySummaryQueryName,
    selectedJpySummaryQuery,
  ] = useStackedLegend('moneybook-jpy-summary-query', jpySummaryQuery);

  const [
    selectedKrwSummaryQueryNames,
    onSelectKrwSummaryQueryName,
    selectedKrwSummaryQuery,
  ] = useStackedLegend('moneybook-krw-summary-query', krwSummaryQuery);

  const [
    selectedCryptoSummaryQueryNames,
    onSelectCryptoSummaryQueryName,
    selectedCryptoSummaryQuery,
  ] = useStackedLegend('moneybook-crypto-summary-query', cryptoSummaryQuery);

  const [selectedTotalQueryNames, onSelectTotalQueryName, selectedTotalQuery] =
    useStackedLegend('moneybook-total-query', totalQuery);

  const [selectedFoodQueryNames, onSelectFoodQueryName, selectedFoodQuery] =
    useStackedLegend('moneybook-food-query', foodQuery);

  const [selectedLifeQueryNames, onSelectLifeQueryName, selectedLifeQuery] =
    useStackedLegend('moneybook-life-query', lifeQuery);

  const [
    selectedInvestQueryNames,
    onSelectInvestQueryName,
    selectedInvestQuery,
  ] = useStackedLegend('moneybook-invest-query', investQuery);

  return (
    <Page layout="scrollable" className={styles.style}>
      <FormatConfig krwShortUnits>
        <SingleDateSelect
          className={styles.dateSelection}
          dates={chartStartDates}
          selectedDate={chartStartDate}
          onChange={setChartStartDate}
        />

        {chartData && (
          <section>
            <StackedLegend
              data={totalQuery}
              selectedNames={selectedTotalQueryNames}
              onSelectNames={onSelectTotalQueryName}
            />
            <MoneybookChart
              data={chartData}
              queries={selectedTotalQuery}
              className={styles.chart}
              start={chartStartDate.value}
              end={endDate}
            />
          </section>
        )}

        {chartData && (
          <section>
            <StackedLegend
              data={foodQuery}
              selectedNames={selectedFoodQueryNames}
              onSelectNames={onSelectFoodQueryName}
            />
            <MoneybookChart
              data={chartData}
              queries={selectedFoodQuery}
              className={styles.chart}
              start={chartStartDate.value}
              end={endDate}
            />
          </section>
        )}

        {chartData && (
          <section>
            <StackedLegend
              data={lifeQuery}
              selectedNames={selectedLifeQueryNames}
              onSelectNames={onSelectLifeQueryName}
            />
            <MoneybookChart
              data={chartData}
              queries={selectedLifeQuery}
              className={styles.chart}
              start={chartStartDate.value}
              end={endDate}
            />
          </section>
        )}

        {chartData && (
          <section>
            <StackedLegend
              data={investQuery}
              selectedNames={selectedInvestQueryNames}
              onSelectNames={onSelectInvestQueryName}
            />
            <MoneybookChart
              data={chartData}
              queries={selectedInvestQuery}
              className={styles.chart}
              start={chartStartDate.value}
              end={endDate}
            />
          </section>
        )}

        {summary && (
          <>
            <section>
              <StackedLegend
                data={summaryQuery}
                selectedNames={selectedSummaryQueryNames}
                onSelectNames={onSelectSummaryQueryName}
              />
              <MoneybookSummaryChart
                format={krwFormat}
                data={summary}
                queries={selectedSummaryQuery}
                className={styles.summaryChart}
                start={chartStartDate.value}
                end={endDate}
              />
            </section>
            <section>
              <StackedLegend
                data={usdSummaryQuery}
                selectedNames={selectedUsdSummaryQueryNames}
                onSelectNames={onSelectUsdSummaryQueryName}
              />
              <MoneybookSummaryChart
                format={usdFormat}
                data={summary}
                queries={selectedUsdSummaryQuery}
                className={styles.currencySummaryChart}
                start={chartStartDate.value}
                end={endDate}
              />
            </section>
            <section>
              <StackedLegend
                data={jpySummaryQuery}
                selectedNames={selectedJpySummaryQueryNames}
                onSelectNames={onSelectJpySummaryQueryName}
              />
              <MoneybookSummaryChart
                format={jpyFormat}
                data={summary}
                queries={selectedJpySummaryQuery}
                className={styles.currencySummaryChart}
                start={chartStartDate.value}
                end={endDate}
              />
            </section>
            <section>
              <StackedLegend
                data={krwSummaryQuery}
                selectedNames={selectedKrwSummaryQueryNames}
                onSelectNames={onSelectKrwSummaryQueryName}
              />
              <MoneybookSummaryChart
                format={krwFormat}
                data={summary}
                queries={selectedKrwSummaryQuery}
                className={styles.currencySummaryChart}
                start={chartStartDate.value}
                end={endDate}
              />
            </section>
            <section>
              <StackedLegend
                data={cryptoSummaryQuery}
                selectedNames={selectedCryptoSummaryQueryNames}
                onSelectNames={onSelectCryptoSummaryQueryName}
              />
              <MoneybookSummaryChart
                format={usdFormat}
                data={summary}
                queries={selectedCryptoSummaryQuery}
                className={styles.currencySummaryChart}
                start={chartStartDate.value}
                end={endDate}
              />
            </section>
          </>
        )}

        <section className={styles.events}>
          <div>
            <Link to="./expenses">ALL EXPENSES</Link>
          </div>
          {data?.events && <HierarchyEvents data={data?.events} />}
        </section>
      </FormatConfig>
    </Page>
  );
}
