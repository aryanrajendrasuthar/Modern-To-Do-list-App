import { useEffect, useRef } from 'react';
import { parseISO } from 'date-fns';
import type { Task } from '../types';

const WARNING_MS = 15 * 60 * 1000; // 15 minutes before
const MAX_LOOKAHEAD_MS = 24 * 60 * 60 * 1000; // only schedule within next 24 h

function requestPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function fireNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico', tag: title });
  }
}

export function useReminders(tasks: Task[]) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Ask permission once on mount
  useEffect(() => { requestPermission(); }, []);

  useEffect(() => {
    // Clear existing timers whenever task list changes
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();

    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = Date.now();

    for (const task of tasks) {
      if (!task.dueDate || !task.dueTime || task.completed) continue;

      const dueDateStr = task.dueDate.split('T')[0];
      const dueMs = parseISO(`${dueDateStr}T${task.dueTime}`).getTime();
      const delay = dueMs - now;

      if (delay <= 0 || delay > MAX_LOOKAHEAD_MS) continue;

      // Exact-time notification
      timers.current.set(
        task._id,
        setTimeout(() => {
          fireNotification(
            `Task due: ${task.title}`,
            task.description || 'This task is due now.'
          );
        }, delay)
      );

      // 15-minute warning
      const warnDelay = delay - WARNING_MS;
      if (warnDelay > 0) {
        timers.current.set(
          `${task._id}-warn`,
          setTimeout(() => {
            fireNotification(
              `Due in 15 min: ${task.title}`,
              task.description || 'Heads up — this task is due soon.'
            );
          }, warnDelay)
        );
      }
    }

    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, [tasks]);
}
