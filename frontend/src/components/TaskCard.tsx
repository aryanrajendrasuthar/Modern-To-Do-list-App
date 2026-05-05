import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isAfter, format } from 'date-fns';
import { parseLocalDate } from '../utils/date';
import type { Task } from '../types';
import styles from './TaskCard.module.css';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (task: Task) => void;
}

const PRIORITY_CONFIG = {
  high: { label: 'High', className: styles.high },
  medium: { label: 'Med', className: styles.medium },
  low: { label: 'Low', className: styles.low },
};

const STATUS_CONFIG = {
  'todo': { label: 'Todo', className: styles.statusTodo },
  'in-progress': { label: 'In Progress', className: styles.statusProgress },
  'done': { label: 'Done', className: styles.statusDone },
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate && !task.completed && isAfter(new Date(), parseLocalDate(task.dueDate));

  const formattedDue = task.dueDate
    ? format(parseLocalDate(task.dueDate), 'MMM d, yyyy')
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${task.completed ? styles.completed : ''}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        ⠿
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <button
            className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(task); }}
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && '✓'}
          </button>
          <span className={styles.title} onClick={() => onEdit(task)}>
            {task.icon && <span className={styles.taskIcon}>{task.icon}</span>}
            {task.title}
          </span>
        </div>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        {task.subtasks.length > 0 && (
          <div className={styles.subtaskRow}>
            <div className={styles.subtaskBar}>
              <div
                className={styles.subtaskFill}
                style={{ width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%` }}
              />
            </div>
            <span className={styles.subtaskCount}>
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}

        <div className={styles.meta}>
          <span className={`${styles.badge} ${PRIORITY_CONFIG[task.priority].className}`}>
            {PRIORITY_CONFIG[task.priority].label}
          </span>
          <span className={`${styles.statusBadge} ${STATUS_CONFIG[task.status].className}`}>
            {STATUS_CONFIG[task.status].label}
          </span>
          {formattedDue && (
            <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
              {isOverdue ? '⚠' : '◷'} {formattedDue}
              {task.dueTime && <span className={styles.dueTime}> {task.dueTime}</span>}
            </span>
          )}
          {task.tags.map((tag) => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={() => onEdit(task)} title="Edit">✏️</button>
        <button className={styles.deleteBtn} onClick={() => onDelete(task._id)} title="Delete">🗑️</button>
      </div>
    </div>
  );
}
