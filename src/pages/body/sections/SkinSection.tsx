import type { Body, VersionData } from '@iamssen/exocortex';
import { useSuspenseQuery } from '@tanstack/react-query';
import { SkinChart } from '@ui/charts';
import type { DateItem } from '@ui/components';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import styles from '../BodySummaryPage.module.css';

export interface SkinSectionProps {
  chartStartDate: DateItem;
}

function selectData({ data }: VersionData<Body>) {
  return {
    daySkins: data.daySkins,
  };
}

export function SkinSection({ chartStartDate }: SkinSectionProps): ReactNode {
  const {
    data: { daySkins },
  } = useSuspenseQuery(
    api(
      'body',
      {},
      {
        select: selectData,
      },
    ),
  );

  if (!daySkins || daySkins.length === 0) {
    return null;
  }

  return (
    <figure aria-label="History of skin severity and pustules">
      <figcaption>
        Skin
        <sub aria-label="The date of the last collected data">
          {daySkins.at(-1)?.date}
        </sub>
      </figcaption>
      <SkinChart
        data={daySkins}
        className={styles.chart}
        start={chartStartDate.value}
      />
    </figure>
  );
}
