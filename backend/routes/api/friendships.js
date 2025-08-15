// routes/api/friendships.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Friendship, User } = require('../../db/models');

const router = express.Router();

// Get all friends and pending requests for logged-in user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const friendships = await Friendship.findAll({
      where: { userId },
      include: [{ model: User, as: 'Friend', attributes: ['id', 'username'] }]
    });

    const requests = await Friendship.findAll({
      where: { friendId: userId, status: 'pending' },
      include: [{ model: User, as: 'Requester', attributes: ['id', 'username'] }]
    });

    res.json({
      friends: friendships.filter(f => f.status === 'accepted'),
      pending: requests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch friendships' });
  }
});

// Send a friend request
router.post('/:friendId', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.params;

  if (parseInt(friendId) === userId) {
    return res.status(400).json({ message: 'You cannot friend yourself' });
  }

  try {
    const existing = await Friendship.findOne({
      where: { userId, friendId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const newRequest = await Friendship.create({
      userId,
      friendId,
      status: 'pending'
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to send friend request' });
  }
});

// Accept a friend request
router.put('/:id/accept', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const request = await Friendship.findByPk(id);

    if (!request || request.friendId !== userId || request.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'accepted';
    await request.save();

    // Create reciprocal friendship
    await Friendship.create({
      userId,
      friendId: request.userId,
      status: 'accepted'
    });

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to accept friend request' });
  }
});

// Reject a friend request
router.put('/:id/reject', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const request = await Friendship.findByPk(id);

    if (!request || request.friendId !== userId || request.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to reject friend request' });
  }
});

module.exports = router;
