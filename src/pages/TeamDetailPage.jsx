import React, { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getTeamDetail, getPlayersList, teamById } from "../data/db.js";
import { REGION_RU } from "../data/scene.js";
import { TeamLogo, PlayerAvatar, HeroIcon, WinRateBar } from "../components/common.jsx";
import { MatchRow } from "../components/MatchRows.jsx";
import { wrColor, flag, POS_LABELS, fmtNum } from "../lib/format.js";

export default function TeamDetailPage() {
  const { id } = useParams();
  const detail = useMemo(() => getTeamDetail(Number(id)), [id]);
  const playerStats = useMemo(() => getPlayersList("pro"), []);

  if (!detail) return <Navigate to="/teams" replace />;

  const { team, row, matches, topHeroes } = detail;

  return (
    <div className="page">
      <div className="bracket-row">
        <div>
          <h1 className="page-title">Команды</h1>
          <p className="page-subtitle">Профессиональная сцена</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body hero-banner">
          <TeamLogo team={team} size={64} />
          <div className="hero-banner__info">
            <div className="hero-banner__name">{team.name}</div>
            <div className="muted" style={{ marginTop: 4, fontSize: 12.5 }}>
              {REGION_RU[team.region]} · Матчей: {row?.matches ?? 0}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="stat-card__label">Рейтинг</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#d9c07f" }}>{row?.rating ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-card__label">Матчи</div>
          <div className="stat-card__value">{row?.matches ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Победы</div>
          <div className="stat-card__value" style={{ color: "var(--radiant)" }}>{row?.wins ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Винрейт</div>
          <div className="stat-card__value" style={{ color: wrColor(row?.wr ?? 50) }}>{(row?.wr ?? 0).toFixed(1)}%</div>
        </div>
      </div>

      <div className="section grid-2">
        <div className="card">
          <div className="card__head"><span className="card__title">Состав</span></div>
          <div className="wide-table-wrap">
            <table className="tbl">
              <thead>
                <tr><th style={{ textAlign: "left" }}>Игрок</th><th>Позиция</th><th>Матчи</th><th>Винрейт</th><th>KDA</th></tr>
              </thead>
              <tbody>
                {team.roster.map((p) => {
                  const st = playerStats.find((x) => x.playerId === p.id);
                  return (
                    <tr key={p.id} className="link">
                      <td>
                        <Link to={`/players/${p.id}?bracket=pro`} style={{ display: "block" }}>
                          <span className="hero-cell">
                            <PlayerAvatar nick={p.nick} size={30} />
                            <span>
                              <span className="hero-cell__name">{p.nick} <span style={{ fontSize: 12 }}>{flag(p.country)}</span></span>
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="muted">{POS_LABELS[p.pos]}</td>
                      <td className="num">{st?.n ?? 0}</td>
                      <td className="num" style={{ fontWeight: 700, color: wrColor(st?.wr ?? 50) }}>{st ? `${st.wr.toFixed(0)}%` : "—"}</td>
                      <td className="num">{st ? st.kda.toFixed(2) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card__head"><span className="card__title">Топ героев команды</span></div>
          <div className="wide-table-wrap">
            <table className="tbl">
              <thead>
                <tr><th style={{ textAlign: "left" }}>Герой</th><th>Матчи</th><th>Винрейт</th></tr>
              </thead>
              <tbody>
                {topHeroes.map((h) => (
                  <tr key={h.hero.id} className="link">
                    <td>
                      <Link to={`/heroes/${h.hero.s}?bracket=pro`} style={{ display: "block" }}>
                        <span className="hero-cell">
                          <HeroIcon hero={h.hero} size="md" />
                          <span className="hero-cell__name">{h.hero.n}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="num">{h.n}</td>
                    <td className="num" style={{ fontWeight: 700, color: wrColor(h.wr) }}>{h.wr.toFixed(0)}%<WinRateBar wr={h.wr} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__head"><h2 className="section__title">Последние матчи</h2></div>
        <div className="card">
          <div className="card__body card__body--flush">
            {matches.map(({ match }) => <MatchRow key={match.id} match={match} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
