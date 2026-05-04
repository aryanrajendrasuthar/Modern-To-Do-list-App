const Comment = require('../models/Comment');
const Task = require('../models/Task');

const getComments = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      taskId: req.params.taskId,
      userId: req.user._id,
      content: content.trim(),
    });

    const populated = await comment.populate('userId', 'name email');
    res.status(201).json({ comment: populated });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.findOne({ _id: req.params.commentId, userId: req.user._id });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.content = content.trim();
    await comment.save();

    const populated = await comment.populate('userId', 'name email');
    res.json({ comment: populated });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, userId: req.user._id });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
