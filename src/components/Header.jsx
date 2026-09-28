import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { searchAll } from "../data/db.js";
import { useBracket } from "../context.jsx";
import { HeroIcon, TeamLogo, PlayerAvatar, RankBadge } from "./common.jsx";
import { flag } from "../lib/format.js";

function Logo() {
  return (
    <Link to="/" className="logo">
      <svg className="logo__mark" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" stroke="#ff5a3c" strokeWidth="2.4" opacity="0.9" />
        <circle cx="20" cy="20" r="11" stroke="#ff5a3c" strokeWidth="1.6" opacity="0.55" />
        <circle cx="20" cy="20" r="2.6" fill="#ff5a3c" />
        <path d="M20 20 L36 8" stroke="#ff5a3c" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 20 L9 34" stroke="#ff5a3c" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </svg>
      <span>
        <span className="logo__text">DOTA<em>PROTRACKER</em></span>
        <span className="logo__sub">мета · статистика · трекинг</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { bracket } = useBracket();

  const results = open && q.trim().length >= 1 ? searchAll(q) : null;
  const flat = results
    ? [...results.heroes.map((h) => ({ type: "hero", obj: h })), ...results.players.map((p) => ({ type: "player", obj: p })), ...results.teams.map((t) => ({ type: "team", obj: t }))]
    : [];

  // горячая клавиша "/"
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // закрыть дропдаун при смене страницы
  useEffect(() => setOpen(false), [location]);

  const go = (item) => {
    setOpen(false);
    setQ("");
    if (item.type === "hero") navigate(`/heroes/${item.obj.s}?bracket=${bracket}`);
    else if (item.type === "player") navigate(`/players/${item.obj.id}?bracket=${bracket}`);
    else navigate(`/teams/${item.obj.id}`);
  };

  const onKeyDown = (e) => {
    if (!flat.length) {
      if (e.key === "Enter" && q.trim()) {
        navigate(`/search?q=${encodeURIComponent(q.trim())}&bracket=${bracket}`);
        setOpen(false);
      }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(flat[hi]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  let idx = -1;

  return (
    <header className="header">
      <div className="container header__inner">
        <Logo />
        <div className="search-wrap">
          <span className="search-ico">🔍</span>
          <input
            ref={inputRef}
            className="search"
            placeholder="Поиск игрока, команды или героя…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {!q && <span className="search-key">/</span>}
          {results && (
            <div className="search-dd">
              {flat.length === 0 && <div className="search-dd__empty">Ничего не найдено по «{q}»</div>}
              {results.heroes.length > 0 && (
                <div className="search-dd__group">
                  <div className="search-dd__label">Герои</div>
                  {results.heroes.map((h) => {
                    idx++;
                    const myIdx = idx;
                    return (
                      <div key={h.id} className="search-dd__item" style={myIdx === hi ? { background: "#1f2534" } : undefined}
                        onMouseEnter={() => setHi(myIdx)} onClick={() => go(flat[myIdx])}>
                        <HeroIcon hero={h} size="sm" />
                        <span style={{ fontWeight: 600 }}>{h.n}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {results.players.length > 0 && (
                <div className="search-dd__group">
                  <div className="search-dd__label">Игроки</div>
                  {results.players.map((p) => {
                    idx++;
                    const myIdx = idx;
                    return (
                      <div key={p.id} className="search-dd__item" style={myIdx === hi ? { background: "#1f2534" } : undefined}
                        onMouseEnter={() => setHi(myIdx)} onClick={() => go(flat[myIdx])}>
                        <PlayerAvatar nick={p.nick} size={26} />
                        <span style={{ fontWeight: 600 }}>{p.nick}</span>
                        <span className="muted" style={{ fontSize: 12 }}>{flag(p.country)} {p.pro ? `· ${p.teamId ? "про" : ""}` : ""}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {results.teams.length > 0 && (
                <div className="search-dd__group">
                  <div className="search-dd__label">Команды</div>
                  {results.teams.map((t) => {
                    idx++;
                    const myIdx = idx;
                    return (
                      <div key={t.id} className="search-dd__item" style={myIdx === hi ? { background: "#1f2534" } : undefined}
                        onMouseEnter={() => setHi(myIdx)} onClick={() => go(flat[myIdx])}>
                        <TeamLogo team={t} size={26} />
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <nav className="nav">
          <Link to={`/matches?bracket=${bracket}`} className={location.pathname.startsWith("/matches") ? "active" : ""}>Матчи</Link>
          <Link to={`/heroes?bracket=${bracket}`} className={location.pathname.startsWith("/heroes") ? "active" : ""}>Герои</Link>
          <Link to={`/players?bracket=${bracket}`} className={location.pathname.startsWith("/players") ? "active" : ""}>Игроки</Link>
          <Link to={`/teams`} className={location.pathname.startsWith("/teams") ? "active" : ""}>Команды</Link>
        </nav>
      </div>
    </header>
  );
}
