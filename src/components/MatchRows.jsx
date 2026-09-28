import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teamById, leagueById, BRACKET_INFO } from "../data/db.js";
import { fmtDuration, fmtAgo, fmtNum, flag } from "../lib/format.js";
import { TeamLogo, RankBadge } from "./common.jsx";

// Хук текущего времени (тикает) — для живых матчей
export function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

// Паб-матч: строка с никами игроков
function PubTeamNames({ perfs, right }) {
  const names = perfs.map((p) => `${p.nick}`).join(", ");
  return (
    <span className={`match-row__name dim ${right ? "right" : ""}`} title={names}>
      {names}
    </span>
  );
}

export function MatchRow({ match }) {
  const isPro = match.bracket === "pro";
  const ta = isPro ? teamById.get(match.teams.radiant) : null;
  const tb = isPro ? teamById.get(match.teams.dire) : null;
  const league = isPro ? leagueById.get(match.leagueId) : null;
  const rWin = match.winner === "radiant";

  const seriesScore = isPro && match.series ? (
    <span>
      <span className={rWin ? "w" : "l"}>{match.series.a}</span>
      <span className="muted"> : </span>
      <span className={rWin ? "l" : "w"}>{match.series.b}</span>
    </span>
  ) : null;

  return (
    <Link to={`/matches/${match.id}`} className={`match-row ${isPro ? "" : "match-row--pub"}`}>
      <div className="match-row__league">
        {isPro ? (
          <>
            <span className="match-row__league-name">{league?.name}</span>
            <span className="match-row__stage">{match.stage}{match.series ? ` · Bo${match.series.bo}` : ""}</span>
          </>
        ) : (
          <>
            <span className="match-row__league-name" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <RankBadge bracket={match.bracket} /> Рейтинг
            </span>
            <span className="match-row__stage">All Pick</span>
          </>
        )}
      </div>
      <div className="match-row__teams">
        {isPro ? (
          <>
            <div className="match-row__team">
              <TeamLogo team={ta} size={24} />
              <span className={`match-row__name ${rWin ? "" : "dim"}`}>{ta.name}</span>
            </div>
            <div className="match-row__score">{seriesScore}</div>
            <div className="match-row__team right">
              <span className={`match-row__name ${rWin ? "dim" : ""}`}>{tb.name}</span>
              <TeamLogo team={tb} size={24} />
            </div>
          </>
        ) : (
          <>
            <div className="match-row__team">
              <PubTeamNames perfs={match.perf.radiant} />
            </div>
            <div className="match-row__score">
              <span className={rWin ? "w" : "l"}>{match.kills.radiant}</span>
              <span className="muted"> : </span>
              <span className={rWin ? "l" : "w"}>{match.kills.dire}</span>
            </div>
            <div className="match-row__team right">
              <PubTeamNames perfs={match.perf.dire} right />
            </div>
          </>
        )}
      </div>
      <div className="match-row__meta">
        {isPro && (
          <span className="match-row__duration">
            <span className={rWin ? "w" : "l"}>{match.kills.radiant}</span>
            <span className="muted"> : </span>
            <span className={rWin ? "l" : "w"}>{match.kills.dire}</span>
          </span>
        )}
        <span>{fmtDuration(match.duration)}</span>
        <span>{fmtAgo(match.startTs)}</span>
      </div>
    </Link>
  );
}

// ============================================================================
// Карточка живого матча
// ============================================================================
export function LiveCard({ match }) {
  const now = useNow(1000);
  const isPro = match.bracket === "pro";
  const ta = isPro ? teamById.get(match.teams.radiant) : null;
  const tb = isPro ? teamById.get(match.teams.dire) : null;
  const league = isPro ? leagueById.get(match.leagueId) : null;
  const durMin = match.duration / 60;
  const elapsed = Math.min(durMin, (now - match.startTs) / 60000);
  const progress = elapsed / durMin;
  const rK = Math.round(match.kills.radiant * progress);
  const dK = Math.round(match.kills.dire * progress);
  const rWin = rK >= dK;
  const gold = match.goldAdv[Math.min(match.goldAdv.length - 1, Math.floor(elapsed))] || 0;
  const topPerf = [...match.perf.radiant, ...match.perf.dire]
    .map((p) => ({ ...p, nwNow: p.nw * progress }))
    .sort((a, b) => b.nwNow - a.nwNow)[0];

  return (
    <Link to={`/matches/${match.id}`} className="live-card">
      <div className="live-card__top">
        <span className="live-card__league">
          {isPro ? `${league?.name} · ${match.stage}` : `${BRACKET_INFO[match.bracket].label} · Рейтинг`}
        </span>
        <span className="live-timer"><span className="live-dot" /> {fmtDuration(elapsed * 60)}</span>
      </div>
      <div className="live-card__teams">
        <div className="live-card__team">
          {ta ? <TeamLogo team={ta} size={26} /> : <RankBadge bracket={match.bracket} />}
          <span className="live-card__name">{ta ? ta.name : match.perf.radiant.slice(0, 2).map((p) => p.nick).join(", ")}</span>
          <span className={`live-card__score ${rWin ? "w" : "l"}`}>{rK}</span>
        </div>
        <div className="live-card__team">
          {tb ? <TeamLogo team={tb} size={26} /> : <RankBadge bracket={match.bracket} />}
          <span className="live-card__name">{tb ? tb.name : match.perf.dire.slice(0, 2).map((p) => p.nick).join(", ")}</span>
          <span className={`live-card__score ${rWin ? "l" : "w"}`}>{dK}</span>
        </div>
      </div>
      <div className="live-card__bottom">
        <span className="live-card__gold" style={{ color: gold >= 0 ? "#3ddc84" : "#ff5c5c" }}>
          {gold >= 0 ? "Radiant" : "Dire"} +{fmtNum(Math.abs(gold))} золота
        </span>
        {topPerf && (
          <span>
            Лидер: <b>{topPerf.nick}</b> {fmtNum(topPerf.nwNow)}
          </span>
        )}
      </div>
    </Link>
  );
}
