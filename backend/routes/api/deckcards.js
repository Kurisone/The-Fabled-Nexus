// routes/api/deckcards.js
const express = require('express');
const fetch = require('../../utils/fetch');
const { requireAuth } = require('../../utils/auth');
const { Deck, DeckCard } = require('../../db/models');

const router = express.Router();

async function getCardData(scryfallId) {
  const res = await fetch(`https://api.scryfall.com/cards/${scryfallId}`);
  return res.json();
}

// check if card is a basic land
function isBasicLand(name) {
  const basics = ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes"];
  return basics.includes(name);
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
router.post('/', requireAuth, async (req, res) => {
  try {
    const { deckId, scryfallCardId, quantity, isCommanderCard } = req.body;
    const deck = await Deck.findByPk(deckId);

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const cardData = await getCardData(scryfallCardId);
    if (!cardData) return res.status(400).json({ message: 'Invalid card ID' });

    // Commander rules only if format is Commander
    if (deck.format === 'Commander') {
      // Only one commander allowed
      if (isCommanderCard) {
        const existingCommander = await DeckCard.findOne({
          where: { deckId, isCommanderCard: true }
        });
        if (existingCommander) {
          return res.status(400).json({ message: 'Deck already has a commander' });
        }
      }

      // Singleton rule (except basic lands)
      if (!isBasicLand(cardData.name)) {
        const existing = await DeckCard.findOne({ where: { deckId, scryfallCardId } });
        if (existing) {
          return res.status(400).json({ message: 'Only one copy allowed in Commander (except basic lands)' });
        }
      }
    }

    const newCard = await DeckCard.create({
      deckId,
      scryfallCardId,
      quantity: (deck.format === 'Commander' && !isBasicLand(cardData.name)) 
        ? 1 
        : (quantity || 1),
      isCommanderCard: !!isCommanderCard
    });

    res.status(201).json({ ...newCard.toJSON(), cardData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to add card to deck' });
  }
});



// Update a card in a deck
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, delta, isCommanderCard } = req.body;

    const deckCard = await DeckCard.findByPk(id, { include: Deck });
    if (!deckCard || deckCard.Deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Card not found in your deck' });
    }

    const cardData = await getCardData(deckCard.scryfallCardId);

    // Commander rules only if format is Commander
    if (deckCard.Deck.format === 'Commander') {
      // Only one commander
      if (isCommanderCard) {
        const existingCommander = await DeckCard.findOne({
          where: { deckId: deckCard.deckId, isCommanderCard: true, id: { [Op.ne]: id } }
        });
        if (existingCommander) {
          return res.status(400).json({ message: 'Deck already has a commander' });
        }
        deckCard.isCommanderCard = true;
      }

      // Singleton rule
      if (!isBasicLand(cardData.name)) {
        if (quantity !== undefined && quantity > 1) {
          return res.status(400).json({ message: 'Only one copy allowed in Commander (except basic lands)' });
        }
        if (delta !== undefined && deckCard.quantity + delta > 1) {
          return res.status(400).json({ message: 'Only one copy allowed in Commander (except basic lands)' });
        }
      }
    }

    // Quantity updates
    if (quantity !== undefined) {
      deckCard.quantity = quantity;
    } else if (delta !== undefined) {
      deckCard.quantity += delta;
    }

    if (deckCard.quantity < 1) {
      await deckCard.destroy();
      return res.status(204).end();
    }

    await deckCard.save();
    res.json({ ...deckCard.toJSON(), cardData });
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
