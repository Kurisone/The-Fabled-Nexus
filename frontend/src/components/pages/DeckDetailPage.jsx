import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeckCards,
  updateDeckCard,
  removeCardFromDeck,
  addCardToDeck,
  setCommanderCard,
} from "../../store/deckCards";
import { fetchDecks, deleteDeck } from "../../store/decks";
import { useParams, useNavigate } from "react-router-dom";
import CardSearchForm from "../Forms/CardSearchForm";
import "./DeckDetailPage.css";

function DeckDetailPage() {
  const { deckId } = useParams();
  const id = Number(deckId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const deck = useSelector((state) => state.decks[id]);
  const deckCards = useSelector((state) => state.deckCards[id] || {});
  const cards = Object.values(deckCards);

  const [error, setError] = useState("");
  const [cardFaces, setCardFaces] = useState({});
  const [zoomCard, setZoomCard] = useState(null);

  useEffect(() => {
    if (user) dispatch(fetchDecks(user.id));
    if (id) dispatch(fetchDeckCards(id));
  }, [dispatch, user, id]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  if (!deck) return <p>Loading deck...</p>;

  const handleDeleteDeck = async () => {
    await dispatch(deleteDeck(deck.id));
    navigate("/decks");
  };

  const commander = cards.find((c) => c.isCommanderCard);
  const normalCards = cards.filter((c) => !c.isCommanderCard);

  let deckCoverImage = commander?.imageUrl;
  if (!deckCoverImage && cards.length > 0) {
    const creatureCard = cards.find(
      (card) =>
        card.type_line?.includes("Creature") ||
        card.card_faces?.[0]?.type_line?.includes("Creature")
    );
    if (creatureCard) {
      deckCoverImage =
        creatureCard.image_uris?.art_crop ||
        creatureCard.card_faces?.[0]?.image_uris?.art_crop ||
        null;
    }
  }

  const handleAddCard = async (card) => {
    setError("");

    if (deck.format === "Commander") {
      const isCommander =
        card.isCommanderCard ||
        (card.type_line?.includes("Legendary") &&
          card.type_line?.includes("Creature"));

      if (isCommander) {
        if (cards.some((c) => c.isCommanderCard)) {
          setError("Commander deck can only have 1 commander.");
          return;
        }
      }

      const basicLandNames = [
        "Plains",
        "Island",
        "Swamp",
        "Mountain",
        "Forest",
        "Wastes",
      ];
      if (!basicLandNames.includes(card.name)) {
        if (cards.some((c) => c.name === card.name)) {
          setError(`Singleton format: only 1 copy of ${card.name} allowed.`);
          return;
        }
      }
    }

    await dispatch(addCardToDeck(deck.id, card));
  };

  return (
    <div className="deck-page">
      <h2 className="deck-title">{deck.title}</h2>
      <p className="deck-format">
        <strong>Format:</strong> {deck.format}
      </p>
      <p className="deck-description">
        {deck.description || "No description provided."}
      </p>

      {deckCoverImage && (
        <img
          className="deck-cover"
          src={deckCoverImage}
          alt={`${deck.title} cover`}
        />
      )}

      {error && <p className="deck-error">{error}</p>}

      <div className="deck-buttons">
        <button
          className="edit-button"
          onClick={() => navigate(`/decks/${deck.id}/edit`)}
        >
          Edit Deck Info
        </button>
        <button className="delete-button" onClick={handleDeleteDeck}>
          Delete Deck
        </button>
        <button className="back-button" onClick={() => navigate("/decks")}>
          Back to My Decks
        </button>
      </div>

      <div className="add-cards-section">
        <h3>Add Cards</h3>
        <CardSearchForm deckId={id} onAddCard={handleAddCard} />
      </div>

      {commander && (
        <div className="commander-section">
          <h3>Commander</h3>
          <div className="card-item">
            <div
              className="card-image-container"
              onMouseEnter={() => setZoomCard(commander.imageUrl)}
              onMouseLeave={() => setZoomCard(null)}
            >
              <img
                className="card-image"
                src={commander.imageUrl}
                alt={commander.name}
              />
            </div>
            <span className="card-name">{commander.name}</span>
            <button
              className="card-button remove"
              onClick={() =>
                dispatch(removeCardFromDeck(deck.id, commander.id))
              }
            >
              Remove Commander
            </button>
          </div>
        </div>
      )}

      <h3>Cards</h3>
      {normalCards.length === 0 ? (
        <p>No cards yet.</p>
      ) : (
        <ul className="cards-list">
          {normalCards.map((card) => {
            const currentFace = cardFaces[card.id] || 0;
            const images = card.images || [card.imageUrl];

            return (
              <li key={card.id} className="card-item">
                <div
                  className="card-image-container"
                  onMouseEnter={() =>
                    setZoomCard(images[currentFace] || card.imageUrl)
                  }
                  onMouseLeave={() => setZoomCard(null)}
                >
                  <img
                    className="card-image"
                    src={images[currentFace]}
                    alt={card.name}
                  />
                </div>

                {card.images?.length > 1 && (
                  <button
                    className="card-button toggle-face"
                    onClick={() =>
                      setCardFaces({
                        ...cardFaces,
                        [card.id]: currentFace === 0 ? 1 : 0,
                      })
                    }
                  >
                    Toggle Face
                  </button>
                )}

                <span className="card-name">
                  {card.name} (x{card.quantity})
                </span>
                <div className="card-controls">
                  <button
                    className="card-button remove"
                    onClick={() =>
                      dispatch(removeCardFromDeck(deck.id, card.id))
                    }
                  >
                    Remove
                  </button>

                  <button
                    className="card-button increment"
                    onClick={() => {
                      if (deck.format === "Commander") {
                        setError(
                          `Commander format allows only 1 copy of ${card.name}.`
                        );
                        return;
                      }
                      dispatch(
                        updateDeckCard(deck.id, card.id, card.quantity + 1)
                      );
                    }}
                    disabled={deck.format === "Commander"}
                  >
                    +1
                  </button>

                  <button
                    className="card-button decrement"
                    onClick={() =>
                      dispatch(
                        updateDeckCard(deck.id, card.id, card.quantity - 1)
                      )
                    }
                    disabled={card.quantity <= 1}
                  >
                    -1
                  </button>

                  {deck.format === "Commander" && (
                    <button
                      className="card-button commander"
                      onClick={async () => {
                        const result = await dispatch(
                          setCommanderCard(deck.id, card.id)
                        );
                        if (result?.error) setError(result.error);
                      }}
                    >
                      Set as Commander
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {zoomCard && (
        <div className="card-image-zoom-overlay">
          <img src={zoomCard} alt="Zoomed card" className="card-image-zoom" />
        </div>
      )}
    </div>
  );
}

export default DeckDetailPage;
