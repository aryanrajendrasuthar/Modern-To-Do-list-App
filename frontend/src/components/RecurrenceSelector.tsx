import type { Recurrence, RecurrenceFrequency } from '../types';
import styles from './RecurrenceSelector.module.css';

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQ_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'day(s)',
  weekly: 'week(s)',
  monthly: 'month(s)',
  yearly: 'year(s)',
};

interface Props {
  value: Recurrence;
  onChange: (value: Recurrence) => void;
}

export default function RecurrenceSelector({ value, onChange }: Props) {
  const patch = (fields: Partial<Recurrence>) => onChange({ ...value, ...fields });

  const toggleDay = (day: number) => {
    const days = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((d) => d !== day)
      : [...value.daysOfWeek, day].sort((a, b) => a - b);
    patch({ daysOfWeek: days });
  };

  const summary = (() => {
    if (!value.enabled) return null;
    const freq = FREQ_LABELS[value.frequency];
    let text = `Every ${value.interval} ${freq}`;
    if (value.frequency === 'weekly' && value.daysOfWeek.length > 0) {
      text += ` on ${value.daysOfWeek.map((d) => DAY_NAMES[d]).join(', ')}`;
    }
    if (value.endDate) text += ` until ${new Date(value.endDate).toLocaleDateString()}`;
    return text;
  })();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Recurrence</span>
        <button
          type="button"
          className={`${styles.toggle} ${value.enabled ? styles.on : ''}`}
          onClick={() => patch({ enabled: !value.enabled })}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>

      {value.enabled ? (
        <div className={styles.options}>
          <div className={styles.everyRow}>
            <span className={styles.everyLabel}>Every</span>
            <input
              type="number"
              min={1}
              max={99}
              value={value.interval}
              onChange={(e) => patch({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
              className={styles.intervalInput}
            />
            <select
              value={value.frequency}
              onChange={(e) => patch({ frequency: e.target.value as RecurrenceFrequency, daysOfWeek: [] })}
              className={styles.freqSelect}
            >
              <option value="daily">day(s)</option>
              <option value="weekly">week(s)</option>
              <option value="monthly">month(s)</option>
              <option value="yearly">year(s)</option>
            </select>
          </div>

          {value.frequency === 'weekly' && (
            <div className={styles.daysRow}>
              {DAY_INITIALS.map((initial, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dayBtn} ${value.daysOfWeek.includes(i) ? styles.dayActive : ''}`}
                  onClick={() => toggleDay(i)}
                  title={DAY_NAMES[i]}
                >
                  {initial}
                </button>
              ))}
            </div>
          )}

          <div className={styles.endRow}>
            <span className={styles.endLabel}>Ends</span>
            <input
              type="date"
              className={styles.endInput}
              value={value.endDate ? value.endDate.split('T')[0] : ''}
              onChange={(e) => patch({ endDate: e.target.value || null })}
            />
            {value.endDate && (
              <button
                type="button"
                className={styles.clearEnd}
                onClick={() => patch({ endDate: null })}
              >
                Never
              </button>
            )}
          </div>
        </div>
      ) : (
        summary === null && (
          <span className={styles.offHint}>Enable to repeat this task automatically</span>
        )
      )}

      {summary && <div className={styles.summary}>{summary}</div>}
    </div>
  );
}
