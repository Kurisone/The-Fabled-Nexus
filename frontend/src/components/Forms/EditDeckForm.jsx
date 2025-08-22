import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateDeck, fetchDecks } from "../../store/decks";
import "./EditDeckForm.css";

function EditDeckForm() {
  const { deckId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.session.user);
  const deck = useSelector((state) => state.decks[deckId]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // load decks so this deck is available
  useEffect(() => {
    if (user) {
      dispatch(fetchDecks(user.id));
    }
  }, [dispatch, user]);

  // populate form fields once deck loads
  useEffect(() => {
    if (deck) {
      setTitle(deck.title);
      setDescription(deck.description || "");
    }
  }, [deck]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedDeck = { ...deck, title, description };
    await dispatch(updateDeck(updatedDeck));
    navigate(`/decks/${deckId}`);
  };

  if (!deck) return <p>Loading deck...</p>;

  return (
    <form onSubmit={handleSubmit} className="edit-deck-form">
      <h2 className="form-title">Edit Deck</h2>

      <input
        type="text"
        placeholder="Deck Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="input-field"
      />

      <textarea
        placeholder="Deck Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea-field"
      />

      <div className="button-group">
        <button type="submit" className="submit-button">Save Changes</button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditDeckForm;
