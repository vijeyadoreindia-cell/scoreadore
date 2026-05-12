import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { ABOUT_PAGE_DEFAULTS, getDefaultAboutState, normalizeScoreBullets } from "../constants/aboutDefaults";
import "./About.css";

export default function About() {
  const [aboutCopy, setAboutCopy] = useState(getDefaultAboutState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "siteContent", "about"));
        if (cancelled || !snap.exists()) return;
        const d = snap.data();
        setAboutCopy({
          adoreParagraph1: typeof d.adoreParagraph1 === "string" ? d.adoreParagraph1 : ABOUT_PAGE_DEFAULTS.adoreParagraph1,
          adoreParagraph2: typeof d.adoreParagraph2 === "string" ? d.adoreParagraph2 : ABOUT_PAGE_DEFAULTS.adoreParagraph2,
          scoreParagraph1: typeof d.scoreParagraph1 === "string" ? d.scoreParagraph1 : ABOUT_PAGE_DEFAULTS.scoreParagraph1,
          scoreParagraph2: typeof d.scoreParagraph2 === "string" ? d.scoreParagraph2 : ABOUT_PAGE_DEFAULTS.scoreParagraph2,
          scoreBullets: normalizeScoreBullets(d.scoreBullets),
        });
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="page-main">
      <div className="container">

        {/* ── Page Hero ───────────────────────────────────────── */}
        <section className="page-hero fade-up">
          <div className="hero-badge">🌍 Who We Are</div>
          <h1>About <span className="highlight">ADORE India</span> & SCORE</h1>
          <p>Motivating youth for positive action — globally, selflessly, together.</p>
        </section>

        {/* ── ADORE Section ───────────────────────────────────── */}
        <section className="about-section fade-up">
          <div className="about-img-col">
            <img src="/logo.png" alt="ADORE India" className="about-img adore-logo-about" />
          </div>
          <div className="about-text-col">
            <div className="about-tag">About ADORE India</div>
            <h2>Motivating Youth for <span className="highlight">Positive Action</span></h2>
            <p>{aboutCopy.adoreParagraph1}</p>
            <p>{aboutCopy.adoreParagraph2}</p>
            <div className="about-actions">
              <a
                href="https://adoreglobal.org"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                🌐 Visit ADORE Global Website
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbBcAIvCnA7p0yImIK1F"
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Join WhatsApp Channel
              </a>
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div className="about-divider" />

        {/* ── SCORE Section ───────────────────────────────────── */}
        <section className="about-section about-section-reverse fade-up">
          <div className="about-img-col">
            <img src="/score.png" alt="Team SCORE" className="about-img score-logo-about" />
          </div>
          <div className="about-text-col">
            <div className="about-tag score-tag">About SCORE</div>
            <h2>Speaker College <span className="highlight">Corporate Outreach</span></h2>
            <p>{aboutCopy.scoreParagraph1}</p>
            {String(aboutCopy.scoreParagraph2 || "").trim() ? <p>{aboutCopy.scoreParagraph2}</p> : null}
            <ul className="score-list">
              {aboutCopy.scoreBullets.map((row, idx) => (
                <li key={idx}>
                  <span className="score-bullet">{row.icon || "•"}</span>
                  {row.text}
                </li>
              ))}
            </ul>
            <div className="about-actions">
              <a
                href="https://adoreglobal.org"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                🌐 Know More
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbBcAIvCnA7p0yImIK1F"
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Join WhatsApp Channel
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
