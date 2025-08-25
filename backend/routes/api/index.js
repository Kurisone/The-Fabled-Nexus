const router = require('express').Router();
const { restoreUser } = require("../../utils/auth.js");
const sessionRouter = require('./session.js');
const { User } = require('../../db/models/index.js');
const userCardsRouter = require('./usercards.js');
const decksRouter = require('./decks.js');
const deckCardsRouter = require('./deckcards.js');
const friendshipsRouter = require('./friendships.js');
const commentsRouter = require('./comments.js'); 
const scryfallProxyRouter = require('./scryfallproxyimage.js');

// Route mounting
router.use('/usercards', userCardsRouter);
router.use('/decks', decksRouter);
router.use('/deckcards', deckCardsRouter);
router.use('/friendships', friendshipsRouter);
router.use('/comments', commentsRouter); 
router.use('/session', sessionRouter);
router.use('/proxy-card-image', scryfallProxyRouter)

// Middleware to restore user
router.use(restoreUser);

// CSRF restore endpoint
router.get("/csrf/restore", (req, res) => {
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
