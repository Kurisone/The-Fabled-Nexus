const router = require('express').Router();
const { restoreUser } = require("../../utils/auth.js");
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { User } = require('../../db/models/index.js');
const userCardsRouter = require('./usercards.js');
const decksRouter = require('./decks.js');
const deckCardsRouter = require('./deckcards.js');
const friendshipsRouter = require('./friendships.js');
const commentsRouter = require('./comments.js'); // ✅ Our new route

// Route mounting
router.use('/user-cards', userCardsRouter);
router.use('/decks', decksRouter);
router.use('/deck-cards', deckCardsRouter);
router.use('/friendships', friendshipsRouter);
router.use('/comments', commentsRouter); // ✅ Added here
router.use('/session', sessionRouter);

// Middleware to restore user
router.use(restoreUser);
router.use('/users', usersRouter);

// CSRF restore endpoint
router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    'XSRF-Token': csrfToken
  });
});

// Demo token-cookie route
router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: { username: 'Demo-lition' }
  });
  setTokenCookie(res, user);
  return res.json({ user });
});

module.exports = router;
