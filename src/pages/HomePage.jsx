import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getLiveMatches, getMatches, getHeroMeta, getPlayersList, getTeamsList, BRACKET_INFO } from "../data/db.js";
import { useBracket, BracketTabs } from "../context.jsx";
import { LiveCard, MatchRow } from "../components/MatchRows.jsx";
import HeroMetaTable from "../components/HeroMetaTable.jsx";
import { HeroIcon, PlayerAvatar, TeamLogo } from "../components/common.jsx";
import { flag, wrColor } from "../lib/format.js";

function SidebarCard({ title, linkTo, children }) {
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">{title}</span>
        <Link className="card__link" to={linkTo}>Все →</Link>
      </div>
      <div className="card__body card__body--flush">{children}</div>
    </div>
  );
}

export default function HomePage() {
  const { bracket } = useBracket();
  const live = useMemo(() => getLiveMatches().filter((m) => m.bracket === bracket), [bracket]);
  const matches = useMemo(() => getMatches(bracket), [bracket]);
  const meta = useMemo(() => getHeroMeta(bracket), [bracket]);
  const players = useMemo(() => getPlayersList(bracket).slice(0, 7), [bracket]);
  const teams = useMemo(() => getTeamsList().slice(0, 6), []);
  const topMeta = useMemo(() => [...meta].sort((a, b) => b.score - a.score).slice(0, 15), [meta]);
  const trendingUp = useMemo(() => [...meta].sort((a, b) => b.delta - a.delta).slice(0, 4), [meta]);
  const trendingDown = useMemo(() => [...meta].sort((a, b) => a.delta - b.delta).slice(0, 4), [meta]);

  return (
    <div className="page">
      <BracketTabs extra={{ title: "Матчи и мета", subtitle: `${BRACKET_INFO[bracket].full} · обновляется в реальном времени` }} />

      {live.length > 0 && (
        <div className="section" style={{ marginTop: 0 }}>
          <div className="section__head">
            <h2 className="section__title"><span className="live-dot" /> Живые матчи</h2>
            <Link className="card__link" to={`/matches?bracket=${bracket}`}>Все матчи →</Link>
          </div>
          <div className="live-grid">
            {live.map((m) => <LiveCard key={m.id} match={m} />)}
          </div>
        </div>
      )}

      <div className="section">
        <div className="layout-main">
          <div className="card">
            <div className="card__head">
              <span className="card__title">Последние матчи</span>
              <Link className="card__link" to={`/matches?bracket=${bracket}`}>Показать все →</Link>
            </div>
            <div className="card__body card__body--flush">
              {matches.slice(0, 14).map((m) => <MatchRow key={m.id} match={m} />)}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <SidebarCard title="Топ игроков" linkTo={`/players?bracket=${bracket}`}>
              {players.map((p, i) => (
                <Link key={p.playerId} to={`/players/${p.playerId}?bracket=${bracket}`} className="matchup-row">
                  <span className="muted" style={{ width: 16, fontSize: 12 }}>{i + 1}</span>
                  <PlayerAvatar nick={p.nick} size={28} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    {p.nick} <span style={{ fontSize: 12 }}>{flag(p.country)}</span>
                  </span>
                  <span className="matchup-row__wr" style={{ color: wrColor(p.wr) }}>{p.wr.toFixed(0)}%</span>
                </Link>
              ))}
            </SidebarCard>

            <SidebarCard title="Тренды недели" linkTo={`/heroes?bracket=${bracket}`}>
              {trendingUp.map((r) => (
                <Link key={r.hero.id} to={`/heroes/${r.hero.s}?bracket=${bracket}`} className="matchup-row">
                  <HeroIcon hero={r.hero} size="sm" />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.hero.n}</span>
                  <span className="matchup-row__wr trend-up">▲ {r.delta.toFixed(1)}</span>
                </Link>
              ))}
              {trendingDown.map((r) => (
                <Link key={r.hero.id} to={`/heroes/${r.hero.s}?bracket=${bracket}`} className="matchup-row">
                  <HeroIcon hero={r.hero} size="sm" />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.hero.n}</span>
                  <span className="matchup-row__wr trend-down">▼ {Math.abs(r.delta).toFixed(1)}</span>
                </Link>
              ))}
            </SidebarCard>

            {bracket === "pro" && (
              <SidebarCard title="Топ команд" linkTo="/teams">
                {teams.map((t) => (
                  <Link key={t.team.id} to={`/teams/${t.team.id}`} className="matchup-row">
                    <TeamLogo team={t.team} size={26} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{t.team.name}</span>
                    <span className="matchup-row__wr" style={{ color: wrColor(t.wr) }}>{t.wr.toFixed(0)}%</span>
                  </Link>
                ))}
              </SidebarCard>
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__head">
          <h2 className="section__title">Мета героев · {BRACKET_INFO[bracket].label}</h2>
          <Link className="card__link" to={`/heroes?bracket=${bracket}`}>Полная таблица и тир-лист →</Link>
        </div>
        <div className="card">
          <HeroMetaTable data={topMeta} initialSort={{ key: "score", dir: "desc" }} />
        </div>
      </div>
    </div>
  );
}
