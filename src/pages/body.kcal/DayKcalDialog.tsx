import type { DialogProps } from '@iamssen/dialog';
import { useESC } from '@iamssen/dialog';
import type { DayKcal } from '@iamssen/exocortex';
import { Format } from '@iamssen/format';
import type { ReactNode } from 'react';
import styles from './BodyKcalPage.module.css';
import component from './DayKcalDialog.module.css';

export interface DayKcalProps {
  dayKcal: DayKcal;
}

export function DayKcalDialog({
  dayKcal,
  closeDialog,
}: DialogProps<DayKcalProps, void>): ReactNode {
  useESC(closeDialog);

  return (
    <dialog
      open
      className={`${styles.dialogPosition} ${component.style}`}
      onClick={() => closeDialog()}
    >
      <section role="heading" aria-level={2}>
        <time dateTime={dayKcal.date}>
          {dayKcal.date} {dayKcal.drinking && '🍺'}
        </time>
        <Format format="KCAL" n={dayKcal.totalKcal} />
      </section>
      {dayKcal.meals.map((meal) => (
        <section key={meal.name}>
          <table>
            <thead>
              <tr>
                <th>{meal.name}</th>
                <td>
                  <Format format="KCAL" n={meal.totalKcal} />
                </td>
              </tr>
            </thead>
            <tbody>
              {meal.foods.map(({ name, kcal }) => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>
                    <Format format="KCAL" n={kcal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </dialog>
  );
}
