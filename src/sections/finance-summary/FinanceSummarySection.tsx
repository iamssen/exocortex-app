import { useLocalStorage } from '@iamssen/use-local-storage';
import { useSummary } from '@ui/data-utils';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { PositionList } from '../../pages/positions/PositionsPage.tsx';
import { Crypto } from './Crypto.tsx';
import component from './FinanceSummarySection.module.css';
import { FX } from './FX.tsx';
import { JP } from './JP.tsx';
import { KR } from './KR.tsx';
import { KRW } from './KRW.tsx';
import { Plan } from './Plan.tsx';
import { PortfolioDistribution } from './PortfolioDistribution.tsx';
import { Separator } from './Separator.tsx';
import { Simulates } from './Simulates.tsx';
import { StopSign } from './StopSign.tsx';
import { TotalGain } from './TotalGain.tsx';
import { US } from './US.tsx';
import { USD } from './USD.tsx';

export function FinanceSummarySection(): ReactNode {
  const [totalGainDetail, setTotalGainDetail] = useLocalStorage<
    'show' | 'hide'
  >('summary_total_gain_detail', () => 'hide');

  const [krwView, setKrwView] = useLocalStorage<'simple' | 'detail'>(
    'summary_krw_view',
    () => 'simple',
  );

  const [usdView, setUsdView] = useLocalStorage<'simple' | 'detail'>(
    'summary_usd_view',
    () => 'simple',
  );

  const {
    financeData,
    usdkrw,
    jpykrw,
    quotes,
    fxUSD,
    fxJPY,
    us,
    kr,
    jp,
    crypto,
    summary,
    otherCurrencies,
    otherCurrenciesTotalAmount,
  } = useSummary();

  return (
    <section className={component.style} aria-label="Summary of important data">
      {summary && (
        <TotalGain
          aria-label="Total gain: Total assets and overall gain"
          summary={summary}
          data-section="total-gain"
          totalGainDetail={totalGainDetail}
          onDoubleClick={() =>
            setTotalGainDetail((prev) => (prev === 'show' ? 'hide' : 'show'))
          }
        />
      )}

      <StopSign aria-label="Stop sign: Investment decision analysis results" />

      {fxUSD && fxJPY && (
        <NavLink to="/holdings/fx">
          <FX
            usd={fxUSD}
            jpy={fxJPY}
            otherCurrencies={otherCurrencies}
            otherCurrenciesTotalAmount={otherCurrenciesTotalAmount}
          />
        </NavLink>
      )}

      <NavLink to="/holdings/us" aria-label="US stock market assets">
        <US holdings={us} />
      </NavLink>

      <NavLink to="/holdings/kr" aria-label="Korea stock market assets">
        <KR holdings={kr} />
      </NavLink>

      <NavLink to="/holdings/jp" aria-label="Japan stock market assets">
        <JP holdings={jp} />
      </NavLink>

      <NavLink to="/holdings/crypto" aria-label="Crypto market assets">
        <Crypto holdings={crypto} />
      </NavLink>

      <PositionList className={component.position} aria-label="Position list" />

      <Separator />

      {summary && (
        <PortfolioDistribution
          summary={summary}
          aria-label="Current distribution of assets"
        />
      )}

      <Separator />

      {financeData && (
        <KRW
          aria-label="KRW assets"
          data-section="krw"
          financeData={financeData}
          view={krwView}
          onDoubleClick={() =>
            setKrwView((prev) => (prev === 'simple' ? 'detail' : 'simple'))
          }
        />
      )}

      {financeData && (
        <USD
          aria-label="USD assets"
          financeData={financeData}
          view={usdView}
          data-section="usd"
          onDoubleClick={() =>
            setUsdView((prev) => (prev === 'simple' ? 'detail' : 'simple'))
          }
        />
      )}

      <Separator />

      {summary && (
        <Plan
          aria-label="Future financial plans"
          marketValue={summary.marketValue}
          investment={summary.investment}
          data-section="plan"
        />
      )}

      <Separator />

      {summary?.simulates && (
        <Simulates
          aria-label="Simulation of future market scenarios"
          summary={summary}
          usdkrw={usdkrw}
          jpykrw={jpykrw}
          quotes={quotes}
          data-section="simulate"
        />
      )}
    </section>
  );
}
