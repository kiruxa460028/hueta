import React, { useMemo, useState } from "react";
import { useBracket, useDataSource, BracketTabs } from "../context.jsx";
import { useMatchList } from "../data/hooks.js";
import { getLiveMatches } from "../data/db.js";
import { LEAGUES } from "../data/scene.js";
import { MatchRow, LiveCard } from "../components/MatchRows.jsx";
import { Empty } from "../components/common.jsx";

export default function MatchesPage() {
  const { bracket } = useBracket();
  const { mode } = useDataSource();
  const isLive = mode === "live";
  const live = useMemo(() => getLiveMatches().filter((m) => m.bracket === bracket), [bracket]);
  const matches = useMatchList(bracket);
  const [league, setLeague] = useState("all");
  const [limit, setLimit] = useState(30);

  // список турниров: реальные (из ленты) или демо
  const leagueOptions = useMemo(() => {
    if (isLive && bracket === "pro") {
      const map = new Map();
      for (const m of matches) if (m.leagueName) map.set(m.leagueName, m.leagueName);
      return [...map.values()].sort();
    }
    return LEAGUES.map((l) => l.name);
  }, [matches, isLive, bracket]);

  const filtered = useMemo(
    () => (league === "all" ? matches : matches.filter((m) => (isLive ? m.leagueName === league : leagueByIdName(m, league)))),
    [matches, league, isLive]
  );

  const isRealFeed = isLive && bracket === "pro";

  return (
    <div className="page">
      <BracketTabs
        extra={{
          title: "Матчи",
          subtitle: isRealFeed
            ? `${matches.length} реальных про-матчей · OpenDota`
            : `${matches.length} матчей · демо-генератор`,
        }}
      />

      {!isLive && live.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="section__head" style={{ marginBottom: 10 }}>
            <h2 className="section__title"><span className="live-dot" /> Живые <span className="demo-chip">демо</span></h2>
          </div>
          <div className="live-grid">
            {live.map((m) => <LiveCard key={m.id} match={m} />)}
          </div>
        </div>
      )}

      <div className="filter-row">
        {bracket === "pro" && leagueOptions.length > 0 && (
          <select className="input" value={league} onChange={(e) => { setLeague(e.target.value); setLimit(30); }}>
            <option value="all">Все турниры</option>
            {leagueOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
        <span className="muted" style={{ fontSize: 12.5 }}>
          Найдено: {filtered.length} {isRealFeed && <span className="real-chip">OpenDota</span>}
          {!isLive && <span className="demo-chip">демо</span>}
        </span>
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

function leagueByIdName(match, leagueName) {
  // демо-режим: ищем название лиги по leagueId
  const l = LEAGUES.find((x) => x.name === leagueName);
  return l ? match.leagueId === l.id : true;
}
