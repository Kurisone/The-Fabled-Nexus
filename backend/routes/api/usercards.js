// routes/api/usercards.js
const express = require('express');
const fetch = require('../../utils/fetch');
const { requireAuth } = require('../../utils/auth');
const { UserCard } = require('../../db/models');

const router = express.Router();

async function fetchScryfallCard(id) {
  const res = await fetch(`https://api.scryfall.com/cards/${id}`);
  if (!res.ok) throw new Error(`Scryfall fetch failed for ID: ${id}`);
  return res.json();
}

// GET all cards in the authenticated user's collection
router.get('/', requireAuth, async (req, res) => {
  try {
    const userCards = await UserCard.findAll({
      where: { userId: req.user.id },
      order: [['id', 'ASC']]
    });

    const results = await Promise.all(userCards.map(async (card) => ({
      ...card.toJSON(),
      scryfall: await fetchScryfallCard(card.scryfallCardId)
    })));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch user cards' });
  }
});

// Add a card to the authenticated user's collection
router.post('/', requireAuth, async (req, res) => {
  try {
    const { scryfallCardId, quantity } = req.body;

    const newCard = await UserCard.create({
      userId: req.user.id,
      scryfallCardId,
      quantity: quantity || 1
    });

    res.status(201).json({
      ...newCard.toJSON(),
      scryfall: await fetchScryfallCard(scryfallCardId)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to add card' });
  }
});

// Update a card in the authenticated user's collection
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const card = await UserCard.findByPk(req.params.id);

    if (!card || card.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (req.body.quantity !== undefined) {
      card.quantity = req.body.quantity;
      await card.save();
    }

    res.json({
      ...card.toJSON(),
      scryfall: await fetchScryfallCard(card.scryfallCardId)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update card' });
  }
});

// Delete a card from the authenticated user's collection
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const card = await UserCard.findByPk(req.params.id);

    if (!card || card.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await card.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete card' });
  }
});

module.exports = router;
