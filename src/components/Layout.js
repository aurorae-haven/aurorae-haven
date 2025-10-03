import React from "react";
import { Link, useLocation } from "react-router-dom";

function Layout({ children, onExport, onImport }) {
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <>
      <div className="planet-wrap">
        <div className="planet" />
      </div>
      <header className="appbar">
        <div className="inner">
          <div className="logo" aria-hidden="true" />
          <div className="brand">
            <b>Stellar Journey</b>
            <small>Explore your orbit. Follow your path.</small>
          </div>
          <nav className="appnav" aria-label="Main">
            <Link
              className={`item ${isActive("/") || isActive("/home") ? "active" : ""}`}
              to="/"
            >
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </Link>
            <Link className={`item ${isActive("/schedule")}`} to="/schedule">
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Schedule</span>
            </Link>
            <Link className={`item ${isActive("/sequences")}`} to="/sequences">
              <svg className="icon" viewBox="0 0 24 24">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v5l3 2" />
                <path d="M9 2h6" />
              </svg>
              <span>Sequences</span>
            </Link>
            <Link className={`item ${isActive("/braindump")}`} to="/braindump">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5V5a2 2 0 0 1 2-2H20z" />
              </svg>
              <span>Brain Dump</span>
            </Link>
            <Link className="item" to="/tasks">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M8 6h13M8 12h13M8 18h13" />
                <path d="M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              <span>Tasks</span>
            </Link>
            <Link className="item" to="/habits">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M7 20s6-3 6-10V4" />
                <path d="M14 4s5 0 6 5c-5 1-6-5-6-5z" />
                <path d="M2 9c2-5 8-5 8-5s0 6-8 5z" />
              </svg>
              <span>Habits</span>
            </Link>
            <Link className="item" to="/stats">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 3v18h18" />
                <rect x="7" y="12" width="3" height="6" />
                <rect x="12" y="9" width="3" height="9" />
                <rect x="17" y="5" width="3" height="13" />
              </svg>
              <span>Stats</span>
            </Link>
            <Link className="item" to="/settings">
              <svg className="icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6l-.09.1a2 2 0 0 1-3.82 0l-.09.1a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1l-.1-.09a2 2 0 0 1 0-3.82l.1-.09a1.65 1.65 0 0 0 .6-1A1.65 1.65 0 0 0 4.6 8.6l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6l.09-.1a2 2 0 0 1 3.82 0l.09.1a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1 1.65 1.65 0 0 0 .6 1z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>
          <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
            <button className="btn" onClick={onExport}>
              Export
            </button>
            <label className="btn" style={{ cursor: "pointer" }}>
              Import
              <input
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={onImport}
              />
            </label>
          </div>
        </div>
      </header>
      <div className="shell">{children}</div>
    </>
  );
}

export default Layout;
