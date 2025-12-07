import type { ASC, MoneybookEvent } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router';

export interface HierarchyEventsProps extends DetailedHTMLProps<
  HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
> {
  data: ASC<MoneybookEvent>;
}

export function HierarchyEvents({
  data,
  ...props
}: HierarchyEventsProps): ReactNode {
  const hierarchy = useMemo(
    () =>
      toHierarchy(
        data.filter(({ name }) => !name.includes('결혼')),
      ).toReversed(),
    [data],
  );

  return (
    <ul {...props}>
      {hierarchy.map(({ name, event, children }) => (
        <li key={event.name}>
          <div>
            <Link to={`./event/${name}`}>
              {name} <Format format="KRW" n={event.total} />
            </Link>
          </div>
          {children && (
            <ul>
              {children.map((child) => (
                <li key={child.name}>
                  <div>
                    <Link to={`./event/${child.event.name}`}>
                      {child.name} <Format format="KRW" n={child.event.total} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

interface Node {
  name: string;
  event: MoneybookEvent;
  children?: Node[];
}

function toHierarchy(events: MoneybookEvent[]): Node[] {
  const top: Node[] = [];

  let i: number = -1;
  const max: number = events.length;
  while (++i < max) {
    const event = events[i];
    const paths = event.name.split('/');

    if (paths.length === 1) {
      top.push({
        name: event.name,
        event: event,
      });
    } else {
      const target = top.find(({ name }) => paths[0] === name);
      if (!target) {
        throw new Error(`Can't find top node of "${paths[0]}"`);
      }
      target.children = [
        ...(target.children ?? []),
        {
          name: `.../${paths.slice(1).join('/')}`,
          event: event,
        },
      ];
    }
  }

  return top;
}
