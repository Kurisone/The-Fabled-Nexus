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
    const [showToast, setShowToast] = useState(false); // toast visibility
    const [cardFaces, setCardFaces] = useState({});
    const [zoomCard, setZoomCard] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (user) dispatch(fetchDecks(user.id));
        if (id) dispatch(fetchDeckCards(id));
    }, [dispatch, user, id]);

    // Show toast on error
    useEffect(() => {
        if (!error) return;
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }, [error]);

    if (!deck) return <p>Loading deck...</p>;

    const handleDeleteDeck = () => {
        setShowDeleteModal(true); // show modal
    };

    const confirmDeletion = async () => {
        await dispatch(deleteDeck(deck.id));
        setShowDeleteModal(false);
        navigate("/decks");
    };

    const cancelDeletion = () => setShowDeleteModal(false);

    const commander = cards.find((c) => c.isCommanderCard);
    const normalCards = cards.filter((c) => !c.isCommanderCard);

    // Deck cover logic
    let deckCoverImage = commander?.imageUrl || null;
    if (!deckCoverImage && cards.length > 0) {
        const creatureCard = cards.find(
            (card) =>
                card.type_line?.includes("Creature") ||
                card.card_faces?.[0]?.type_line?.includes("Creature")
        );
        if (creatureCard) {
            deckCoverImage = creatureCard.imageUrl || creatureCard.images?.[0] || null;
        }
    }

    const handleAddCard = async (card) => {
        setError("");
        const result = await dispatch(addCardToDeck(deck.id, card));
        if (result?.error) setError(result.error);
    };

    const toggleCardFace = (cardId) =>
        setCardFaces((prev) => ({ ...prev, [cardId]: prev[cardId] ? 0 : 1 }));

    return (
        <div className="deck-page">
            <h2 className="deck-title">{deck.title}</h2>
            <p className="deck-format"><strong>Format:</strong> {deck.format}</p>
            <p className="deck-description">{deck.description || "No description provided."}</p>

            {deckCoverImage && (
                <img className="deck-cover" src={deckCoverImage} alt={`${deck.title} cover`} />
            )}

            {/* Toast popup */}
            {showToast && (
                <div className="toast-popup">{error}</div>
            )}

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p>Are you sure you want to delete this deck? This action cannot be undone.</p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={confirmDeletion}>Yes, Delete</button>
                            <button className="cancel-button" onClick={cancelDeletion}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="deck-buttons">
                <button className="edit-button" onClick={() => navigate(`/decks/${deck.id}/edit`)}>Edit Deck Info</button>
                <button className="delete-button" onClick={handleDeleteDeck}>Delete Deck</button>
                <button className="back-button" onClick={() => navigate("/decks")}>Back to My Decks</button>
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
                            <img className="card-image" src={commander.imageUrl} alt={commander.name} />
                        </div>
                        <span className="card-name">{commander.name}</span>
                        <button
                            className="card-button remove"
                            onClick={() => dispatch(removeCardFromDeck(deck.id, commander.id))}
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
                        const imageUrl = card.images?.[currentFace] || card.imageUrl;

                        return (
                            <li key={card.id} className="card-item">
                                <div
                                    className="card-image-container"
                                    onMouseEnter={() => setZoomCard(imageUrl)}
                                    onMouseLeave={() => setZoomCard(null)}
                                >
                                    <img className="card-image" src={imageUrl} alt={card.name} />
                                </div>

                                {card.images?.length > 1 && (
                                    <button
                                        className="card-button toggle-face"
                                        onClick={() => toggleCardFace(card.id)}
                                    >
                                        Toggle Face
                                    </button>
                                )}

                                <span className="card-name">{card.name} (x{card.quantity})</span>
                                <div className="card-controls">
                                    <button
                                        className="card-button remove"
                                        onClick={() => dispatch(removeCardFromDeck(deck.id, card.id))}
                                    >
                                        Remove
                                    </button>

                                    <button
                                        className="card-button increment"
                                        onClick={() => {
                                            if (deck.format === "Commander") {
                                                setError("Commander decks can only have one of each card. Cannot increment quantity.");
                                                return;
                                            }
                                            dispatch(updateDeckCard(deck.id, card.id, card.quantity + 1));
                                        }}
                                    >
                                        +1
                                    </button>

                                    <button
                                        className="card-button decrement"
                                        onClick={() => {
                                            if (deck.format === "Commander" && card.quantity <= 1) {
                                                setError("Cannot reduce quantity below 1 in a Commander deck.");
                                                return;
                                            }
                                            dispatch(updateDeckCard(deck.id, card.id, card.quantity - 1));
                                        }}
                                    >
                                        -1
                                    </button>

                                    {deck.format === "Commander" && (
                                        <button
                                            className="card-button commander"
                                            onClick={async () => {
                                                const result = await dispatch(setCommanderCard(deck.id, card.id));
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
