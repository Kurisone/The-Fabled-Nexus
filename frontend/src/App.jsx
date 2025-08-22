import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navigation/NavBar";
import CollectionPage from "./components/pages/CollectionPage";
import DecksListPage from "./components/pages/DecksListPage";
import DeckDetailPage from "./components/pages/DeckDetailPage";
import EditDeckForm from "./components/Forms/EditDeckForm";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<h1>Welcome to The Fabled Nexus</h1>} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/decks" element={<DecksListPage />} />
        <Route path="/decks/:deckId" element={<DeckDetailPage />} />
        <Route path="/decks/:deckId/edit" element={<EditDeckForm />} />


      </Routes>
    </>
  );
}

export default App;
