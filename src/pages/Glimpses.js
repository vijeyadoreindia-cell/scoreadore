import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDriveThumbnailUrl, getDriveViewUrl, formatDate } from "../utils/driveUtils";
import "./Glimpses.css";

export default function Glimpses() {
  const [glimpses, setGlimpses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchGlimpses(); }, []);

  async function fetchGlimpses() {
    try {
      const q = query(collection(db, "glimpses"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setGlimpses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <main className="page-main">
      <div className="container">
        <section className="page-hero fade-up">
          <div className="hero-badge">🎬 Session Glimpses</div>
          <h1>Relive the <span className="highlight">Moments</span></h1>
          <p>Highlights and photos from our past sessions, workshops, webinars, and special events.</p>
        </section>

        {loading ? (
          <div className="glimpses-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glimpse-card skeleton-card">
                <div className="skeleton thumb-skeleton" />
                <div className="skeleton" style={{ height: 18, margin: "14px 14px 8px" }} />
                <div className="skeleton" style={{ height: 14, margin: "0 14px 14px", width: "60%" }} />
              </div>
            ))}
          </div>
        ) : glimpses.length === 0 ? (
          <div className="empty-state fade-up">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No glimpses yet. Photos from past events will appear here.</p>
          </div>
        ) : (
          <div className="glimpses-grid">
            {glimpses.map((g, i) => (
              <GlimpseCard key={g.id} glimpse={g} index={i} onClick={() => setSelected(g)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="glimpse-modal" onClick={(e) => e.stopPropagation()}>
            <div className="glimpse-modal-header">
              <div>
                <h3>{selected.title}</h3>
                {selected.date && <p className="guest-label">📅 {formatDate(selected.date)}</p>}
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="glimpse-modal-img">
              <GlimpseImage imageUrl={selected.imageUrl} alt={selected.title} />
            </div>
            {selected.description && <p className="video-desc">{selected.description}</p>}
            <div className="glimpse-modal-actions">
              {selected.imageUrl && (
                <a href={getDriveViewUrl(selected.imageUrl)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  🔗 Open full image
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* Loads a Drive image — plain img tag, no canvas */
function GlimpseImage({ imageUrl, alt }) {
  const [failed, setFailed] = useState(false);
  const thumbUrl = getDriveThumbnailUrl(imageUrl);

  if (!imageUrl || failed) {
    return (
      <div className="glimpse-no-img">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>Image not available</p>
      </div>
    );
  }

  return (
    <img
      src={thumbUrl || imageUrl}
      alt={alt}
      className="glimpse-full-img"
      onError={() => setFailed(true)}
    />
  );
}

function GlimpseCard({ glimpse, index, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const thumbUrl = getDriveThumbnailUrl(glimpse.imageUrl);

  return (
    <div className="glimpse-card fade-up" style={{ animationDelay: `${index * 0.06}s` }} onClick={onClick}>
      <div className="glimpse-img-wrap">
        {glimpse.imageUrl && !imgFailed ? (
          <img
            src={thumbUrl || glimpse.imageUrl}
            alt={glimpse.title}
            className="glimpse-thumb-img"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="glimpse-img-placeholder">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M21 15l-5-5L5 21" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div className="glimpse-hover-overlay"><span>View</span></div>
        {glimpse.tag && <span className="ep-badge">{glimpse.tag}</span>}
      </div>
      <div className="card-body">
        <h3 className="card-title">{glimpse.title}</h3>
        {glimpse.speaker && <p className="card-guest">👤 {glimpse.speaker}</p>}
        {glimpse.description && <p className="card-desc">{glimpse.description}</p>}
        {glimpse.date && <span className="card-date">📅 {formatDate(glimpse.date)}</span>}
      </div>
    </div>
  );
}
