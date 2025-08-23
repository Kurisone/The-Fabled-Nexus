import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-header">
        <h1 className="page-title">About The Fabled Nexus</h1>
      </header>

      <section className="about-content">
        <p>
          The Fabled Nexus is a community-driven hub for Magic: The Gathering enthusiasts.
          From deckbuilding to cataloging collections, our platform helps planeswalkers organize
          their multiverse adventures and connect with fellow players.
        </p>
        <p>
          Founded in 2025, our mission is to provide a clean, intuitive, and inspiring environment
          for players of all levels. Whether you’re a casual collector or a competitive deckbuilder,
          The Fabled Nexus is your gateway to MTG mastery.
        </p>
        <p>
          Our team is composed of passionate players and developers who aim to keep the Nexus
          evolving with new features, community tools, and updates from the MTG multiverse.
        </p>
      </section>

      <footer className="about-footer">
        <p className="footer-text">
          The Fabled Nexus © 2025 — For Planeswalkers, by Planeswalkers.
        </p>
      </footer>
    </div>
  );
}
