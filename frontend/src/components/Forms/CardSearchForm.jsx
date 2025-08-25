import { useState } from "react";
import { useDispatch } from "react-redux";
import { addCardToDeck } from "../../store/deckCards";
import "./CardSearchForm.css";

// const normalizeUrl = (url) => url?.replace(/^http:\/\//i, "https://") || "/fallback-card.png";
export const proxyUrl = (url) => {
  if (!url) return null;
  // Skip if already proxied
  if (url.startsWith("/api/proxy-card-image")) return url;
  return `/api/proxy-card-image?url=${encodeURIComponent(url)}`;
};
const getCardImages = (card) => {
  const images = card.card_faces
    ? card.card_faces.map((face) => proxyUrl(face.image_uris.normal))
    : [proxyUrl(card.image_uris?.normal)];
  return images;
};

function CardSearchForm({ deckId }) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchCardFaces, setSearchCardFaces] = useState({});
  const [zoomCard, setZoomCard] = useState(null);

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
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  };

  const handleAdd = (card) => {
    const images = getCardImages(card);
    dispatch(
      addCardToDeck(Number(deckId), {
        scryfallCardId: card.id,
        name: card.name,
        imageUrl: images[0],
        images,
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
        {results.map((card) => {
          const currentFace = searchCardFaces[card.id] || 0;
          const images = card.card_faces
            ? card.card_faces.map((face) => proxyUrl(face.image_uris.small))
            : [proxyUrl(card.image_uris?.small)];
          const normalImages = getCardImages(card);

          return (
            <li key={card.id} className="card-search-item">
              <div className="card-search-name"><strong>{card.name}</strong></div>
              <div
                className="card-image-container"
                onMouseEnter={() => setZoomCard(normalImages[currentFace])}
                onMouseLeave={() => setZoomCard(null)}
              >
                <img src={images[currentFace]} alt={card.name} className="card-search-image" />
              </div>
              {card.card_faces?.length > 1 && (
                <button
                  className="card-add-button toggle-face"
                  onClick={() =>
                    setSearchCardFaces({ ...searchCardFaces, [card.id]: currentFace === 0 ? 1 : 0 })
                  }
                >
                  Toggle Face
                </button>
              )}
              <button onClick={() => handleAdd(card)} className="card-add-button">Add to Deck</button>
            </li>
          );
        })}
      </ul>

      {zoomCard && (
        <div className="card-image-zoom-overlay">
          <img src={zoomCard} alt="Zoomed card" className="card-image-zoom" />
        </div>
      )}
    </div>
  );
}

export default CardSearchForm;
