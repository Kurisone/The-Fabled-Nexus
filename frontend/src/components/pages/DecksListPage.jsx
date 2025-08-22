// src/components/pages/DecksListPage.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDecks, deleteDeck } from "../../store/decks";
import CreateDeckForm from "../Forms/CreateDeckForm";
import "./DecksListPage.css";

function DecksListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const decks = useSelector((state) => Object.values(state.decks || {}));

  useEffect(() => {
    if (user) dispatch(fetchDecks(user.id));
  }, [dispatch, user]);

  const handleDelete = (id) => {
    dispatch(deleteDeck(id));
  };

  // Helper to get a random creature card art
  const getRandomCreatureArt = (deck) => {
    if (!deck.DeckCards?.length) return deck.coverImage || "default.jpg";

    // Filter creature cards
    const creatureCards = deck.DeckCards.filter((card) => {
      return (
        card.type_line?.includes("Creature") ||
        card.card_faces?.[0]?.type_line?.includes("Creature")
      );
    });

    if (!creatureCards.length) return deck.coverImage || "default.jpg";

    // Pick random creature card
    const randomCard = creatureCards[Math.floor(Math.random() * creatureCards.length)];

    // Best effort to get art_crop
    if (randomCard.card_faces?.[0]?.image_uris?.art_crop) {
      return randomCard.card_faces[0].image_uris.art_crop;
    }
    if (randomCard.image_uris?.art_crop) {
      return randomCard.image_uris.art_crop;
    }
    // Fallback to small image (less likely full card)
    if (randomCard.card_faces?.[0]?.image_uris?.small) {
      return randomCard.card_faces[0].image_uris.small;
    }
    if (randomCard.image_uris?.small) {
      return randomCard.image_uris.small;
    }

    // Default image if nothing found
    return deck.coverImage || "default.jpg";
  };

  if (!user) return <p>Please log in to view your decks.</p>;

  return (
    <div className="decks-page">
      <h2>{`${user.username}'s Decks`}</h2>

      {/* Create Deck Form */}
      <CreateDeckForm />

      {decks.length === 0 ? (
        <p>No decks yet.</p>
      ) : (
        <ul className="decks-list">
          {decks.map((deck) => {
            const coverImage = getRandomCreatureArt(deck);

            return (
              <li key={deck.id} className="deck-item">
                {coverImage && (
                  <img
                    className="deck-cover"
                    src={coverImage}
                    alt={`${deck.title} cover`}
                  />
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
