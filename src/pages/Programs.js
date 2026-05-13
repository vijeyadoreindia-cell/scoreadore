import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./Programs.css";

function parseTopics(line) {
  if (!line || typeof line !== "string") return [];
  return line
    .split(/[|\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <p>Workshops and learning tracks curated by ADORE India SCORE — updated by our team.</p>
        </section>

        {loading ? (
          <div className="programs-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="program-card skeleton-card programs-skeleton">
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
    </main>
  );
}
