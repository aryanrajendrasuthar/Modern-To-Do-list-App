import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { format } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import type { Task, TaskFilters, Status, ViewMode } from '../types';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskSkeleton from '../components/TaskSkeleton';
import ViewSwitcher from '../components/ViewSwitcher';
import BoardView from '../components/BoardView';
import CalendarView from '../components/CalendarView';
import TableView from '../components/TableView';
import styles from './DashboardPage.module.css';

function getStoredView(): ViewMode {
  const v = localStorage.getItem('viewMode');
  return (v as ViewMode) || 'list';
}

export default function DashboardPage() {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, reorderTasks } =
    useTasks();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>(getStoredView);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);

  const changeView = (v: ViewMode) => {
    setViewMode(v);
    localStorage.setItem('viewMode', v);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = tasks.findIndex((t) => t._id === active.id);
      const newIndex = tasks.findIndex((t) => t._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      reorderTasks(arrayMove(tasks, oldIndex, newIndex));
    },
    [tasks, reorderTasks]
  );

  const openCreate = () => { setEditingTask(undefined); setCreateDate(null); setModalOpen(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setCreateDate(null); setModalOpen(true); };

  const handleCreateWithDate = (date: Date) => {
    setEditingTask(undefined);
    setCreateDate(format(date, 'yyyy-MM-dd'));
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask._id, data);
    } else {
      await createTask(data);
    }
    fetchTasks(filters);
  };

  const handleToggle = (task: Task) => {
    updateTask(task._id, { completed: !task.completed });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleStatusChange = async (taskId: string, status: Status) => {
    await updateTask(taskId, { status });
    fetchTasks(filters);
  };

  const allTags = [...new Set(tasks.flatMap((t) => t.tags))];
  const todoCount = tasks.filter((t) => t.status === 'todo' && !t.completed).length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.completed || t.status === 'done').length;

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${showSidebar ? styles.sidebarOpen : ''}`}>
          <FilterPanel
            filters={filters}
            allTags={allTags}
            onFiltersChange={(f) => { setFilters(f); setShowSidebar(false); }}
          />
        </aside>

        {showSidebar && (
          <div className={styles.backdrop} onClick={() => setShowSidebar(false)} />
        )}

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <button className={styles.filterToggle} onClick={() => setShowSidebar((v) => !v)}>
                ☰ Filters
              </button>
              <ViewSwitcher view={viewMode} onChange={changeView} />
              <div className={styles.stats}>
                <span className={styles.stat}><span className={styles.statNum}>{todoCount}</span> Todo</span>
                <span className={styles.stat}><span className={styles.statNum}>{inProgressCount}</span> In Progress</span>
                <span className={styles.stat}><span className={styles.statNum}>{doneCount}</span> Done</span>
              </div>
            </div>
            <button className={styles.newBtn} onClick={openCreate}>+ New Task</button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          {loading ? (
            <TaskSkeleton />
          ) : (
            <>
              {viewMode === 'list' && (
                tasks.length === 0 ? (
                  <EmptyState hasFilters={Object.keys(filters).length > 0} onCreate={openCreate} />
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                      <div className={styles.taskList}>
                        {tasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onToggle={handleToggle}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )
              )}

              {viewMode === 'board' && (
                <BoardView
                  tasks={tasks}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  onStatusChange={handleStatusChange}
                />
              )}

              {viewMode === 'calendar' && (
                <CalendarView
                  tasks={tasks}
                  onEdit={openEdit}
                  onCreate={handleCreateWithDate}
                />
              )}

              {viewMode === 'table' && (
                tasks.length === 0 ? (
                  <EmptyState hasFilters={Object.keys(filters).length > 0} onCreate={openCreate} />
                ) : (
                  <TableView
                    tasks={tasks}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                )
              )}
            </>
          )}
        </main>
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultDate={createDate}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onCreate }: { hasFilters: boolean; onCreate: () => void }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>📋</div>
      <p className={styles.emptyText}>
        {hasFilters ? 'No tasks match your filters.' : 'No tasks yet. Create your first task!'}
      </p>
      {!hasFilters && (
        <button className={styles.emptyBtn} onClick={onCreate}>+ Create Task</button>
      )}
    </div>
  );
}
