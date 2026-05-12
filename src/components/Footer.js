import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="ADORE India" className="footer-logo-adore" />
          <div className="footer-divider" />
          <img src="/score.png" alt="SCORE" className="footer-logo-score" />
          <p>Motivating youth for positive action</p>
        </div>

        <div className="footer-links">
          <Link to="/programs">Our Programs</Link>
          <Link to="/about">About ADORE India</Link>
          <a href="https://adoreglobal.org" target="_blank" rel="noreferrer">Website</a>
          <a href="https://whatsapp.com/channel/0029VbBcAIvCnA7p0yImIK1F" target="_blank" rel="noreferrer">
            WhatsApp Channel
          </a>
        </div>

        <div className="footer-copy">
          <p>© {new Date().getFullYear()} ADORE India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
