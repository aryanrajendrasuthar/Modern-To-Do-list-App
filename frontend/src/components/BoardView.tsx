import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { isAfter, format } from 'date-fns';
import { parseLocalDate } from '../utils/date';
import type { Task, Status, Priority } from '../types';
import styles from './BoardView.module.css';

const COLUMNS: { id: string; status: Status; label: string }[] = [
  { id: 'col-todo', status: 'todo', label: 'To Do' },
  { id: 'col-in-progress', status: 'in-progress', label: 'In Progress' },
  { id: 'col-done', status: 'done', label: 'Done' },
];

const PRIORITY_CLASS: Record<Priority, string> = {
  high: styles.high,
  medium: styles.medium,
  low: styles.low,
};

const COL_DOT_CLASS: Record<Status, string> = {
  'todo': styles.dotTodo,
  'in-progress': styles.dotInProgress,
  'done': styles.dotDone,
};

interface CardContentProps {
  task: Task;
  onEdit: (t: Task) => void;
  onToggle: (t: Task) => void;
}

function CardContent({ task, onEdit, onToggle }: CardContentProps) {
  const isOverdue = task.dueDate && !task.completed && isAfter(new Date(), parseLocalDate(task.dueDate));
  const done = task.subtasks.filter((s) => s.completed).length;
  const total = task.subtasks.length;

  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.cardTop}>
        <button
          className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggle(task); }}
        >
          {task.completed && '✓'}
        </button>
        <span className={styles.cardTitle} onClick={() => onEdit(task)}>
          {task.icon && <span className={styles.cardIcon}>{task.icon}</span>}
          {task.title}
        </span>
      </div>

      {task.description && <p className={styles.cardDesc}>{task.description}</p>}

      <div className={styles.cardMeta}>
        <span className={`${styles.badge} ${PRIORITY_CLASS[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
            {format(parseLocalDate(task.dueDate), 'MMM d')}
          </span>
        )}
        {total > 0 && (
          <span className={styles.subtasks}>
            {done}/{total}
          </span>
        )}
      </div>
    </div>
  );
}

interface DraggableCardProps extends CardContentProps {
  id: string;
}

function DraggableCard({ id, task, onEdit, onToggle }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${styles.draggable} ${isDragging ? styles.dragging : ''}`}
      {...listeners}
      {...attributes}
    >
      <CardContent task={task} onEdit={onEdit} onToggle={onToggle} />
    </div>
  );
}

interface ColumnProps {
  col: (typeof COLUMNS)[0];
  tasks: Task[];
  onEdit: (t: Task) => void;
  onToggle: (t: Task) => void;
}

function DroppableColumn({ col, tasks, onEdit, onToggle }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div className={`${styles.column} ${isOver ? styles.over : ''}`}>
      <div className={styles.colHeader}>
        <span className={`${styles.dot} ${COL_DOT_CLASS[col.status]}`} />
        <h3 className={styles.colTitle}>{col.label}</h3>
        <span className={styles.colCount}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className={styles.colBody}>
        {tasks.length === 0 && (
          <div className={styles.emptyCol}>No tasks</div>
        )}
        {tasks.map((task) => (
          <DraggableCard
            key={task._id}
            id={task._id}
            task={task}
            onEdit={onEdit}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onToggle: (t: Task) => void;
  onStatusChange: (taskId: string, status: Status) => void;
}

export default function BoardView({ tasks, onEdit, onToggle, onStatusChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = activeId ? tasks.find((t) => t._id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const targetCol = COLUMNS.find((c) => c.id === over.id);
    if (!targetCol) return;
    const task = tasks.find((t) => t._id === active.id);
    if (task && task.status !== targetCol.status) {
      onStatusChange(task._id, targetCol.status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.id}
            col={col}
            tasks={tasks.filter((t) => t.status === col.status)}
            onEdit={onEdit}
            onToggle={onToggle}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className={styles.overlay}>
            <CardContent task={activeTask} onEdit={() => {}} onToggle={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
