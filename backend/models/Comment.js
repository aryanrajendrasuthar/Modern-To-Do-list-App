const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
  },
  { timestamps: true }
);

commentSchema.index({ taskId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
