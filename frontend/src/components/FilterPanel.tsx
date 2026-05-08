import { useState } from 'react';
import type { TaskFilters, Priority, Status } from '../types';
import styles from './FilterPanel.module.css';

interface Props {
  filters: TaskFilters;
  allTags: string[];
  onFiltersChange: (f: TaskFilters) => void;
}

export default function FilterPanel({ filters, allTags, onFiltersChange }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearch = (val: string) => {
    setSearchInput(val);
    onFiltersChange({ ...filters, search: val || undefined });
  };

  const setStatus = (status: Status | undefined) => onFiltersChange({ ...filters, status });
  const setPriority = (priority: Priority | undefined) => onFiltersChange({ ...filters, priority });
  const setTag = (tag: string | undefined) => onFiltersChange({ ...filters, tag });

  const hasFilters = filters.status || filters.priority || filters.tag || filters.search || filters.overdue || filters.hideCompleted;

  return (
    <div className={styles.panel}>
      <input
        type="text"
        className={styles.search}
        placeholder="Search tasks..."
        value={searchInput}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className={styles.section}>
        <span className={styles.label}>Status</span>
        <div className={styles.pills}>
          {(['todo', 'in-progress', 'done'] as Status[]).map((s) => (
            <button
              key={s}
              className={`${styles.pill} ${filters.status === s ? styles.active : ''}`}
              onClick={() => setStatus(filters.status === s ? undefined : s)}
            >
              {s === 'todo' ? 'Todo' : s === 'in-progress' ? 'In Progress' : 'Done'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Priority</span>
        <div className={styles.pills}>
          {(['high', 'medium', 'low'] as Priority[]).map((p) => (
            <button
              key={p}
              className={`${styles.pill} ${styles[p]} ${filters.priority === p ? styles.active : ''}`}
              onClick={() => setPriority(filters.priority === p ? undefined : p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className={styles.section}>
          <span className={styles.label}>Tags</span>
          <div className={styles.pills}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.pill} ${filters.tag === tag ? styles.active : ''}`}
                onClick={() => setTag(filters.tag === tag ? undefined : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.label}>Show</span>
        <div className={styles.pills}>
          <button
            className={`${styles.pill} ${styles.overduePill} ${filters.overdue ? styles.overdueActive : ''}`}
            onClick={() => onFiltersChange({ ...filters, overdue: !filters.overdue })}
          >
            Overdue only
          </button>
        </div>
      </div>

      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={!!filters.hideCompleted}
          onChange={(e) => onFiltersChange({ ...filters, hideCompleted: e.target.checked })}
        />
        <span className={styles.toggleLabel}>Hide completed</span>
      </label>

      {hasFilters && (
        <button
          className={styles.clearBtn}
          onClick={() => { setSearchInput(''); onFiltersChange({}); }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
