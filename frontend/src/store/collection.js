import { csrfFetch } from './csrf';

const LOAD_CARDS = 'collection/LOAD_CARDS';
const ADD_CARD = 'collection/ADD_CARD';
const UPDATE_CARD = 'collection/UPDATE_CARD';
const REMOVE_CARD = 'collection/REMOVE_CARD';

const loadCards = (cards) => ({ type: LOAD_CARDS, cards });
const addCard = (card) => ({ type: ADD_CARD, card });
const updateCard = (card) => ({ type: UPDATE_CARD, card });
const removeCard = (id) => ({ type: REMOVE_CARD, id });

// Proxy helper
const proxyUrl = (url) => url ? `/api/proxy-card-image?url=${encodeURIComponent(url)}` : null;

const normalizeCard = (card) => ({
  ...card,
  imageUrl: proxyUrl(card.imageUrl || card.scryfall?.image_uris?.normal),
  images: card.scryfall?.card_faces
    ? card.scryfall.card_faces.map(face => proxyUrl(face.image_uris?.normal))
    : [proxyUrl(card.imageUrl || card.scryfall?.image_uris?.normal)],
});

export const fetchCollection = () => async (dispatch) => {
  const res = await csrfFetch('/api/usercards');
  if (res.ok) {
    const data = await res.json();
    const normalized = data.map(normalizeCard);
    dispatch(loadCards(normalized));
    return normalized;
  }
};

export const addToCollection = (card) => async (dispatch) => {
  const res = await csrfFetch('/api/usercards', {
    method: 'POST',
    body: JSON.stringify(card),
  });
  if (res.ok) {
    const data = await res.json();
    const normalized = normalizeCard(data);
    dispatch(addCard(normalized));
    return normalized;
  }
};

export const updateCollectionCard = (id, { quantity, delta }) => async (dispatch) => {
  const res = await csrfFetch(`/api/usercards/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, delta }),
  });
  if (res.ok) {
    const data = await res.json();
    const normalized = normalizeCard(data);
    dispatch(updateCard(normalized));
    return normalized;
  }
};

export const removeFromCollection = (id) => async (dispatch) => {
  const res = await csrfFetch(`/api/usercards/${id}`, { method: 'DELETE' });
  if (res.ok) {
    dispatch(removeCard(id));
  }
};

const initialState = {};

export default function collectionReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_CARDS: {
      const newState = {};
      action.cards.forEach((card) => {
        newState[card.id] = card;
      });
      return newState;
    }
    case ADD_CARD:
      return { ...state, [action.card.id]: action.card };
    case UPDATE_CARD:
      return { ...state, [action.card.id]: action.card };
    case REMOVE_CARD: {
      const newState = { ...state };
      delete newState[action.id];
      return newState;
    }
    default:
      return state;
  }
}
