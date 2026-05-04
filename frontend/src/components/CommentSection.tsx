import { useState, useEffect, type KeyboardEvent } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { commentsApi } from '../services/api';
import type { Comment } from '../types';
import styles from './CommentSection.module.css';

interface Props {
  taskId: string;
  currentUserId: string;
}

export default function CommentSection({ taskId, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    commentsApi.getAll(taskId)
      .then((r) => { if (active) setComments(r.data.comments); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [taskId]);

  const handleAdd = async () => {
    const content = inputVal.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      const r = await commentsApi.create(taskId, content);
      setComments((prev) => [...prev, r.data.comment]);
      setInputVal('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c._id);
    setEditVal(c.content);
  };

  const saveEdit = async (commentId: string) => {
    const content = editVal.trim();
    if (!content) return;
    try {
      const r = await commentsApi.update(taskId, commentId, content);
      setComments((prev) => prev.map((c) => (c._id === commentId ? r.data.comment : c)));
      setEditingId(null);
    } catch { /* ignore */ }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    await commentsApi.delete(taskId, commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>Comments ({comments.length})</span>

      {loading ? (
        <div className={styles.loadingMsg}>Loading...</div>
      ) : (
        <div className={styles.list}>
          {comments.length === 0 && (
            <div className={styles.empty}>No comments yet. Start the conversation.</div>
          )}
          {comments.map((c) => {
            const isOwn = c.userId._id === currentUserId;
            return (
              <div key={c._id} className={styles.comment}>
                <div className={styles.avatar}>
                  {c.userId.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.author}>{c.userId.name}</span>
                    <span className={styles.time}>
                      {formatDistanceToNow(parseISO(c.createdAt), { addSuffix: true })}
                    </span>
                    {isOwn && (
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => startEdit(c)}>Edit</button>
                        <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => handleDelete(c._id)}>Delete</button>
                      </div>
                    )}
                  </div>

                  {editingId === c._id ? (
                    <div className={styles.editRow}>
                      <textarea
                        className={styles.editInput}
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        rows={2}
                        autoFocus
                      />
                      <div className={styles.editBtns}>
                        <button className={styles.saveEditBtn} onClick={() => saveEdit(c._id)}>Save</button>
                        <button className={styles.cancelEditBtn} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.content}>{c.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.addRow}>
        <textarea
          className={styles.textarea}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Write a comment… (Enter to send, Shift+Enter for new line)"
          rows={2}
          disabled={submitting}
        />
        <button
          className={styles.sendBtn}
          onClick={handleAdd}
          disabled={submitting || !inputVal.trim()}
        >
          {submitting ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
