const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, createTask, updateTask, deleteTask, reorderTasks,
  addSubtask, updateSubtask, deleteSubtask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    body('dueTime').optional({ nullable: true }).matches(/^\d{2}:\d{2}$/).withMessage('dueTime must be HH:MM'),
    body('startDate').optional({ nullable: true }).isISO8601().withMessage('Invalid startDate format'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('estimatedMinutes').optional({ nullable: true }).isInt({ min: 1 }).withMessage('estimatedMinutes must be a positive integer'),
  ],
  createTask
);

router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
    body('completed').optional().isBoolean().withMessage('Completed must be boolean'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    body('dueTime').optional({ nullable: true }).matches(/^\d{2}:\d{2}$/).withMessage('dueTime must be HH:MM'),
    body('startDate').optional({ nullable: true }).isISO8601().withMessage('Invalid startDate format'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('order').optional().isNumeric().withMessage('Order must be a number'),
    body('estimatedMinutes').optional({ nullable: true }).isInt({ min: 1 }).withMessage('estimatedMinutes must be a positive integer'),
  ],
  updateTask
);

router.delete('/:id', deleteTask);

router.patch('/reorder/bulk', reorderTasks);

// Subtask routes
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId', updateSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

module.exports = router;
