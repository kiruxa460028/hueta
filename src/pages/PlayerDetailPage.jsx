import React, { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getPlayerDetail, BRACKET_INFO, teamById, leagueById } from "../data/db.js";
import { heroById } from "../data/heroes.js";
import { useBracket, BracketTabs } from "../context.jsx";
import { PlayerAvatar, HeroIcon, TeamLogo, RankBadge, WinRateBar } from "../components/common.jsx";
import { wrColor, flag, POS_LABELS, fmtDuration, fmtAgo, fmtNum } from "../lib/format.js";

function RecentRow({ ap }) {
  const { match, perf, won } = ap;
  const hero = heroById.get(perf.heroId);
  const leagueName = match.bracket === "pro" ? leagueById.get(match.leagueId)?.name : `${BRACKET_INFO[match.bracket].label} · Рейтинг`;
  return (
    <Link to={`/matches/${match.id}`} className="match-row">
      <div className="match-row__league">
        <span className="match-row__league-name">{leagueName}</span>
        <span className={`match-row__stage ${won ? "trend-up" : "trend-down"}`}>{won ? "Победа" : "Поражение"}</span>
      </div>
      <div className="match-row__teams">
        <div className="match-row__team">
          <HeroIcon hero={hero} size="md" />
          <span className="match-row__name">{hero.n}</span>
          <span className="kda-cell" style={{ marginLeft: 8, fontSize: 13 }}>
            <span className="k">{perf.kills}</span>/<span className="d">{perf.deaths}</span>/<span>{perf.assists}</span>
          </span>
        </div>
        <div className="match-row__score" style={{ color: won ? "var(--radiant)" : "var(--dire)", fontSize: 12, letterSpacing: 0.5 }}>
          {won ? "WIN" : "LOSS"}
        </div>
        <div className="match-row__team right">
          <span className="muted" style={{ fontSize: 12 }}>{perf.gpm} GPM · {fmtNum(perf.nw)} нетворт</span>
        </div>
      </div>
      <div className="match-row__meta">
        <span className="match-row__duration">{fmtDuration(match.duration)}</span>
        <span>{fmtAgo(match.startTs)}</span>
      </div>
    </Link>
  );
}

export default function PlayerDetailPage() {
  const { id } = useParams();
  const { bracket } = useBracket();
  const detail = useMemo(() => getPlayerDetail(id, bracket), [id, bracket]);

  if (!detail) return <Navigate to="/players" replace />;

  const { row, pro, heroes, recent } = detail;
  const team = pro ? teamById.get(pro.teamId) : null;

  return (
    <div className="page">
      <BracketTabs extra={{ title: "Игроки", subtitle: BRACKET_INFO[bracket].full }} />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body hero-banner">
          <PlayerAvatar nick={row.nick} size={64} />
          <div className="hero-banner__info">
            <div className="hero-banner__name">
              {row.nick} <span style={{ fontSize: 18 }}>{flag(row.country)}</span>
              <RankBadge bracket={bracket} />
            </div>
            <div className="muted" style={{ marginTop: 4, fontSize: 12.5 }}>
              {team ? (
                <>Команда: <Link to={`/teams/${team.id}`} style={{ fontWeight: 700 }}>{team.name}</Link></>
              ) : (
                <>Без команды</>
              )}
              {pro && ` · ${POS_LABELS[pro.pos] || ""}`}
              {` · Матчей: ${row.n}`}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="stat-card__label">{bracket === "pro" ? "Рейтинг" : "MMR"}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#d9c07f" }}>{row.rating}</div>
          </div>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-card__label">Матчи</div>
          <div className="stat-card__value">{row.n}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Винрейт</div>
          <div className="stat-card__value" style={{ color: wrColor(row.wr) }}>{row.wr.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">KDA</div>
          <div className="stat-card__value">{row.kda.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Средний GPM</div>
          <div className="stat-card__value">{row.gpmAvg}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Средний нетворт</div>
          <div className="stat-card__value">{fmtNum(row.nwAvg)}</div>
        </div>
      </div>

      <div className="section grid-2">
        <div className="card">
          <div className="card__head"><span className="card__title">Герои игрока</span></div>
          <div className="wide-table-wrap">
            <table className="tbl">
              <thead>
                <tr><th style={{ textAlign: "left" }}>Герой</th><th>Матчи</th><th>Винрейт</th></tr>
              </thead>
              <tbody>
                {heroes.slice(0, 12).map((h) => (
                  <tr key={h.hero.id} className="link">
                    <td>
                      <Link to={`/heroes/${h.hero.s}?bracket=${bracket}`} style={{ display: "block" }}>
                        <span className="hero-cell">
                          <HeroIcon hero={h.hero} size="md" />
                          <span className="hero-cell__name">{h.hero.n}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="num">{h.n}</td>
                    <td className="num" style={{ color: wrColor(h.wr), fontWeight: 700 }}>{h.wr.toFixed(0)}%<WinRateBar wr={h.wr} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card__head"><span className="card__title">Последние матчи</span></div>
          <div className="card__body card__body--flush">
            {recent.map((ap) => <RecentRow key={ap.match.id} ap={ap} bracket={bracket} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
