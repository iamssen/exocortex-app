import { FormatConfig } from '@iamssen/format';
import { useQuery } from '@tanstack/react-query';
import { api } from '@ui/query';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Page } from '../../Page.tsx';
import styles from './HoldingsPage.module.css';
import { View } from './View.tsx';

export function HoldingsPage(): ReactNode {
  const { data: usdkrw } = useQuery(api('finance/quote/KRW=X'));
  const { data: jpykrw } = useQuery(api('finance/quote/JPYKRW=X'));

  return (
    <Page layout="fixed" className={styles.article}>
      <FormatConfig krwShortUnits>
        <Routes>
          <Route
            path="us"
            element={
              <View
                portfolio="us"
                currency="USD"
                krwExchangeRate={usdkrw?.data}
              />
            }
          />
          <Route
            path="kr"
            element={<View portfolio="kr" currency="KRW" printDisplayName />}
          />
          <Route
            path="jp"
            element={
              <View
                portfolio="jp"
                currency="JPY"
                krwExchangeRate={jpykrw?.data}
                printDisplayName
              />
            }
          />
          <Route path="fx" element={<View portfolio="fx" currency="KRW" />} />
          <Route
            path="crypto"
            element={
              <View
                portfolio="crypto"
                currency="USD"
                krwExchangeRate={usdkrw?.data}
              />
            }
          />
          <Route path="*" element={<Navigate replace to="us" />} />
        </Routes>
      </FormatConfig>
    </Page>
  );
}
