const express = require('express');
const fetch = require('../../utils/fetch');
const { requireAuth } = require('../../utils/auth');
const { UserCard } = require('../../db/models');

const router = express.Router();

// Safe Scryfall fetch
async function fetchScryfallCard(id) {
  if (!id) return {}; // return empty object if no ID
  try {
    const res = await fetch(`https://api.scryfall.com/cards/${id}`);
    if (!res.ok) return {};
    return res.json();
  } catch (err) {
    console.error(`Error fetching Scryfall card ${id}:`, err);
    return {};
  }
}

// GET all cards in the authenticated user's collection
router.get('/', requireAuth, async (req, res) => {
  try {
    const userCards = await UserCard.findAll({
      where: { userId: req.user.id },
      order: [['id', 'ASC']],
    });

    const results = await Promise.all(
      userCards.map(async (card) => {
        const scryfallData = await fetchScryfallCard(card.scryfallCardId);
        return {
          id: card.id,
          scryfallCardId: card.scryfallCardId,
          quantity: card.quantity,
          name: scryfallData.name || 'Unknown Card',
          scryfall: scryfallData,
        };
      })
    );

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

    let userCard = await UserCard.findOne({
      where: { userId: req.user.id, scryfallCardId },
    });

    if (userCard) {
      userCard.quantity += quantity || 1;
      await userCard.save();
    } else {
      userCard = await UserCard.create({
        userId: req.user.id,
        scryfallCardId,
        quantity: quantity || 1,
      });
    }

    const scryfallData = await fetchScryfallCard(scryfallCardId);

    res.status(201).json({
      id: userCard.id,
      scryfallCardId: userCard.scryfallCardId,
      quantity: userCard.quantity,
      name: scryfallData.name || 'Unknown Card',
      scryfall: scryfallData,
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

    const { quantity, delta } = req.body;
    if (quantity !== undefined) card.quantity = quantity;
    else if (delta !== undefined) card.quantity += delta;

    if (card.quantity < 1) {
      await card.destroy();
      return res.status(204).end();
    }

    await card.save();

    const scryfallData = await fetchScryfallCard(card.scryfallCardId);

    res.json({
      id: card.id,
      scryfallCardId: card.scryfallCardId,
      quantity: card.quantity,
      name: scryfallData.name || 'Unknown Card',
      scryfall: scryfallData,
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
