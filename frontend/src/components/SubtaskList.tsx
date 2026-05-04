import { useState, type KeyboardEvent } from 'react';
import type { Subtask } from '../types';
import styles from './SubtaskList.module.css';

interface Props {
  taskId: string;
  subtasks: Subtask[];
  onAdd: (taskId: string, title: string) => Promise<void>;
  onToggle: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
  onDelete: (taskId: string, subtaskId: string) => Promise<void>;
}

export default function SubtaskList({ taskId, subtasks, onAdd, onToggle, onDelete }: Props) {
  const [inputVal, setInputVal] = useState('');
  const [adding, setAdding] = useState(false);

  const sorted = [...subtasks].sort((a, b) => a.order - b.order);
  const doneCount = subtasks.filter((s) => s.completed).length;
  const progress = subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0;

  const handleAdd = async () => {
    const title = inputVal.trim();
    if (!title) return;
    setAdding(true);
    try {
      await onAdd(taskId, title);
      setInputVal('');
    } finally {
      setAdding(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
    if (e.key === 'Escape') setInputVal('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Subtasks</span>
        {subtasks.length > 0 && (
          <span className={styles.count}>{doneCount}/{subtasks.length}</span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className={styles.list}>
        {sorted.map((subtask) => (
          <div key={subtask._id} className={styles.item}>
            <button
              className={`${styles.checkbox} ${subtask.completed ? styles.checked : ''}`}
              onClick={() => onToggle(taskId, subtask._id, !subtask.completed)}
            >
              {subtask.completed && '✓'}
            </button>
            <span className={`${styles.subtaskTitle} ${subtask.completed ? styles.done : ''}`}>
              {subtask.title}
            </span>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(taskId, subtask._id)}
              title="Delete subtask"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add a subtask..."
          disabled={adding}
        />
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={adding || !inputVal.trim()}
        >
          {adding ? '...' : '+'}
        </button>
      </div>
    </div>
  );
}
