import { useState } from "react";
import { useDispatch } from "react-redux";
import { addCardToDeck } from "../../store/deckCards";
import "./CardSearchForm.css";

function CardSearchForm({ deckId }) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
      );

      if (res.ok) {
        const data = await res.json();
        setResults(data.data || []);
      } else {
        console.error("Failed to fetch cards from Scryfall");
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  };

  const handleAdd = (card) => {
    const imageUrl =
      card.image_uris?.normal ||
      card.card_faces?.[0]?.image_uris?.normal ||
      null;

    dispatch(
      addCardToDeck(Number(deckId), {
        scryfallCardId: card.id,
        name: card.name,
        imageUrl,
        quantity: 1,
      })
    );
  };

  return (
    <div className="card-search-container">
      <form onSubmit={handleSearch} className="card-search-form">
        <input
          type="text"
          placeholder="Search for a card..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="card-search-input"
        />
        <button type="submit" className="card-search-button">Search</button>
      </form>

      <ul className="card-search-results">
        {results.map((card) => (
          <li key={card.id} className="card-search-item">
            <div className="card-search-name"><strong>{card.name}</strong></div>

            {card.image_uris?.small && (
              <img
                src={card.image_uris.small}
                alt={card.name}
                className="card-search-image"
              />
            )}

            <button
              onClick={() => handleAdd(card)}
              className="card-add-button"
            >
              Add to Deck
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CardSearchForm;
