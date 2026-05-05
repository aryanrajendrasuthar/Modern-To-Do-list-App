import { useState, type FormEvent, useEffect } from 'react';
import type { Task, Priority, Status } from '../types';
import styles from './TaskModal.module.css';

interface Props {
  task?: Task;
  defaultDate?: string | null;
  onSave: (data: Partial<Task>) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ task, defaultDate, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [status, setStatus] = useState<Status>(task?.status || 'todo');
  const [dueDate, setDueDate] = useState(
    task?.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : (defaultDate || '')
  );
  const [dueTime, setDueTime] = useState<string>(task?.dueTime || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) { setTags([...tags, t]); }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), priority, status, dueDate: dueDate || null, dueTime: dueTime || null, tags });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.heading}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Priority</label>
              <select className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Due Time</label>
              <input
                type="time"
                className={styles.input}
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagRow}>
              <input
                className={styles.input}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter"
              />
              <button type="button" className={styles.addTagBtn} onClick={addTag}>Add</button>
            </div>
            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className={styles.removeTag}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
