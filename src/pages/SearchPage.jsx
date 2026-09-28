import React, { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchAll } from "../data/db.js";
import { liveSearch } from "../data/live.js";
import { useDataSource } from "../context.jsx";
import { HeroIcon, PlayerAvatar, TeamLogo, RankBadge, Empty } from "../components/common.jsx";
import { flag } from "../lib/format.js";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const bracket = params.get("bracket") || "pro";
  const { mode } = useDataSource();
  const res = useMemo(() => (mode === "live" ? liveSearch(q) : searchAll(q)), [q, mode]);

  return (
    <div className="page">
      <div className="bracket-row">
        <div>
          <h1 className="page-title">Поиск</h1>
          <p className="page-subtitle">
            Результаты по запросу «{q}» · {mode === "live" ? "живые данные OpenDota" : "демо-режим"}
          </p>
        </div>
      </div>

      {res.heroes.length === 0 && res.players.length === 0 && res.teams.length === 0 && (
        <div className="card"><Empty text={`Ничего не найдено по «${q}»`} /></div>
      )}

      {res.heroes.length > 0 && (
        <div className="section card" style={{ marginTop: 0 }}>
          <div className="card__head"><span className="card__title">Герои</span></div>
          <div className="card__body" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {res.heroes.map((h) => (
              <Link key={h.id} to={`/heroes/${h.s}?bracket=${bracket}`} className="matchup-row" style={{ border: "1px solid var(--border-soft)", borderRadius: 8 }}>
                <HeroIcon hero={h} size="lg" />
                <span style={{ fontWeight: 600 }}>{h.n}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {res.players.length > 0 && (
        <div className="section card">
          <div className="card__head"><span className="card__title">Игроки</span></div>
          <div className="card__body card__body--flush" style={{ padding: 8 }}>
            {res.players.map((p) => (
              <Link key={p.id} to={`/players/${p.id}${String(p.id).startsWith("a") ? "" : `?bracket=${bracket}`}`} className="matchup-row">
                <PlayerAvatar nick={p.nick} size={30} />
                <span style={{ fontWeight: 700 }}>{p.nick} <span style={{ fontSize: 12 }}>{flag(p.country)}</span></span>
                {p.teamName ? (
                  <span className="muted" style={{ fontSize: 12 }}>· {p.teamName}</span>
                ) : p.pro ? (
                  <span className="rank-badge rank-pro">PRO</span>
                ) : (
                  <RankBadge bracket={p.bracket || bracket} />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {res.teams.length > 0 && (
        <div className="section card">
          <div className="card__head"><span className="card__title">Команды</span></div>
          <div className="card__body card__body--flush" style={{ padding: 8 }}>
            {res.teams.map((t) => (
              <Link key={t.id} to={`/teams/${t.id}`} className="matchup-row">
                <TeamLogo team={t} size={30} />
                <span style={{ fontWeight: 700 }}>{t.name}</span>
                <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>{t.tag}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
