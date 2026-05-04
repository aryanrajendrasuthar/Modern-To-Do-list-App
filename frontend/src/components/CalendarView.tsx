import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  format,
  parseISO,
  isAfter,
} from 'date-fns';
import type { Task, Priority } from '../types';
import styles from './CalendarView.module.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_DOT: Record<Priority, string> = {
  high: '#dc2626',
  medium: '#d97706',
  low: '#16a34a',
};

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onCreate: (date: Date) => void;
}

export default function CalendarView({ tasks, onEdit, onCreate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekMode, setWeekMode] = useState(false);

  const days = weekMode
    ? eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      })
    : eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
      });

  const prev = () =>
    weekMode
      ? setCurrentDate((d) => subWeeks(d, 1))
      : setCurrentDate((d) => subMonths(d, 1));

  const next = () =>
    weekMode
      ? setCurrentDate((d) => addWeeks(d, 1))
      : setCurrentDate((d) => addMonths(d, 1));

  const goToday = () => setCurrentDate(new Date());

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), day));

  const title = weekMode
    ? `${format(days[0], 'MMM d')} – ${format(days[6], 'MMM d, yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.navBtn} onClick={prev}>&#8249;</button>
          <button className={styles.navBtn} onClick={next}>&#8250;</button>
          <button className={styles.todayBtn} onClick={goToday}>Today</button>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <button
          className={`${styles.modeBtn} ${weekMode ? styles.modeBtnActive : ''}`}
          onClick={() => setWeekMode((m) => !m)}
        >
          {weekMode ? 'Month view' : 'Week view'}
        </button>
      </div>

      <div className={`${styles.grid} ${weekMode ? styles.weekGrid : ''}`}>
        {DAY_LABELS.map((d) => (
          <div key={d} className={styles.dayLabel}>{d}</div>
        ))}

        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          const isOther = !weekMode && !isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={`${styles.cell} ${isToday ? styles.today : ''} ${isOther ? styles.otherMonth : ''}`}
              onClick={() => onCreate(day)}
            >
              <span className={`${styles.dateNum} ${isToday ? styles.dateNumToday : ''}`}>
                {format(day, 'd')}
              </span>

              <div className={styles.pills}>
                {dayTasks.slice(0, weekMode ? 8 : 3).map((t) => {
                  const overdue = t.dueDate && !t.completed && isAfter(new Date(), parseISO(t.dueDate));
                  return (
                    <div
                      key={t._id}
                      className={`${styles.pill} ${t.completed ? styles.pillDone : ''} ${overdue ? styles.pillOverdue : ''}`}
                      style={{ borderLeftColor: PRIORITY_DOT[t.priority] }}
                      onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                      title={t.title}
                    >
                      {t.icon && <span className={styles.pillIcon}>{t.icon}</span>}
                      <span className={styles.pillTitle}>{t.title}</span>
                      {t.dueTime && <span className={styles.pillTime}>{t.dueTime}</span>}
                    </div>
                  );
                })}
                {dayTasks.length > (weekMode ? 8 : 3) && (
                  <div className={styles.more}>
                    +{dayTasks.length - (weekMode ? 8 : 3)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
