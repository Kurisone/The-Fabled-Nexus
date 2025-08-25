import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="logo-title">
          <h1 className="site-title">The Fabled Nexus</h1>
          <p className="site-subtitle">
            A hub for deckbuilders, collectors, and dreamers of Magic: The Gathering
          </p>
        </div>
        <nav className="homepage-nav">
          <Link to="/decks" className="nav-link">Decks</Link>
          <Link to="/collection" className="nav-link">Collections</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title">Where Fantasy Meets Reality</h2>
          <p className="hero-description">
            Build powerful decks, catalog vast collections, and soon — battle
            friends in epic showdowns across the multiverse.
          </p>
          <div className="hero-buttons">
            <Link to="/decks" className="btn-primary">Start Building</Link>
            <Link to="/collection" className="btn-secondary">View Collection</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3 className="feature-title">Deckbuilding Hub</h3>
          <p className="feature-description">
            Craft, refine, and share decks with ease. Inspiration is just a card away.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Collection Vault</h3>
          <p className="feature-description">
            Organize your cards into a vault of treasures. Track your inventory and discover what’s missing.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Future Realms</h3>
          <p className="feature-description">
            Soon: battle other planeswalkers, comment on decks, and grow your Nexus of friends.
          </p>
        </div>
      </section>

      <section className="news">
        <h2 className="news-title">Recent Magic Happenings</h2>
        <article className="news-item">
          <h3 className="news-headline">Pro Tour Barcelona 2025: Rakdos Midrange Dominates</h3>
          <p className="news-summary">
            The latest Pro Tour shook up the Standard meta, with Rakdos Midrange
            putting up dominant numbers. Expect adjustments as players refine their strategies.
          </p>
          <Link to="/news" className="news-link">Read More</Link>
        </article>
      </section>

      <footer className="homepage-footer">
        <p className="footer-text">
          The Fabled Nexus © 2025 — For Planeswalkers, by Planeswalkers.
        </p>
      </footer>
    </div>
  );
}
