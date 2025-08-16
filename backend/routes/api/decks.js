// routes/api/decks.js
const express = require('express');
const fetch = require('node-fetch');
const { requireAuth } = require('../../utils/auth');
const { Deck, DeckCard, Comment, User } = require('../../db/models');

const router = express.Router();

// Helper: fetch Scryfall card data
async function getCardData(scryfallId) {
  const res = await fetch(`https://api.scryfall.com/cards/${scryfallId}`);
  return res.json();
}

// Get all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.findAll({
      include: [
        {
          model: DeckCard,
          attributes: ['id', 'deckId', 'scryfallCardId', 'quantity', 'isCommanderCard']
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'username'] }]
        }
      ],
      order: [['id', 'ASC']]
    });

    const results = await Promise.all(
      decks.map(async (deck) => {
        const deckJSON = deck.toJSON();
        deckJSON.DeckCards = await Promise.all(
          deckJSON.DeckCards.map(async (card) => ({
            ...card,
            cardData: await getCardData(card.scryfallCardId)
          }))
        );
        return deckJSON;
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch decks' });
  }
});

// Get single deck by ID
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findByPk(req.params.id, {
      include: [
        {
          model: DeckCard,
          attributes: ['id', 'deckId', 'scryfallCardId', 'quantity', 'isCommanderCard']
        },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'username'] }]
        }
      ]
    });

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const deckJSON = deck.toJSON();
    deckJSON.DeckCards = await Promise.all(
      deckJSON.DeckCards.map(async (card) => ({
        ...card,
        cardData: await getCardData(card.scryfallCardId)
      }))
    );

    res.json(deckJSON);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch deck' });
  }
});

// Create deck
router.post('/', requireAuth, async (req, res) => {
  const { title, format, description, coverImage } = req.body;
  try {
    const newDeck = await Deck.create({
      userId: req.user.id,
      title,
      format,
      description,
      coverImage: coverImage || 'default.jpg' //default, change later
    });
    res.status(201).json(newDeck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create deck' });
  }
});

// Update deck
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, format, description, coverImage } = req.body;

  try {
    const deck = await Deck.findByPk(id);

    if (!deck || deck.userId !== req.user.id) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    deck.title = title !== undefined ? title : deck.title;
    deck.format = format !== undefined ? format : deck.format;
    deck.description = description !== undefined ? description : deck.description;
    deck.coverImage = coverImage !== undefined ? coverImage : deck.coverImage;

    await deck.save();
    res.json(deck);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update deck' });
  }
});

// Delete deck
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

module.exports = router;
