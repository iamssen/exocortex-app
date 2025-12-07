import type { WeeklyBody } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import { DateTime } from 'luxon';
import type { Column } from 'react-data-grid';
import { avgDayKcalClass, dayClass } from './cellClass.ts';
import component from './component.module.css';

export interface Columns {
  week: Column<WeeklyBody>;
  mon: Column<WeeklyBody>;
  tue: Column<WeeklyBody>;
  wed: Column<WeeklyBody>;
  thu: Column<WeeklyBody>;
  fri: Column<WeeklyBody>;
  sat: Column<WeeklyBody>;
  sun: Column<WeeklyBody>;
}

function createDayColumn(
  name: string,
  columnIndex: number,
): Column<WeeklyBody> {
  return {
    key: name.toLowerCase(),
    name,
    minWidth: 85,
    cellClass: dayClass(columnIndex),
    renderCell: ({ row }) => {
      const day = row.dayKcals[columnIndex];

      if (!day) {
        return null;
      }

      const date = DateTime.fromISO(day.date);

      return (
        <div className={component.gridCellDay}>
          <div>
            <time dateTime={day.date}>
              {columnIndex === 0 || date.day === 1
                ? date.toFormat('M월 d일')
                : date.toFormat('d일')}
            </time>
            {day.drinking && <span>🍺</span>}
          </div>
          <div>
            <Format format="INTEGER" n={row.dayKcals[columnIndex]?.totalKcal} />
            Kcal
          </div>
        </div>
      );
    },
  };
}

export function createColumns(): Columns {
  const week: Column<WeeklyBody> = {
    key: 'week',
    name: 'Week',
    frozen: true,
    minWidth: 75,
    cellClass: avgDayKcalClass,
    renderCell: ({ row }) => {
      return (
        <div className={component.gridCellWeek}>
          <time dateTime={row.week}>{row.week}</time>
          <div>
            <Format format="INTEGER" n={row.avgDayKcal} />
            Kcal
          </div>
        </div>
      );
    },
  };

  const mon: Column<WeeklyBody> = createDayColumn('Mon', 0);
  const tue: Column<WeeklyBody> = createDayColumn('Tue', 1);
  const wed: Column<WeeklyBody> = createDayColumn('Wed', 2);
  const thu: Column<WeeklyBody> = createDayColumn('Thu', 3);
  const fri: Column<WeeklyBody> = createDayColumn('Fri', 4);
  const sat: Column<WeeklyBody> = createDayColumn('Sat', 5);
  const sun: Column<WeeklyBody> = createDayColumn('Sun', 6);

  return {
    week,
    mon,
    tue,
    wed,
    thu,
    fri,
    sat,
    sun,
  };
}
