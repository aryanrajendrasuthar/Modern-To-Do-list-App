import type { ViewMode } from '../types';
import styles from './ViewSwitcher.module.css';

interface Props {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}

const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'list', label: 'List', icon: '☰' },
  { id: 'board', label: 'Board', icon: '⊞' },
  { id: 'calendar', label: 'Calendar', icon: '◫' },
  { id: 'table', label: 'Table', icon: '⊟' },
];

export default function ViewSwitcher({ view, onChange }: Props) {
  return (
    <div className={styles.switcher}>
      {VIEWS.map((v) => (
        <button
          key={v.id}
          className={`${styles.btn} ${view === v.id ? styles.active : ''}`}
          onClick={() => onChange(v.id)}
          title={v.label}
        >
          <span className={styles.icon}>{v.icon}</span>
          <span className={styles.label}>{v.label}</span>
        </button>
      ))}
    </div>
  );
}
