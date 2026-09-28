import React, { useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getMatch, teamById, leagueById, BRACKET_INFO } from "../data/db.js";
import { heroById } from "../data/heroes.js";
import { useNow } from "../components/MatchRows.jsx";
import { HeroIcon, TeamLogo, PlayerAvatar, ItemIcon, RankBadge } from "../components/common.jsx";
import { AdvChart } from "../components/charts.jsx";
import { fmtDuration, fmtDate, fmtNum, flag } from "../lib/format.js";

function SidePerfTable({ match, side }) {
  const isPro = match.bracket === "pro";
  const team = isPro ? teamById.get(match.teams[side]) : null;
  const win = match.winner === side;
  const perfs = match.perf[side];
  const totK = perfs.reduce((a, p) => a + p.kills, 0);
  const totD = perfs.reduce((a, p) => a + p.deaths, 0);
  const totA = perfs.reduce((a, p) => a + p.assists, 0);
  const avgGpm = Math.round(perfs.reduce((a, p) => a + p.gpm, 0) / 5);
  const avgXpm = Math.round(perfs.reduce((a, p) => a + p.xpm, 0) / 5);
  const totNw = perfs.reduce((a, p) => a + p.nw, 0);
  const totDmg = perfs.reduce((a, p) => a + p.dmg, 0);

  return (
    <div className="card">
      <div className={`scoreboard__team ${side}`}>
        {team ? <TeamLogo team={team} size={28} /> : <RankBadge bracket={match.bracket} />}
        <span>{team ? team.name : side === "radiant" ? "Radiant" : "Dire"}</span>
        {win && <span className="win">ПОБЕДА</span>}
      </div>
      <div className="wide-table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Игрок</th>
              <th style={{ textAlign: "left" }}>Герой</th>
              <th>Ур.</th>
              <th>У/С/П</th>
              <th>ЛХ/ДН</th>
              <th>GPM</th>
              <th>XPM</th>
              <th>Золото</th>
              <th>Урон</th>
              <th style={{ textAlign: "right" }}>Предметы</th>
            </tr>
          </thead>
          <tbody>
            {perfs.map((p) => {
              const hero = heroById.get(p.heroId);
              return (
                <tr key={p.playerId}>
                  <td>
                    <span className="player-cell">
                      <PlayerAvatar nick={p.nick} size={26} />
                      <span>
                        <span className="player-cell__nick">{p.nick}</span>{" "}
                        <span className="player-cell__flag">{flag(p.country)}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <Link to={`/heroes/${hero.s}`} className="hero-col">
                      <HeroIcon hero={hero} size="sm" />
                      <span className="hero-col__name">{hero.n}</span>
                    </Link>
                  </td>
                  <td className="num muted">{p.level}</td>
                  <td className="num kda-cell">
                    <span className="k">{p.kills}</span>/<span className="d">{p.deaths}</span>/<span>{p.assists}</span>
                  </td>
                  <td className="num">{p.lh}/{p.dn}</td>
                  <td className="num">{p.gpm}</td>
                  <td className="num">{p.xpm}</td>
                  <td className="num" style={{ color: "var(--gold)", fontWeight: 700 }}>{fmtNum(p.nw)}</td>
                  <td className="num">{fmtNum(p.dmg)}</td>
                  <td>
                    <span className="items-cell">
                      {p.items.items.map((k, i) => <ItemIcon key={i} itemKey={k} />)}
                      {p.items.neutral && <ItemIcon itemKey={p.items.neutral} neutral />}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--bg-panel2)" }}>
              <td colSpan={2} style={{ fontWeight: 800 }}>Итого</td>
              <td />
              <td className="num kda-cell" style={{ fontWeight: 700 }}>{totK}/{totD}/{totA}</td>
              <td />
              <td className="num">{avgGpm}</td>
              <td className="num">{avgXpm}</td>
              <td className="num" style={{ color: "var(--gold)", fontWeight: 700 }}>{fmtNum(totNw)}</td>
              <td className="num">{fmtNum(totDmg)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DraftSide({ match, side }) {
  const isPro = match.bracket === "pro";
  const team = isPro ? teamById.get(match.teams[side]) : null;
  const picks = match.draft.picks[side];
  const bans = match.draft.bans[side];
  return (
    <div className="draft__side">
      <div className="draft__row-label" style={{ color: side === "radiant" ? "var(--radiant)" : "var(--dire)" }}>
        {team ? team.name : side === "radiant" ? "Radiant" : "Dire"} — пики
      </div>
      <div className="draft__picks">
        {picks.map((pk) => {
          const hero = heroById.get(pk.heroId);
          return (
            <Link key={pk.heroId} to={`/heroes/${hero.s}`} className="draft__pick">
              <HeroIcon hero={hero} size="lg" tooltip={hero.n} />
              <span className="draft__pick-pos">{pk.pos}</span>
            </Link>
          );
        })}
      </div>
      <div className="draft__row-label">Баны</div>
      <div className="draft__bans">
        {bans.map((bid, i) => {
          const hero = heroById.get(bid);
          return (
            <Link key={i} to={`/heroes/${hero.s}`} className="draft__ban" data-tip={hero.n}>
              <HeroIcon hero={hero} size="md" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function LiveMatchHeader({ match }) {
  const now = useNow(1000);
  const durMin = match.duration / 60;
  const elapsed = Math.min(durMin, (now - match.startTs) / 60000);
  const progress = elapsed / durMin;
  const rK = Math.round(match.kills.radiant * progress);
  const dK = Math.round(match.kills.dire * progress);
  return (
    <div className="match-hero__center">
      <div className="badge-live" style={{ justifyContent: "center" }}>
        <span className="live-dot" /> LIVE · {fmtDuration(elapsed * 60)}
      </div>
      <div className="match-hero__score" style={{ marginTop: 8 }}>
        <span className={rK >= dK ? "w" : "l"}>{rK}</span>
        <span className="muted" style={{ fontSize: 22, margin: "0 8px" }}>:</span>
        <span className={rK >= dK ? "l" : "w"}>{dK}</span>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const match = useMemo(() => getMatch(id), [id]);
  const [chart, setChart] = useState("gold");

  if (!match) return <Navigate to="/" replace />;

  const isPro = match.bracket === "pro";
  const ta = isPro ? teamById.get(match.teams.radiant) : null;
  const tb = isPro ? teamById.get(match.teams.dire) : null;
  const league = isPro ? leagueById.get(match.leagueId) : null;
  const rWin = match.winner === "radiant";

  return (
    <div className="page">
      <div className="bracket-row">
        <h1 className="page-title">Матч</h1>
        <Link to={`/matches?bracket=${match.bracket}`} className="card__link">← Все матчи</Link>
      </div>

      <div className="match-hero">
        <div className="match-hero__league">
          <span>
            {league ? `${league.name} · ${match.stage}${match.series ? ` · Bo${match.series.bo}` : ""}` : `${BRACKET_INFO[match.bracket].label} · All Pick`}
          </span>
          <span>{match.live ? "Идёт сейчас" : fmtDate(match.startTs)}</span>
        </div>
        <div className="match-hero__main">
          <div className="match-hero__team">
            <TeamLogo team={ta} size={52} />
            {ta ? (
              <span>
                <Link to={`/teams/${ta.id}`} className="match-hero__team-name">{ta.name}</Link>
                <div className="match-hero__team-tag">{ta.tag} · Radiant</div>
              </span>
            ) : (
              <span>
                <div className="match-hero__team-name" style={{ fontSize: 15 }}>Radiant</div>
                <div className="match-hero__team-tag">{match.perf.radiant.map((p) => p.nick).join(", ")}</div>
              </span>
            )}
          </div>

          <div className="match-hero__center">
            {match.live ? (
              <LiveMatchHeader match={match} />
            ) : (
              <>
                <div className="match-hero__score">
                  <span className={rWin ? "w" : "l"}>{match.kills.radiant}</span>
                  <span className="muted" style={{ fontSize: 22, margin: "0 8px" }}>:</span>
                  <span className={rWin ? "l" : "w"}>{match.kills.dire}</span>
                </div>
                <div className="match-hero__duration">{fmtDuration(match.duration)}</div>
                <div className={`match-hero__winner ${match.winner}`}>
                  {isPro && match.series ? `${match.series.a}:${match.series.b} · ` : ""}
                  Победа {match.winner === "radiant" ? "Radiant" : "Dire"}
                </div>
              </>
            )}
          </div>

          <div className="match-hero__team right">
            {tb ? (
              <span>
                <Link to={`/teams/${tb.id}`} className="match-hero__team-name">{tb.name}</Link>
                <div className="match-hero__team-tag">{tb.tag} · Dire</div>
              </span>
            ) : (
              <span>
                <div className="match-hero__team-name" style={{ fontSize: 15 }}>Dire</div>
                <div className="match-hero__team-tag">{match.perf.dire.map((p) => p.nick).join(", ")}</div>
              </span>
            )}
            <TeamLogo team={tb} size={52} />
          </div>
        </div>
      </div>

      <div className="section card">
        <div className="card__head">
          <span className="card__title">Драфт · Пики и баны</span>
        </div>
        <div className="draft">
          <div className="draft-grid">
            <DraftSide match={match} side="radiant" />
            <DraftSide match={match} side="dire" />
          </div>
        </div>
      </div>

      <div className="section card">
        <div className="card__head">
          <span className="card__title">Графики преимущества</span>
          <div className="segmented">
            <button className={chart === "gold" ? "active" : ""} onClick={() => setChart("gold")}>Золото</button>
            <button className={chart === "xp" ? "active" : ""} onClick={() => setChart("xp")}>Опыт</button>
          </div>
        </div>
        <AdvChart series={chart === "gold" ? match.goldAdv : match.xpAdv} label={chart === "gold" ? "золота" : "опыта"} />
        <div className="chart-legend" style={{ paddingBottom: 10 }}>
          <span><span className="dot" style={{ background: "#3ddc84" }} />Radiant впереди</span>
          <span><span className="dot" style={{ background: "#ff5c5c" }} />Dire впереди</span>
        </div>
      </div>

      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <SidePerfTable match={match} side="radiant" />
        <SidePerfTable match={match} side="dire" />
      </div>
    </div>
  );
}
