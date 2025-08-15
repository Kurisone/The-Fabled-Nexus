const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Comment, User } = require('../../db/models');

// GET all comments for a deck
router.get('/deck/:deckId', async (req, res) => {
  const { deckId } = req.params;

  const comments = await Comment.findAll({
    where: { deckId },
    include: {
      model: User,
      attributes: ['id', 'username'] // basic user info
    },
    order: [['createdAt', 'DESC']]
  });

  res.json(comments);
});

// POST a comment to a deck
router.post('/', requireAuth, async (req, res) => {
  const { deckId, content } = req.body;
  const { user } = req;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Content cannot be empty.' });
  }

  const comment = await Comment.create({
    userId: user.id,
    deckId,
    content: content.trim()
  });

  const newComment = await Comment.findByPk(comment.id, {
    include: {
      model: User,
      attributes: ['id', 'username']
    }
  });

  res.status(201).json(newComment);
});

// PUT edit comment
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const { user } = req;

  const comment = await Comment.findByPk(id);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found.' });
  }

  if (comment.userId !== user.id) {
    return res.status(403).json({ message: 'Not authorized to edit this comment.' });
  }

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Content cannot be empty.' });
  }

  comment.content = content.trim();
  await comment.save();

  res.json(comment);
});

// DELETE comment
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const comment = await Comment.findByPk(id);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found.' });
  }

  if (comment.userId !== user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this comment.' });
  }

  await comment.destroy();
  res.status(204).end();
});

module.exports = router;
