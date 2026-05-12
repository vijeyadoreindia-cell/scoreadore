import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDriveViewUrl, getDriveThumbnailUrl, formatDate } from "../utils/driveUtils";
import "./Webinars.css";

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterModal, setPosterModal] = useState(null);

  useEffect(() => { fetchWebinars(); }, []);

  async function fetchWebinars() {
    try {
      const q = query(collection(db, "webinars"), orderBy("date", "asc"));
      const snap = await getDocs(q);
      setWebinars(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const upcoming = webinars.filter((w) => !w.completed);

  return (
    <main className="page-main">
      <div className="container">
        <section className="page-hero fade-up">
          <div className="hero-badge">📅 Upcoming Events</div>
          <h1>Webinars & <span className="highlight">Workshops</span></h1>
          <p>Join our live workshops and webinars with experts, mentors, and youth empowerment leaders.</p>
        </section>

        {loading ? (
          <div className="webinars-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="webinar-card skeleton-card">
                <div className="skeleton poster-skeleton" />
                <div className="wc-body">
                  <div className="skeleton" style={{ height: 22, width: "70%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 16, width: "50%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 36, width: 120, marginTop: 16 }} />
                </div>
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="empty-state fade-up">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <p>No upcoming workshops or webinars scheduled. Stay tuned!</p>
          </div>
        ) : (
          <div className="webinars-list">
            {upcoming.map((w, i) => (
              <WebinarCard key={w.id} webinar={w} index={i} onViewPoster={() => setPosterModal(w)} />
            ))}
          </div>
        )}
      </div>

      {/* Poster modal */}
      {posterModal && (
        <div className="modal-backdrop" onClick={() => setPosterModal(null)}>
          <div className="poster-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPosterModal(null)}>✕</button>
            <h3>{posterModal.title}</h3>
            <div className="poster-img-wrap">
              <DriveImage url={posterModal.posterUrl} alt="Event Poster" />
            </div>
            <div className="poster-modal-actions">
              {posterModal.posterUrl && (
                <a href={getDriveViewUrl(posterModal.posterUrl)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  🔗 Open in Drive
                </a>
              )}
              {posterModal.registrationLink && (
                <a href={posterModal.registrationLink} target="_blank" rel="noreferrer" className="btn btn-orange">
                  Register Now →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* Plain Drive image loader — no canvas, just img tag with Drive thumbnail URL */
function DriveImage({ url, alt }) {
  const [failed, setFailed] = useState(false);
  const thumbUrl = getDriveThumbnailUrl(url);

  if (!url || failed) {
    return (
      <div className="poster-fallback" style={{ padding: 40, color: "var(--gray-400)", textAlign: "center" }}>
        📋 No poster available
      </div>
    );
  }

  return (
    <img
      src={thumbUrl || url}
      alt={alt}
      style={{ width: "100%", display: "block", borderRadius: 8 }}
      onError={() => setFailed(true)}
    />
  );
}

function WebinarCard({ webinar, index, onViewPoster }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isUpcoming = webinar.date && new Date(webinar.date) >= new Date();
  const thumbUrl = getDriveThumbnailUrl(webinar.posterUrl);

  return (
    <div className="webinar-card fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="wc-poster" onClick={onViewPoster}>
        {webinar.posterUrl && !imgFailed ? (
          <img
            src={thumbUrl || webinar.posterUrl}
            alt={webinar.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="poster-fallback"><span>📋</span></div>
        )}
        <div className="poster-hover">View Poster</div>
      </div>

      <div className="wc-body">
        <div className="wc-top">
          {isUpcoming && <span className="live-badge">🔔 Upcoming</span>}
          {webinar.tag && <span className="topic-badge">{webinar.tag}</span>}
        </div>
        <h2 className="wc-title">{webinar.title}</h2>
        {webinar.speaker && <p className="wc-speaker">👤 {webinar.speaker}</p>}
        {webinar.description && <p className="wc-desc">{webinar.description}</p>}
        <div className="wc-meta">
          {webinar.date && <div className="meta-item"><span>📅</span><span>{formatDate(webinar.date)}</span></div>}
          {webinar.time && <div className="meta-item"><span>🕐</span><span>{webinar.time}</span></div>}
          {webinar.platform && <div className="meta-item"><span>💻</span><span>{webinar.platform}</span></div>}
        </div>
        <div className="wc-actions">
          <button className="btn btn-ghost btn-sm" onClick={onViewPoster}>View Poster</button>
          {webinar.registrationLink && (
            <a href={webinar.registrationLink} target="_blank" rel="noreferrer" className="btn btn-orange">
              Register Now →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
