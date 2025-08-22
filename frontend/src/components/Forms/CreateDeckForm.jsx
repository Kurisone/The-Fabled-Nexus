import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeck } from "../../store/decks";
import { useNavigate } from "react-router-dom";
import "./CreateDeckForm.css";

function CreateDeckForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("Standard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const newDeck = { userId: user.id, title, description, format };
    const createdDeck = await dispatch(createDeck(newDeck));
    if (createdDeck && createdDeck.id) {
      navigate(`/decks/${createdDeck.id}`);
    }

    setTitle("");
    setDescription("");
    setFormat("Standard");
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="create-deck-form">
      <h3 className="form-title">Create a New Deck</h3>

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

      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="select-field"
      >
        <option value="Standard">Standard</option>
        <option value="Modern">Modern</option>
        <option value="Commander">Commander</option>
        <option value="Legacy">Legacy</option>
        <option value="Casual">Casual</option>
      </select>

      <button type="submit" className="submit-button">Create Deck</button>
    </form>
  );
}

export default CreateDeckForm;
