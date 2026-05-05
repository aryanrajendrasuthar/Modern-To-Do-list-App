import { useState } from 'react';
import { format, isAfter } from 'date-fns';
import { parseLocalDate } from '../utils/date';
import type { Task, Priority, Status } from '../types';
import styles from './TableView.module.css';

type SortKey = 'title' | 'priority' | 'status' | 'dueDate' | 'createdAt';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_ORDER: Record<Status, number> = { 'todo': 0, 'in-progress': 1, 'done': 2 };

const PRIORITY_CLASS: Record<Priority, string> = {
  high: styles.high,
  medium: styles.medium,
  low: styles.low,
};

const STATUS_CLASS: Record<Status, string> = {
  'todo': styles.statusTodo,
  'in-progress': styles.statusInProgress,
  'done': styles.statusDone,
};

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (t: Task) => void;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <span className={styles.sortIcon}>↕</span>;
  return <span className={styles.sortIcon}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export default function TableView({ tasks, onEdit, onDelete, onToggle }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (sortKey === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortKey === 'dueDate') {
      if (!a.dueDate && !b.dueDate) cmp = 0;
      else if (!a.dueDate) cmp = 1;
      else if (!b.dueDate) cmp = -1;
      else cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headRow}>
            <th className={styles.th} style={{ width: 36 }} />
            <th
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('title')}
            >
              Title <SortIcon col="title" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('priority')}
            >
              Priority <SortIcon col="priority" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('status')}
            >
              Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('dueDate')}
            >
              Due Date <SortIcon col="dueDate" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th className={styles.th}>Tags</th>
            <th className={styles.th} style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => {
            const overdue = task.dueDate && !task.completed && isAfter(new Date(), parseLocalDate(task.dueDate));
            const subtaskDone = task.subtasks.filter((s) => s.completed).length;
            return (
              <tr key={task._id} className={`${styles.row} ${task.completed ? styles.completedRow : ''}`}>
                <td className={styles.td}>
                  <button
                    className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
                    onClick={() => onToggle(task)}
                  >
                    {task.completed && '✓'}
                  </button>
                </td>
                <td className={styles.td}>
                  <div className={styles.titleCell}>
                    <span className={styles.taskTitle} onClick={() => onEdit(task)}>
                      {task.icon && <span className={styles.icon}>{task.icon}</span>}
                      {task.title}
                    </span>
                    {task.subtasks.length > 0 && (
                      <span className={styles.subtaskPill}>
                        {subtaskDone}/{task.subtasks.length}
                      </span>
                    )}
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${PRIORITY_CLASS[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.statusBadge} ${STATUS_CLASS[task.status]}`}>
                    {task.status}
                  </span>
                </td>
                <td className={`${styles.td} ${overdue ? styles.overdueCell : ''}`}>
                  {task.dueDate ? (
                    <>
                      {format(parseLocalDate(task.dueDate), 'MMM d, yyyy')}
                      {task.dueTime && <span className={styles.dueTime}> {task.dueTime}</span>}
                    </>
                  ) : (
                    <span className={styles.noDate}>—</span>
                  )}
                </td>
                <td className={styles.td}>
                  <div className={styles.tags}>
                    {task.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>#{tag}</span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className={styles.moreTag}>+{task.tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => onEdit(task)} title="Edit">✏️</button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => window.confirm('Delete this task?') && onDelete(task._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} className={styles.emptyRow}>No tasks found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
