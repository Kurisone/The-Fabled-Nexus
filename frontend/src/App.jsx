import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navigation/NavBar";
import CollectionPage from "./components/pages/CollectionPage";
import DecksListPage from "./components/pages/DecksListPage";
import DeckDetailPage from "./components/pages/DeckDetailPage";
import EditDeckForm from "./components/Forms/EditDeckForm";
import HomePage from "./components/pages/HomePage";
import NewsPage from "./components/pages/NewsPage"; // new
import AboutPage from "./components/pages/AboutPage"; // new

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/decks" element={<DecksListPage />} />
        <Route path="/decks/:deckId" element={<DeckDetailPage />} />
        <Route path="/decks/:deckId/edit" element={<EditDeckForm />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/about" element={<AboutPage />} />  
      </Routes>
    </>
  );
}

export default App;
