import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDecks,
  createDeck,
  updateDeck,
  deleteDeck,
} from "../../store/decks";

function DecksPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const decks = useSelector((state) => state.decks);

  const [deckName, setDeckName] = useState("");

  useEffect(() => {
    if (user) dispatch(fetchDecks(user.id));
  }, [dispatch, user]);

  if (!user) return <p>Please log in to view your decks.</p>;
  if (!decks || Object.keys(decks).length === 0)
    return (
      <div>
        <h2>{`${user.username}'s Decks`}</h2>
        <p>No decks yet.</p>
      </div>
    );

  const handleCreate = (e) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    dispatch(createDeck({ name: deckName, userId: user.id }));
    setDeckName("");
  };

  return (
    <div>
      <h2>{`${user.username}'s Decks`}</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New deck name"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
        />
        <button type="submit">Create Deck</button>
      </form>

      <ul>
        {Object.values(decks).map((deck) => (
          <li key={deck.id}>
            <strong>{deck.name}</strong>
            <button onClick={() => dispatch(deleteDeck(deck.id))}>
              Delete
            </button>
            <button
              onClick={() =>
                dispatch(updateDeck(deck.id, { name: `${deck.name} (Updated)` }))
              }
            >
              Rename
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DecksPage;
