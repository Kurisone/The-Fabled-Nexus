import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCollection,
    addToCollection,
    updateCollectionCard,
    removeFromCollection,
} from "../../store/collection";
import "./CollectionPage.css";

export const proxyUrl = (url) => {
  if (!url) return null;
  // Skip if already proxied
  if (url.startsWith("/api/proxy-card-image")) return url;
  return `/api/proxy-card-image?url=${encodeURIComponent(url)}`;
};
function CollectionPage() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.session.user);
    const collection = useSelector((state) => state.collection);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [filterQuery, setFilterQuery] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [cardFaces, setCardFaces] = useState({});
    const [hoverZoom, setHoverZoom] = useState(null);

    useEffect(() => {
        if (user) {
            setLoading(true);
            dispatch(fetchCollection()).finally(() => setLoading(false));
        }
    }, [dispatch, user]);

    if (!user) return <p>Please log in to view your collection.</p>;
    if (loading) return <p>Loading collection...</p>;

    const displayedCards = Object.values(collection)
        .filter((c) => c.name.toLowerCase().includes(filterQuery.toLowerCase()))
        .sort((a, b) => sortKey === "name" ? a.name.localeCompare(b.name) : b.quantity - a.quantity);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching cards:", err);
        }
    };

    const handleAddCard = (card) => {
        const existingCard = Object.values(collection).find(c => c.scryfallCardId === card.id);
        if (existingCard) {
            dispatch(updateCollectionCard(existingCard.id, { delta: 1 }));
        } else {
            dispatch(addToCollection({
                scryfallCardId: card.id,
                name: card.name,
                quantity: 1,
                imageUrl: proxyUrl(card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal),
                images: card.card_faces
                    ? card.card_faces.map(face => proxyUrl(face.image_uris?.normal))
                    : [proxyUrl(card.image_uris?.normal)],
            }));
        }
    };

    const toggleCardFace = (cardId) => setCardFaces(prev => ({ ...prev, [cardId]: !prev[cardId] }));

    return (
        <div className="collection-page">
            <h2 className="collection-title">{`${user.username}'s Collection`}</h2>

            <div className="collection-search">
                <h3>Add New Cards</h3>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search Scryfall..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">Search</button>
                </form>

                <ul className="search-results">
                    {searchResults.map((card) => {
                        const activeFace = 0;
                        const imageUrl = proxyUrl(card.image_uris?.small || card.card_faces?.[activeFace]?.image_uris?.small);
                        return (
                            <li key={card.id} className="search-card">
                                <div className="card-image-container">
                                    {imageUrl && <img className="search-card-image" src={imageUrl} alt={card.name} />}
                                </div>
                                <span className="search-card-name">{card.name}</span>
                                <button className="search-add-button" onClick={() => handleAddCard(card)}>Add to Collection</button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {Object.keys(collection).length > 0 && (
                <div className="collection-controls">
                    <input
                        type="text"
                        placeholder="Filter cards..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="filter-input"
                    />
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="sort-select">
                        <option value="name">Sort by Name</option>
                        <option value="quantity">Sort by Quantity</option>
                    </select>
                </div>
            )}

            {Object.keys(collection).length > 0 ? (
                <ul className="collection-list">
                    {displayedCards.map((card) => {
                        const isDouble = card.images?.length > 1;
                        const activeFace = cardFaces[card.id] ? 1 : 0;
                        const imageUrl = isDouble ? card.images[activeFace] : card.images?.[0];

                        return (
                            <li key={card.id} className="collection-card">
                                <div className="card-main">
                                    {imageUrl && (
                                        <div
                                            className="card-image-container"
                                            onMouseEnter={() => setHoverZoom({ url: imageUrl, name: card.name })}
                                            onMouseLeave={() => setHoverZoom(null)}
                                        >
                                            <img className="card-image" src={imageUrl} alt={card.name} />
                                        </div>
                                    )}
                                    <div className="card-name-quantity">
                                        <span className="card-name">{card.name}</span>
                                        <span className="card-quantity">x{card.quantity}</span>
                                    </div>
                                    {isDouble && <button className="card-button toggle-face" onClick={() => toggleCardFace(card.id)}>Flip Face</button>}
                                </div>
                                <div className="card-controls">
                                    <button className="card-button increment" onClick={() => dispatch(updateCollectionCard(card.id, { delta: 1 }))}>+1</button>
                                    <button className="card-button decrement" onClick={() => dispatch(updateCollectionCard(card.id, { delta: -1 }))} disabled={card.quantity <= 1}>-1</button>
                                    <button className="card-button remove" onClick={() => dispatch(removeFromCollection(card.id))}>Remove</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : <p>No cards in your collection yet.</p>}

            {hoverZoom && (
                <div className="card-image-zoom-overlay">
                    <img className="card-image-zoom" src={hoverZoom.url} alt={hoverZoom.name} />
                </div>
            )}
        </div>
    );
}

export default CollectionPage;
