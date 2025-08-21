// routes/api/decks.js

const express = require('express');
// const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { Deck, DeckCard } = require('../../db/models');
const { getCardData } = require('../../utils/scryfallApi');

const router = express.Router();

// ---- identify basic lands ----
function isBasicLand(name) {
  const basics = ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes"];
  return basics.includes(name);
}

// GET all decks for logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const decks = await Deck.findAll({
      where: { userId: req.user.id },
      include: { model: DeckCard }
    });
    res.json(decks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch decks' });
  }
});

// GET a single deck by ID 
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const deck = await Deck.findByPk(req.params.id, {
      include: { model: DeckCard }
    });

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    // ---- Validation logic ----
    let errors = [];
    let warnings = [];

    if (deck.format === 'Commander') {
      // Commander requirement
      const commanderCards = deck.DeckCards.filter(dc => dc.isCommanderCard);
      if (commanderCards.length === 0) {
        errors.push('Commander deck must have exactly 1 commander.');
      } else if (commanderCards.length > 1) {
        errors.push('Commander deck can only have 1 commander.');
      }

      // Singleton rule
      const seen = {};
      for (let dc of deck.DeckCards) {
        const cardData = await getCardData(dc.scryfallCardId);
        const cardName = cardData.name;

        if (!isBasicLand(cardName)) {
          if (seen[cardName]) {
            errors.push(`Duplicate copy of ${cardName} not allowed in Commander.`);
          }
          if (dc.quantity > 1) {
            errors.push(`${cardName} has ${dc.quantity} copies, only 1 allowed in Commander.`);
          }
          seen[cardName] = true;
        }
      }

      // Card count
      const totalCards = deck.DeckCards.reduce((sum, dc) => sum + dc.quantity, 0);
      if (totalCards !== 100) {
        warnings.push(`Commander decks should have exactly 100 cards (currently ${totalCards}).`);
      }
    }

    const deckWithValidation = {
      ...deck.toJSON(),
      validation: {
        errors,
        warnings,
        isValid: errors.length === 0
      }
    };

    res.json(deckWithValidation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch deck' });
  }
});

// CREATE a new deck
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, format } = req.body;
    const newDeck = await Deck.create({
      userId: req.user.id,
      name,
      format
    });
    res.status(201).json(newDeck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create deck' });
  }
});

// UPDATE a deck
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const deck = await Deck.findByPk(req.params.id);

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const { name, format } = req.body;
    if (name !== undefined) deck.name = name;
    if (format !== undefined) deck.format = format;

    await deck.save();
    res.json(deck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update deck' });
  }
});

// DELETE a deck
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deck = await Deck.findByPk(req.params.id);

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    await deck.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete deck' });
  }
});

// STILL keep explicit /validate route if needed
router.get('/:id/validate', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findByPk(id, {
      include: { model: DeckCard }
    });

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    let errors = [];
    let warnings = [];

    if (deck.format === 'Commander') {
      const commanderCards = deck.DeckCards.filter(dc => dc.isCommanderCard);
      if (commanderCards.length === 0) {
        errors.push('Commander deck must have exactly 1 commander.');
      } else if (commanderCards.length > 1) {
        errors.push('Commander deck can only have 1 commander.');
      }

      const seen = {};
      for (let dc of deck.DeckCards) {
        const cardData = await getCardData(dc.scryfallCardId);
        const cardName = cardData.name;

        if (!isBasicLand(cardName)) {
          if (seen[cardName]) {
            errors.push(`Duplicate copy of ${cardName} not allowed in Commander.`);
          }
          if (dc.quantity > 1) {
            errors.push(`${cardName} has ${dc.quantity} copies, only 1 allowed in Commander.`);
          }
          seen[cardName] = true;
        }
      }

      const totalCards = deck.DeckCards.reduce((sum, dc) => sum + dc.quantity, 0);
      if (totalCards !== 100) {
        warnings.push(`Commander decks should have exactly 100 cards (currently ${totalCards}).`);
      }
    }

    res.json({
      deckId: deck.id,
      format: deck.format,
      errors,
      warnings,
      isValid: errors.length === 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to validate deck' });
  }
});

module.exports = router;
