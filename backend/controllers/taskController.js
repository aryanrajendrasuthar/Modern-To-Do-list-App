const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { calculateNextDue } = require('../utils/recurrence');

const TASK_FIELDS = [
  'title', 'description', 'richDescription', 'priority', 'status',
  'completed', 'dueDate', 'dueTime', 'startDate', 'tags', 'order',
  'icon', 'coverColor', 'recurrence', 'estimatedMinutes',
];

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, tag, search, sortBy = 'order', order = 'asc', startDate, endDate } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const tasks = await Task.find(filter).sort({ [sortBy]: sortOrder });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, richDescription, priority, status, dueDate, dueTime, startDate, tags, icon, coverColor, recurrence, estimatedMinutes } = req.body;

    const lastTask = await Task.findOne({ userId: req.user._id }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      richDescription,
      priority,
      status,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      startDate: startDate || null,
      tags: tags || [],
      order,
      icon: icon || '',
      coverColor: coverColor || '',
      recurrence,
      estimatedMinutes: estimatedMinutes || null,
      userId: req.user._id,
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const wasCompleted = task.completed;

    TASK_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();

    // Spawn next occurrence when a recurring task is completed for the first time
    if (!wasCompleted && task.completed && task.recurrence && task.recurrence.enabled) {
      const nextDue = calculateNextDue(task.dueDate, task.recurrence);
      const pastEnd = task.recurrence.endDate && nextDue > new Date(task.recurrence.endDate);
      if (nextDue && !pastEnd) {
        const recurrenceData = task.recurrence.toObject
          ? task.recurrence.toObject()
          : { ...task.recurrence };
        recurrenceData.nextDue = nextDue;
        await Task.create({
          title: task.title,
          description: task.description,
          richDescription: task.richDescription,
          priority: task.priority,
          status: 'todo',
          completed: false,
          dueDate: nextDue,
          dueTime: task.dueTime,
          startDate: null,
          tags: [...task.tags],
          order: task.order + 1,
          icon: task.icon,
          coverColor: task.coverColor,
          recurrence: recurrenceData,
          estimatedMinutes: task.estimatedMinutes,
          userId: task.userId,
        });
      }
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'tasks must be an array' });
    }

    const ops = tasks.map(({ id, order }) =>
      Task.updateOne({ _id: id, userId: req.user._id }, { $set: { order } })
    );
    await Promise.all(ops);

    res.json({ message: 'Tasks reordered' });
  } catch (err) {
    next(err);
  }
};

// Subtask handlers

const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Subtask title is required' });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const maxOrder = task.subtasks.reduce((m, s) => Math.max(m, s.order), -1);
    task.subtasks.push({ title: title.trim(), completed: false, order: maxOrder + 1 });
    await task.save();

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    if (req.body.title !== undefined) subtask.title = req.body.title;
    if (req.body.completed !== undefined) subtask.completed = req.body.completed;
    if (req.body.order !== undefined) subtask.order = req.body.order;

    await task.save();
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

const deleteSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.deleteOne();
    await task.save();
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, reorderTasks, addSubtask, updateSubtask, deleteSubtask };
