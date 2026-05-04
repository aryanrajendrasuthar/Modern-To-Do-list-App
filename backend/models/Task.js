const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const recurrenceSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly',
    },
    interval: { type: Number, default: 1, min: 1 },
    daysOfWeek: { type: [Number], default: [] }, // 0=Sun … 6=Sat
    endDate: { type: Date, default: null },
    nextDue: { type: Date, default: null },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    richDescription: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, default: null },
    dueTime: { type: String, default: null }, // "HH:MM"
    startDate: { type: Date, default: null },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    icon: { type: String, default: '' }, // emoji character
    coverColor: { type: String, default: '' }, // hex / css color
    subtasks: { type: [subtaskSchema], default: [] },
    recurrence: { type: recurrenceSchema, default: () => ({}) },
    estimatedMinutes: { type: Number, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, order: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
