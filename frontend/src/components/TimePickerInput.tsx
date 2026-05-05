import styles from './TimePickerInput.module.css';

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function TimePickerInput({ value, onChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <input
        type="time"
        className={styles.input}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => onChange(null)}
          title="Clear time"
        >
          ✕
        </button>
      )}
    </div>
  );
}
