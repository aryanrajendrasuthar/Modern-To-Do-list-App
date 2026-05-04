const express = require('express');
const { getComments, createComment, updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getComments);
router.post('/', createComment);
router.patch('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

module.exports = router;
