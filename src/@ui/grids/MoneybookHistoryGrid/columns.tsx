import type { MoneybookHistory } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import type { Column } from 'react-data-grid';
import { Link } from 'react-router';

interface ColumnOptions {
  currentEvent?: string;
}

export interface Columns {
  date: Column<MoneybookHistory>;
  category: Column<MoneybookHistory>;
  description: Column<MoneybookHistory>;
  amount: Column<MoneybookHistory>;
  event: Column<MoneybookHistory>;
}

export function createColumns({ currentEvent }: ColumnOptions): Columns {
  const date: Column<MoneybookHistory> = {
    key: 'date',
    name: 'Date',
    frozen: true,
    minWidth: 100,
    maxWidth: 100,
    renderCell: ({ row }) => <time dateTime={row.date}>{row.date}</time>,
  };

  const category: Column<MoneybookHistory> = {
    key: 'category',
    name: 'Category',
    minWidth: 100,
    maxWidth: 140,
    renderCell: ({ row }) => {
      return <span>{row.category}</span>;
    },
  };

  const description: Column<MoneybookHistory> = {
    key: 'description',
    name: 'Description',
    minWidth: 120,
    maxWidth: 240,
    renderCell: ({ row }) => {
      return <span>{row.description}</span>;
    },
  };

  const amount: Column<MoneybookHistory> = {
    key: 'amount',
    name: 'Amount',
    minWidth: 100,
    maxWidth: 120,
    renderCell: ({ row }) => {
      return <Format format="KRW" n={row.amount} />;
    },
  };

  const event: Column<MoneybookHistory> = {
    key: 'event',
    name: 'Event',
    renderCell: ({ row }) => {
      if (currentEvent) {
        if (
          row.event &&
          row.event.indexOf(currentEvent) === 0 &&
          row.event.length > currentEvent.length
        ) {
          return (
            <>
              <span style={{ opacity: 0.3 }}>...</span>
              <Link to={`./${row.event}`}>
                /{row.event.slice(currentEvent.length + 1)}
              </Link>
            </>
          );
        }

        return <span />;
      }

      return <span>{row.event}</span>;
    },
  };

  return {
    date,
    category,
    description,
    amount,
    event,
  };
}
