import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPlayersList, BRACKET_INFO, teamById } from "../data/db.js";
import { useBracket, BracketTabs } from "../context.jsx";
import { PlayerAvatar, TeamLogo, RankBadge } from "../components/common.jsx";
import { flag, wrColor, POS_LABELS } from "../lib/format.js";
import { Empty } from "../components/common.jsx";

export default function PlayersPage() {
  const { bracket } = useBracket();
  const players = useMemo(() => getPlayersList(bracket), [bracket]);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(50);

  const filtered = useMemo(
    () => players.filter((p) => !q || p.nick.toLowerCase().includes(q.toLowerCase())),
    [players, q]
  );

  return (
    <div className="page">
      <BracketTabs extra={{ title: "Игроки", subtitle: `${BRACKET_INFO[bracket].full} · рейтинг по результатам матчей` }} />

      <div className="filter-row">
        <input className="input" placeholder="Поиск игрока…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="muted" style={{ fontSize: 12.5 }}>Найдено: {filtered.length}</span>
      </div>

      <div className="card">
        <div className="wide-table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th style={{ textAlign: "left" }}>Игрок</th>
                <th>Команда</th>
                <th>Позиция</th>
                <th>Матчи</th>
                <th>Винрейт</th>
                <th>KDA</th>
                <th>Ср. GPM</th>
                <th>{bracket === "pro" ? "Рейтинг" : "MMR"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, limit).map((p, i) => {
                const team = p.teamId ? teamById.get(p.teamId) : null;
                return (
                  <tr key={p.playerId} className="link">
                    <td className="num muted">{i + 1}</td>
                    <td>
                      <Link to={`/players/${p.playerId}?bracket=${bracket}`} style={{ display: "block" }}>
                        <span className="hero-cell">
                          <PlayerAvatar nick={p.nick} size={30} />
                          <span>
                            <span className="hero-cell__name">{p.nick} <span style={{ fontSize: 12 }}>{flag(p.country)}</span></span>
                            {p.pro && <span className="hero-cell__sub" style={{ color: "var(--accent)" }}>Про-игрок</span>}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td>
                      {team ? (
                        <Link to={`/teams/${team.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                          <TeamLogo team={team} size={22} />
                          <span style={{ fontSize: 12.5 }}>{team.tag}</span>
                        </Link>
                      ) : (
                        <RankBadge bracket={bracket} />
                      )}
                    </td>
                    <td className="muted">{p.pos ? POS_LABELS[p.pos] : "—"}</td>
                    <td className="num">{p.n}</td>
                    <td className="num" style={{ fontWeight: 700, color: wrColor(p.wr) }}>{p.wr.toFixed(1)}%</td>
                    <td className="num">{p.kda.toFixed(2)}</td>
                    <td className="num">{p.gpmAvg}</td>
                    <td className="num" style={{ fontWeight: 700, color: "#d9c07f" }}>{p.pro || bracket === "pro" ? p.rating : p.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <Empty text="Игроки не найдены" />}
        {filtered.length > limit && (
          <div className="pagination">
            <button className="btn" onClick={() => setLimit(limit + 50)}>Показать ещё</button>
          </div>
        )}
      </div>
    </div>
  );
}
