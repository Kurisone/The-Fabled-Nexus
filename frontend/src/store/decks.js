import { csrfFetch } from './csrf';

const LOAD_DECKS = 'decks/LOAD_DECKS';
const ADD_DECK = 'decks/ADD_DECK';
const REMOVE_DECK = 'decks/REMOVE_DECK';
const UPDATE_DECK = 'decks/UPDATE_DECK';

const loadDecks = (decks) => ({ type: LOAD_DECKS, decks });
const addDeck = (deck) => ({ type: ADD_DECK, deck });
const removeDeck = (id) => ({ type: REMOVE_DECK, id: Number(id) });
const updateDeckAction = (deck) => ({ type: UPDATE_DECK, deck });

// ---- Thunks ----
export const fetchDecks = (userId) => async (dispatch) => {
  const res = await csrfFetch(`/api/decks/user/${userId}`);
  if (res.ok) {
    const data = await res.json();
    dispatch(loadDecks(data));
    return data;
  }
};

export const createDeck = (deck) => async (dispatch) => {
  const res = await csrfFetch('/api/decks', {
    method: 'POST',
    body: JSON.stringify(deck),
  });
  if (res.ok) {
    const data = await res.json();
    dispatch(addDeck(data));
    return data;
  }
};

export const updateDeck = (deck) => async (dispatch) => {
  const res = await csrfFetch(`/api/decks/${deck.id}`, {
    method: 'PUT',
    body: JSON.stringify(deck),
  });
  if (res.ok) {
    const updatedDeck = await res.json();
    dispatch(updateDeckAction(updatedDeck));
    return updatedDeck;
  }
};

export const deleteDeck = (id) => async (dispatch) => {
  const res = await csrfFetch(`/api/decks/${id}`, { method: 'DELETE' });
  if (res.ok) {
    dispatch(removeDeck(id));
  }
};

// ---- Reducer ----
const initialState = {};

export default function decksReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DECKS: {
      const newState = {};
      action.decks.forEach((deck) => {
        newState[Number(deck.id)] = deck;
      });
      return newState;
    }
    case ADD_DECK: {
      const id = Number(action.deck.id);
      return { ...state, [id]: action.deck };
    }
    case UPDATE_DECK: {
      const id = Number(action.deck.id);
      return { ...state, [id]: action.deck };
    }
    case REMOVE_DECK: {
      const newState = { ...state };
      delete newState[Number(action.id)];
      return newState;
    }
    default:
      return state;
  }
}
