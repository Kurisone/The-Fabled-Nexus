// routes/api/deckcards.js
const express = require('express');
const fetch = require('node-fetch');
const { requireAuth } = require('../../utils/auth');
const { Deck, DeckCard } = require('../../db/models');

const router = express.Router();

async function getCardData(scryfallId) {
  const res = await fetch(`https://api.scryfall.com/cards/${scryfallId}`);
  return res.json();
}

// Get all cards in a deck
router.get('/:deckId', async (req, res) => {
  const { deckId } = req.params;

  try {
    const deckCards = await DeckCard.findAll({
      where: { deckId },
      order: [['id', 'ASC']]
    });

    const results = await Promise.all(
      deckCards.map(async (card) => ({
        ...card.toJSON(),
        cardData: await getCardData(card.scryfallCardId)
      }))
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch deck cards' });
  }
});

// Add a card to a deck
router.post('/:deckId', requireAuth, async (req, res) => {
  const { deckId } = req.params;
  const { scryfallCardId, quantity, isCommanderCard } = req.body;

  try {
    const deck = await Deck.findByPk(deckId);

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const newCard = await DeckCard.create({
      deckId,
      scryfallCardId,
      quantity: quantity || 1,
      isCommanderCard: isCommanderCard || false
    });

    const cardData = await getCardData(scryfallCardId);

    res.status(201).json({
      ...newCard.toJSON(),
      cardData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to add card to deck' });
  }
});

// Update a card in a deck
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { quantity, isCommanderCard } = req.body;

  try {
    const deckCard = await DeckCard.findByPk(id, {
      include: { model: Deck }
    });

    if (!deckCard || deckCard.Deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found in your deck' });
    }

    if (quantity !== undefined) deckCard.quantity = quantity;
    if (isCommanderCard !== undefined) deckCard.isCommanderCard = isCommanderCard;

    await deckCard.save();

    const cardData = await getCardData(deckCard.scryfallCardId);

    res.json({
      ...deckCard.toJSON(),
      cardData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update deck card' });
  }
});

// Remove a card from a deck
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const deckCard = await DeckCard.findByPk(id, {
      include: { model: Deck }
    });

    if (!deckCard || deckCard.Deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found in your deck' });
    }

    await deckCard.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete deck card' });
  }
});

module.exports = router;
