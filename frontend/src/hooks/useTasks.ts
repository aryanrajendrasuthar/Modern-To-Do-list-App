import { useState, useCallback } from 'react';
import { tasksApi } from '../services/api';
import type { Task, TaskFilters } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.priority) params.priority = filters.priority;
      if (filters?.tag) params.tag = filters.tag;
      if (filters?.search) params.search = filters.search;
      const res = await tasksApi.getAll(params);
      setTasks(res.data.tasks);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: Partial<Task>) => {
    const res = await tasksApi.create(data);
    setTasks((prev) => [...prev, res.data.task]);
    return res.data.task;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const res = await tasksApi.update(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    return res.data.task;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const reorderTasks = useCallback(async (reordered: Task[]) => {
    setTasks(reordered);
    const payload = reordered.map((t, i) => ({ id: t._id, order: i }));
    await tasksApi.reorder(payload).catch(() => {});
  }, []);

  const replaceTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  }, []);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, reorderTasks, replaceTask };
};
