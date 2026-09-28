import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { getLiveMatches, BRACKET_INFO } from "../data/db.js";
import { useBracket, useDataSource, BracketTabs } from "../context.jsx";
import { useHeroMeta, useTeamsList, useMatchList } from "../data/hooks.js";
import { LiveCard, MatchRow } from "../components/MatchRows.jsx";
import HeroMetaTable from "../components/HeroMetaTable.jsx";
import { HeroIcon, TeamLogo } from "../components/common.jsx";
import { wrColor } from "../lib/format.js";

function SidebarCard({ title, linkTo, children, chip }) {
  return (
    <div className="card">
      <div className="card__head">
        <span className="card__title">{title} {chip}</span>
        <Link className="card__link" to={linkTo}>Все →</Link>
      </div>
      <div className="card__body card__body--flush">{children}</div>
    </div>
  );
}

export default function HomePage() {
  const { bracket } = useBracket();
  const { mode } = useDataSource();
  const isLive = mode === "live";

  const live = useMemo(() => getLiveMatches().filter((m) => m.bracket === bracket), [bracket]);
  const matches = useMatchList(bracket);
  const meta = useHeroMeta(bracket);
  const teams = useTeamsList();
  const topMeta = useMemo(() => [...meta].sort((a, b) => b.score - a.score).slice(0, 15), [meta]);
  const trendingUp = useMemo(() => [...meta].filter((r) => r.delta != null).sort((a, b) => b.delta - a.delta).slice(0, 4), [meta]);
  const trendingDown = useMemo(() => [...meta].filter((r) => r.delta != null).sort((a, b) => a.delta - b.delta).slice(0, 4), [meta]);

  return (
    <div className="page">
      <BracketTabs
        extra={{
          title: "Матчи и мета",
          subtitle: isLive
            ? `${BRACKET_INFO[bracket].full} · живые данные OpenDota`
            : `${BRACKET_INFO[bracket].full} · демо-режим (офлайн-генератор)`,
        }}
      />

      {!isLive && live.length > 0 && (
        <div className="section" style={{ marginTop: 0 }}>
          <div className="section__head">
            <h2 className="section__title"><span className="live-dot" /> Живые матчи <span className="demo-chip">демо</span></h2>
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
              <span className="card__title">
                {isLive ? "Последние про-матчи" : "Последние матчи"}
                {isLive && bracket === "pro" ? <span className="real-chip">OpenDota</span> : !isLive ? <span className="demo-chip">демо</span> : null}
              </span>
              <Link className="card__link" to={`/matches?bracket=${bracket}`}>Показать все →</Link>
            </div>
            <div className="card__body card__body--flush">
              {matches.slice(0, 14).map((m) => <MatchRow key={m.id} match={m} />)}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {bracket === "pro" && (
              <SidebarCard
                title="Топ команд"
                linkTo="/teams"
                chip={isLive ? <span className="real-chip">OpenDota</span> : <span className="demo-chip">демо</span>}
              >
                {teams.slice(0, 7).map((t, i) => (
                  <Link key={t.team.id} to={`/teams/${t.team.id}`} className="matchup-row">
                    <span className="muted" style={{ width: 16, fontSize: 12 }}>{i + 1}</span>
                    <TeamLogo team={t.team} size={26} />
                    <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.team.name}</span>
                    <span className="matchup-row__wr" style={{ color: "#d9c07f" }}>{t.rating}</span>
                  </Link>
                ))}
              </SidebarCard>
            )}

            {(trendingUp.length > 0 || trendingDown.length > 0) && (
              <SidebarCard title="Тренды недели" linkTo={`/heroes?bracket=${bracket}`} chip={isLive && bracket !== "pro" ? <span className="real-chip">OpenDota</span> : null}>
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
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__head">
          <h2 className="section__title">
            Мета героев · {BRACKET_INFO[bracket].label}
            {isLive ? <span className="real-chip">OpenDota</span> : <span className="demo-chip">демо</span>}
          </h2>
          <Link className="card__link" to={`/heroes?bracket=${bracket}`}>Полная таблица и тир-лист →</Link>
        </div>
        <div className="card">
          <HeroMetaTable data={topMeta} initialSort={{ key: "wr", dir: "desc" }} />
        </div>
      </div>
    </div>
  );
}
