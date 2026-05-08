import { useState, useEffect, useRef, type FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { parseLocalDate } from '../utils/date';
import type { Task, Priority, Status, User } from '../types';
import { tasksApi } from '../services/api';
import RichTextEditor from './RichTextEditor';
import SubtaskList from './SubtaskList';
import CommentSection from './CommentSection';
import EmojiPicker from './EmojiPicker';
import TimePickerInput from './TimePickerInput';
import RecurrenceSelector from './RecurrenceSelector';
import styles from './TaskDetailPanel.module.css';

const PRIORITY_CLASS: Record<Priority, string> = {
  high: styles.high,
  medium: styles.medium,
  low: styles.low,
};


interface Props {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskDetailPanel({ task, currentUser, onClose, onUpdated, onDelete }: Props) {
  const [localTask, setLocalTask] = useState<Task>(task);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Sync if parent pushes a new task
  useEffect(() => { setLocalTask(task); }, [task]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const patch = async (fields: Partial<Task>) => {
    const updated = { ...localTask, ...fields };
    setLocalTask(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const r = await tasksApi.update(task._id, fields);
        onUpdated(r.data.task);
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  const handleTitleBlur = (e: FormEvent<HTMLSpanElement>) => {
    const newTitle = (e.target as HTMLSpanElement).textContent?.trim() || '';
    if (newTitle && newTitle !== localTask.title) patch({ title: newTitle });
    if (!newTitle) (e.target as HTMLSpanElement).textContent = localTask.title;
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !localTask.tags.includes(t)) patch({ tags: [...localTask.tags, t] });
    setTagInput('');
  };

  const removeTag = (tag: string) => patch({ tags: localTask.tags.filter((t) => t !== tag) });

  const handleAddSubtask = async (taskId: string, title: string) => {
    const r = await tasksApi.addSubtask(taskId, title);
    setLocalTask(r.data.task);
    onUpdated(r.data.task);
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    const r = await tasksApi.updateSubtask(taskId, subtaskId, { completed });
    setLocalTask(r.data.task);
    onUpdated(r.data.task);
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    const r = await tasksApi.deleteSubtask(taskId, subtaskId);
    setLocalTask(r.data.task);
    onUpdated(r.data.task);
  };

  const coverStyle = localTask.coverColor
    ? { background: localTask.coverColor }
    : undefined;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        {/* Cover strip */}
        <div className={styles.cover} style={coverStyle}>
          <div className={styles.coverActions}>
            <button className={styles.coverBtn} onClick={onClose} title="Close">✕</button>
            {saving && <span className={styles.savingDot}>Saving…</span>}
            <button
              className={`${styles.coverBtn} ${styles.deleteBtn}`}
              onClick={() => onDelete(task._id)}
              title="Delete task"
            >
              🗑
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {/* Icon + Title */}
          <div className={styles.titleRow}>
            <div className={styles.iconWrap} ref={emojiRef}>
              <button
                className={styles.iconBtn}
                onClick={() => setShowEmojiPicker((v) => !v)}
                title="Set icon"
              >
                {localTask.icon || <span className={styles.iconPlaceholder}>+</span>}
              </button>
              {showEmojiPicker && (
                <div className={styles.emojiPopover}>
                  <EmojiPicker
                    selected={localTask.icon}
                    onChange={(emoji) => patch({ icon: emoji })}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>

            <span
              className={styles.title}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
            >
              {localTask.title}
            </span>
          </div>

          {/* Quick properties row */}
          <div className={styles.props}>
            <div className={styles.prop}>
              <span className={styles.propLabel}>Status</span>
              <select
                className={styles.propSelect}
                value={localTask.status}
                onChange={(e) => patch({ status: e.target.value as Status })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className={styles.prop}>
              <span className={styles.propLabel}>Priority</span>
              <select
                className={`${styles.propSelect} ${PRIORITY_CLASS[localTask.priority]}`}
                value={localTask.priority}
                onChange={(e) => patch({ priority: e.target.value as Priority })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className={styles.prop}>
              <span className={styles.propLabel}>Due date</span>
              <input
                type="date"
                className={styles.propInput}
                value={localTask.dueDate ? format(parseLocalDate(localTask.dueDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => patch({ dueDate: e.target.value || null })}
              />
            </div>

            <div className={styles.prop}>
              <span className={styles.propLabel}>Due time</span>
              <TimePickerInput
                value={localTask.dueTime}
                onChange={(v) => patch({ dueTime: v })}
              />
            </div>

            <div className={styles.prop}>
              <span className={styles.propLabel}>Estimate (min)</span>
              <input
                type="number"
                min={1}
                className={styles.propInput}
                style={{ width: 90 }}
                value={localTask.estimatedMinutes ?? ''}
                placeholder="—"
                onChange={(e) => patch({ estimatedMinutes: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div className={styles.prop}>
              <span className={styles.propLabel}>Completed</span>
              <button
                className={`${styles.checkbox} ${localTask.completed ? styles.checked : ''}`}
                onClick={() => {
                  const completing = !localTask.completed;
                  const updates: Partial<import('../types').Task> = { completed: completing };
                  if (completing) updates.status = 'done';
                  else if (localTask.status === 'done') updates.status = 'todo';
                  patch(updates);
                }}
              >
                {localTask.completed && '✓'}
              </button>
            </div>
          </div>

          {/* Cover color picker */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Cover color</span>
            <div className={styles.colorRow}>
              {['', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'].map((color) => (
                <button
                  key={color || 'none'}
                  className={`${styles.colorSwatch} ${localTask.coverColor === color ? styles.colorSelected : ''}`}
                  style={{ background: color || 'var(--bg-secondary)', border: color ? 'none' : '1.5px dashed var(--border)' }}
                  onClick={() => patch({ coverColor: color })}
                  title={color || 'None'}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Tags</span>
            <div className={styles.tags}>
              {localTask.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                  <button className={styles.removeTag} onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              <div className={styles.tagInputRow}>
                <input
                  className={styles.tagInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag…"
                />
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <div className={styles.section}>
            <RecurrenceSelector
              value={localTask.recurrence}
              onChange={(rec) => patch({ recurrence: rec })}
            />
          </div>

          {/* Rich description */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Description</span>
            <RichTextEditor
              content={localTask.richDescription || ''}
              onChange={(html) => patch({ richDescription: html })}
              placeholder="Add a rich description, notes, links…"
            />
          </div>

          {/* Subtasks */}
          <div className={styles.section}>
            <SubtaskList
              taskId={task._id}
              subtasks={localTask.subtasks}
              onAdd={handleAddSubtask}
              onToggle={handleToggleSubtask}
              onDelete={handleDeleteSubtask}
            />
          </div>

          {/* Comments */}
          <div className={styles.section}>
            <CommentSection taskId={task._id} currentUserId={currentUser._id} />
          </div>

          {/* Created / updated timestamps */}
          <div className={styles.timestamps}>
            <span>Created {format(parseISO(localTask.createdAt), 'MMM d, yyyy')}</span>
            <span>Updated {format(parseISO(localTask.updatedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </>
  );
}
