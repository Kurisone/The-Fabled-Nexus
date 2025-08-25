// src/components/pages/DecksListPage.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDecks, deleteDeck } from "../../store/decks";
import CreateDeckForm from "../Forms/CreateDeckForm";
import "./DecksListPage.css";

export const proxyUrl = (url) => {
  if (!url) return null;
  // Skip if already proxied
  if (url.startsWith("/api/proxy-card-image")) return url;
  return `/api/proxy-card-image?url=${encodeURIComponent(url)}`;
};
function DecksListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  const decks = useSelector((state) => Object.values(state.decks || {}));

  useEffect(() => {
    if (user) dispatch(fetchDecks(user.id));
  }, [dispatch, user]);

  const handleDelete = (id) => dispatch(deleteDeck(id));

  const getRandomCreatureArt = (deck) => {
    if (!deck.DeckCards?.length) return deck.coverImage || "default.jpg";

    const creatureCards = deck.DeckCards.filter((card) =>
      card.type_line?.includes("Creature") || card.card_faces?.[0]?.type_line?.includes("Creature")
    );
    if (!creatureCards.length) return deck.coverImage || "default.jpg";

    const randomCard = creatureCards[Math.floor(Math.random() * creatureCards.length)];
    return randomCard.card_faces?.[0]?.image_uris?.art_crop ||
           randomCard.image_uris?.art_crop ||
           randomCard.card_faces?.[0]?.image_uris?.small ||
           randomCard.image_uris?.small ||
           deck.coverImage ||
           "default.jpg";
  };

  if (!user) return <p>Please log in to view your decks.</p>;

  return (
    <div className="decks-page">
      <h2>{`${user.username}'s Decks`}</h2>
      <CreateDeckForm />
      {decks.length === 0 ? (
        <p>No decks yet.</p>
      ) : (
        <ul className="decks-list">
          {decks.map((deck) => {
            const coverImage = proxyUrl(getRandomCreatureArt(deck)); // ✅ proxy applied

            return (
              <li key={deck.id} className="deck-item">
                {coverImage && (
                  <img className="deck-cover" src={coverImage} alt={`${deck.title} cover`} />
                )}
                <div className="deck-info">
                  <h3>{deck.title}</h3>
                  <p>{deck.description || "No description provided."}</p>
                </div>
                <div className="deck-buttons">
                  <button onClick={() => navigate(`/decks/${deck.id}`)} className="view-button">
                    View Details
                  </button>
                  <button onClick={() => navigate(`/decks/${deck.id}/edit`)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(deck.id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default DecksListPage;
