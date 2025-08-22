import { csrfFetch } from './csrf';

const LOAD_CARDS = 'collection/LOAD_CARDS';
const ADD_CARD = 'collection/ADD_CARD';
const UPDATE_CARD = 'collection/UPDATE_CARD';
const REMOVE_CARD = 'collection/REMOVE_CARD';

const loadCards = (cards) => ({ type: LOAD_CARDS, cards });
const addCard = (card) => ({ type: ADD_CARD, card });
const updateCard = (card) => ({ type: UPDATE_CARD, card });
const removeCard = (id) => ({ type: REMOVE_CARD, id });

// GET all cards for the authenticated user
export const fetchCollection = () => async (dispatch) => {
  const res = await csrfFetch('/api/usercards');
  if (res.ok) {
    const data = await res.json();
    dispatch(loadCards(data));
    return data;
  }
};

// Add a new card to collection
export const addToCollection = (card) => async (dispatch) => {
  const res = await csrfFetch('/api/usercards', {
    method: 'POST',
    body: JSON.stringify(card),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(addCard(data));
    return data;
  }
};

// Update existing card quantity using quantity or delta
export const updateCollectionCard = (id, { quantity, delta }) => async (dispatch) => {
  const res = await csrfFetch(`/api/usercards/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, delta }),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(updateCard(data));
    return data;
  }
};

// Remove card
export const removeFromCollection = (id) => async (dispatch) => {
  const res = await csrfFetch(`/api/usercards/${id}`, { method: 'DELETE' });
  if (res.ok) {
    dispatch(removeCard(id));
  }
};

// Reducer
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
