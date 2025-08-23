import "./NewsPage.css";

export default function NewsPage() {
  return (
    <div className="news-page">
      <header className="news-header">
        <h1 className="page-title">Magic News & Updates</h1>
      </header>

      <section className="news-section">
        <article className="news-item">
          <h2 className="news-headline">Pro Tour Barcelona 2025: Rakdos Midrange Dominates</h2>
          <p className="news-summary">
            The latest Pro Tour shook up the Standard meta, with Rakdos Midrange
            putting up dominant numbers. Expect adjustments as players refine their strategies.
          </p>
          <p className="news-detail">
            The tournament saw innovative deck tech from multiple top-tier players. 
            Key card interactions and sideboard strategies have been discussed widely across online forums.
            Keep an eye on decklists and meta shifts to stay competitive.
          </p>
        </article>

        <article className="news-item">
          <h2 className="news-headline">Upcoming Set Preview: Phantasmal Horizons</h2>
          <p className="news-summary">
            Wizards of the Coast teases the next set, promising exciting mechanics
            and a deeper dive into multiverse lore. Collectors and players alike
            are eagerly anticipating release day.
          </p>
        </article>
      </section>

      <footer className="news-footer">
        <p className="footer-text">
          The Fabled Nexus © 2025 — Stay informed, stay legendary.
        </p>
      </footer>
    </div>
  );
}
