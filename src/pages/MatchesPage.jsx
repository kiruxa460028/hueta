import React, { useMemo, useState } from "react";
import { getMatches, getLiveMatches } from "../data/db.js";
import { LEAGUES } from "../data/scene.js";
import { useBracket, BracketTabs } from "../context.jsx";
import { MatchRow, LiveCard } from "../components/MatchRows.jsx";
import { Empty } from "../components/common.jsx";

export default function MatchesPage() {
  const { bracket } = useBracket();
  const live = useMemo(() => getLiveMatches().filter((m) => m.bracket === bracket), [bracket]);
  const matches = useMemo(() => getMatches(bracket), [bracket]);
  const [league, setLeague] = useState("all");
  const [limit, setLimit] = useState(30);

  const filtered = useMemo(
    () => (league === "all" ? matches : matches.filter((m) => String(m.leagueId) === league)),
    [matches, league]
  );

  return (
    <div className="page">
      <BracketTabs extra={{ title: "Матчи", subtitle: `${matches.length} матчей за последние 30 дней` }} />

      {live.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="section__head" style={{ marginBottom: 10 }}>
            <h2 className="section__title"><span className="live-dot" /> Живые</h2>
          </div>
          <div className="live-grid">
            {live.map((m) => <LiveCard key={m.id} match={m} />)}
          </div>
        </div>
      )}

      <div className="filter-row">
        {bracket === "pro" && (
          <select className="input" value={league} onChange={(e) => { setLeague(e.target.value); setLimit(30); }}>
            <option value="all">Все турниры</option>
            {LEAGUES.map((l) => (
              <option key={l.id} value={String(l.id)}>{l.name}</option>
            ))}
          </select>
        )}
        <span className="muted" style={{ fontSize: 12.5 }}>Найдено: {filtered.length}</span>
      </div>

      <div className="card">
        <div className="card__body card__body--flush">
          {filtered.slice(0, limit).map((m) => <MatchRow key={m.id} match={m} />)}
        </div>
        {filtered.length === 0 && <Empty text="Матчи не найдены" />}
        {filtered.length > limit && (
          <div className="pagination">
            <button className="btn" onClick={() => setLimit(limit + 30)}>Показать ещё</button>
          </div>
        )}
      </div>
    </div>
  );
}
