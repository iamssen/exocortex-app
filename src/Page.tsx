import { useDisableBodyScroll } from '@ui/components';
import { useScreen } from '@ui/data-utils';
import { clsx } from 'clsx/lite';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Nav } from './Nav.tsx';
import component from './Page.module.css';
import { FinanceSummarySection } from './sections/finance-summary/FinanceSummarySection.tsx';

export interface PageProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> {
  layout: 'scrollable' | 'fixed';
  summary?: ReactNode;
}

export function Page({ layout, summary, ...props }: PageProps): ReactNode {
  const { pathname } = useLocation();

  useEffect(() => {
    document.querySelector('body')?.scrollTo(0, 0);
  }, [pathname]);

  const { screen } = useScreen();

  useDisableBodyScroll(layout === 'fixed');

  return (
    <main
      key="page"
      className={clsx(component.style, component[layout], component[screen])}
    >
      <article key="article" {...props} />
      <aside key="aside">
        <Nav />
        {screen === 'desktop' && (summary ?? <FinanceSummarySection />)}
      </aside>
    </main>
  );
}
