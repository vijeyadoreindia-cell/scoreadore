import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { path: "/", label: "Podcasts" },
    { path: "/programs", label: "Our Programs" },
    { path: "/webinars", label: "Upcoming Workshops and Webinars" },
    { path: "/glimpses", label: "Session Glimpses" },
    { path: "/about", label: "About ADORE India" },
  ];

  // Close dropdown when clicking/tapping outside
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    // Use mousedown so we can check before focus moves away
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchend", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchend", handleOutside);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner container">
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt="ADORE India" className="navbar-logo" />
            <div className="navbar-divider" />
            <img src="/score.png" alt="SCORE" className="navbar-score" />
          </Link>

          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>

          <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`nav-link ${location.pathname === l.path ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link admin-link ${location.pathname === "/admin" ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                ⚙ Admin
              </Link>
            )}
          </div>

          <div className="navbar-auth">
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                {/* Avatar — click to toggle dropdown */}
                <button
                  className="user-avatar-btn"
                  onMouseDown={(e) => { e.stopPropagation(); setDropdownOpen(v => !v); }}
                  onTouchEnd={(e) => { e.stopPropagation(); setDropdownOpen(v => !v); }}
                  aria-label="User menu"
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                    : <div className="user-avatar-initials">
                        {(user.displayName || user.email || "U")[0].toUpperCase()}
                      </div>
                  }
                </button>

                {/* Dropdown — stays open until outside click */}
                {dropdownOpen && (
                  <div className="user-dropdown open" onMouseLeave={() => {}}>
                    <p className="user-name">{user.displayName || "User"}</p>
                    <p className="user-email">{user.email}</p>
                    {isAdmin && <span className="badge-admin">Admin</span>}
                    <button className="dropdown-btn" onMouseDown={handleLogout}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-primary btn-sm signin-btn" onClick={() => setShowAuth(true)}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
