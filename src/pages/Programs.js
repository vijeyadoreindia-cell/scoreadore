import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDriveThumbnailUrl, getDriveViewUrl } from "../utils/driveUtils";
import "./Programs.css";

function parseTopics(line) {
  if (!line || typeof line !== "string") return [];
  return line
    .split(/[|\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function DrivePoster({ url, alt, className, onClick }) {
  const [failed, setFailed] = useState(false);
  const thumbUrl = getDriveThumbnailUrl(url);

  if (!url || failed) {
    return (
      <div className={`programs-poster-fallback ${className || ""}`} onClick={onClick}>
        <span>📋</span>
        <span>No poster</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={thumbUrl || url}
      alt={alt}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
}

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterModal, setPosterModal] = useState(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const q = query(collection(db, "programs"), orderBy("sortOrder", "asc"));
        const snap = await getDocs(q);
        setPrograms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
        try {
          const snap = await getDocs(collection(db, "programs"));
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          setPrograms(list);
        } catch (e2) {
          console.error(e2);
        }
      }
      setLoading(false);
    }
    fetchPrograms();
  }, []);

  return (
    <main className="page-main programs-page">
      <div className="container">
        <section className="page-hero fade-up">
          <div className="hero-badge">📚 Our Programs</div>
          <h1>
            Learn, grow & <span className="highlight">shine</span>
          </h1>
          <p>Workshops and learning tracks curated by ADORE India SCORE — topics and posters are updated by our team.</p>
        </section>

        {loading ? (
          <div className="programs-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="program-card skeleton-card programs-skeleton">
                <div className="skeleton programs-skel-poster" />
                <div className="programs-skel-body">
                  <div className="skeleton" style={{ height: 22, width: "75%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="empty-state fade-up">
            <p>Programs will appear here soon. Check back shortly!</p>
          </div>
        ) : (
          <div className="programs-grid">
            {programs.map((p, i) => (
              <article key={p.id} className="program-card fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <button type="button" className="program-poster-btn" onClick={() => setPosterModal(p)} aria-label={`View poster for ${p.title}`}>
                  <DrivePoster url={p.posterUrl} alt={p.title || "Program"} className="program-poster-img" />
                  <span className="program-poster-hint">View poster</span>
                </button>
                <div className="program-card-body">
                  <h2 className="program-title">{p.title}</h2>
                  {parseTopics(p.topicsLine).length > 0 && (
                    <ul className="program-topics">
                      {parseTopics(p.topicsLine).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {posterModal && (
        <div className="modal-backdrop" onClick={() => setPosterModal(null)}>
          <div className="poster-modal program-poster-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setPosterModal(null)}>✕</button>
            <h3>{posterModal.title}</h3>
            <div className="poster-img-wrap">
              <DrivePoster url={posterModal.posterUrl} alt={posterModal.title || "Poster"} />
            </div>
            {posterModal.posterUrl && (
              <div className="poster-modal-actions">
                <a href={getDriveViewUrl(posterModal.posterUrl)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  Open in Google Drive
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
