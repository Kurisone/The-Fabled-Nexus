// utils/scryfallApi.js
const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

async function fetchJson(url) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Scryfall API error: ${res.status}`);
  return res.json();
}

async function searchCards(query) {
  return fetchJson(`${SCRYFALL_BASE_URL}/cards/search?q=${encodeURIComponent(query)}`);
}

async function getCardById(id) {
  return fetchJson(`${SCRYFALL_BASE_URL}/cards/${id}`);
}



module.exports = {
  searchCards,
  getCardById,
};
