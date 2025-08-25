import { csrfFetch } from "./csrf";

const LOAD_DECK_CARDS = "deckCards/LOAD_DECK_CARDS";
const ADD_DECK_CARD = "deckCards/ADD_DECK_CARD";
const UPDATE_DECK_CARD = "deckCards/UPDATE_DECK_CARD";
const REMOVE_DECK_CARD = "deckCards/REMOVE_DECK_CARD";
const SET_COMMANDER_CARD = "deckCards/SET_COMMANDER_CARD";

const loadDeckCards = (deckId, cards) => ({
    type: LOAD_DECK_CARDS,
    deckId,
    cards,
});

const addDeckCardAction = (deckId, card) => ({
    type: ADD_DECK_CARD,
    deckId,
    card,
});

const updateDeckCardAction = (deckId, card) => ({
    type: UPDATE_DECK_CARD,
    deckId,
    card,
});

const setCommanderCardAction = (deckId, card) => ({
    type: SET_COMMANDER_CARD,
    deckId,
    card,
});

const removeDeckCard = (deckId, cardId) => ({
    type: REMOVE_DECK_CARD,
    deckId,
    cardId,
});

// Proxy helper
const proxyUrl = (url) => url ? `/api/proxy-card-image?url=${encodeURIComponent(url)}` : null;

const normalizeCard = (c) => ({
    ...c,
    imageUrl: proxyUrl(c.imageUrl || c.cardData?.image_uris?.normal),
    images: c.card_faces
        ? c.card_faces.map(face => proxyUrl(face.image_uris?.normal))
        : [proxyUrl(c.imageUrl || c.cardData?.image_uris?.normal)],
});

export const fetchDeckCards = (deckId) => async (dispatch) => {
    const res = await csrfFetch(`/api/deckcards/${deckId}`);
    if (res.ok) {
        const data = await res.json();
        const normalized = data.map(normalizeCard);
        dispatch(loadDeckCards(deckId, normalized));
        return normalized;
    }
};

export const addCardToDeck = (deckId, card) => async (dispatch) => {
    const res = await csrfFetch(`/api/deckcards`, {
        method: "POST",
        body: JSON.stringify({ deckId, ...card }),
    });

    if (res.ok) {
        const data = await res.json();
        const normalized = normalizeCard(data);
        dispatch(addDeckCardAction(deckId, normalized));
        return normalized;
    }
};

export const setCommanderCard = (deckId, cardId) => async (dispatch, getState) => {
    const state = getState();
    const deckCards = state.deckCards[deckId] || {};
    const deck = state.decks[deckId];

    if (deck.format !== "Commander") return;

    const existingCommander = Object.values(deckCards).find((c) => c.isCommanderCard);
    if (existingCommander && existingCommander.id !== cardId) {
        return { error: "Deck already has a commander. Remove it first." };
    }

    const res = await csrfFetch(`/api/deckcards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCommanderCard: true }),
    });

    if (!res.ok) {
        const data = await res.json();
        return { error: data.message || "Failed to set commander" };
    }

    const data = await res.json();
    const normalized = normalizeCard(data);
    dispatch(setCommanderCardAction(deckId, normalized));
    return normalized;
};

export const updateDeckCard = (deckId, id, quantityOrDelta) => async (dispatch) => {
    const bodyData = typeof quantityOrDelta === "object" && quantityOrDelta !== null
        ? quantityOrDelta
        : { quantity: quantityOrDelta };

    const res = await csrfFetch(`/api/deckcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
    });

    if (res.status === 204) {
        dispatch(removeDeckCard(deckId, id));
        return null;
    }

    if (res.ok) {
        const data = await res.json();
        const normalized = normalizeCard(data);
        dispatch(updateDeckCardAction(deckId, normalized));
        return normalized;
    }
};

export const removeCardFromDeck = (deckId, id) => async (dispatch) => {
    const res = await csrfFetch(`/api/deckcards/${id}`, { method: "DELETE" });
    if (res.ok) {
        dispatch(removeDeckCard(deckId, id));
    }
};

const initialState = {};

export default function deckCardsReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_DECK_CARDS: {
            const newState = { ...state };
            newState[action.deckId] = {};
            action.cards.forEach((card) => {
                newState[action.deckId][card.id] = card;
            });
            return newState;
        }
        case ADD_DECK_CARD: {
            const newState = { ...state };
            const currentDeckCards = newState[action.deckId] ? { ...newState[action.deckId] } : {};
            currentDeckCards[action.card.id] = { ...(currentDeckCards[action.card.id] || {}), ...action.card };
            newState[action.deckId] = currentDeckCards;
            return newState;
        }
        case UPDATE_DECK_CARD: {
            const newState = { ...state };
            if (!newState[action.deckId]) return state;
            const updatedDeckCards = { ...newState[action.deckId] };
            updatedDeckCards[action.card.id] = action.card;
            newState[action.deckId] = updatedDeckCards;
            return newState;
        }
        case SET_COMMANDER_CARD: {
            const newState = { ...state };
            if (!newState[action.deckId]) return state;
            const updatedDeckCards = { ...newState[action.deckId] };
            Object.values(updatedDeckCards).forEach((c) => {
                if (c.isCommanderCard && c.id !== action.card.id) c.isCommanderCard = false;
            });
            updatedDeckCards[action.card.id] = action.card;
            newState[action.deckId] = updatedDeckCards;
            return newState;
        }
        case REMOVE_DECK_CARD: {
            const newState = { ...state };
            if (newState[action.deckId]) {
                const deckCards = { ...newState[action.deckId] };
                delete deckCards[action.cardId];
                newState[action.deckId] = deckCards;
            }
            return newState;
        }
        default:
            return state;
    }
}
