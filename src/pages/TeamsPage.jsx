import React from "react";
import { Link } from "react-router-dom";
import { useDataSource } from "../context.jsx";
import { useTeamsList } from "../data/hooks.js";
import { REGION_RU } from "../data/scene.js";
import { TeamLogo } from "../components/common.jsx";
import { wrColor } from "../lib/format.js";

export default function TeamsPage() {
  const teams = useTeamsList();
  const { mode } = useDataSource();
  const isLive = mode === "live";

  return (
    <div className="page">
      <div className="bracket-row">
        <div>
          <h1 className="page-title">Команды</h1>
          <p className="page-subtitle">
            {isLive ? "Рейтинг активных команд · живые данные OpenDota (Elo, победы/поражения за всё время)" : "Профессиональные команды · демо-режим"}
          </p>
        </div>
        {isLive ? <span className="real-chip">OpenDota</span> : <span className="demo-chip">демо</span>}
      </div>

      <div className="card">
        <div className="wide-table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th style={{ textAlign: "left" }}>Команда</th>
                <th>Регион</th>
                <th>Матчи</th>
                <th>Победы</th>
                <th>Поражения</th>
                <th>Винрейт</th>
                <th>Рейтинг</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.team.id} className="link">
                  <td className="num muted">{i + 1}</td>
                  <td>
                    <Link to={`/teams/${t.team.id}`} style={{ display: "block" }}>
                      <span className="hero-cell">
                        <TeamLogo team={t.team} size={30} />
                        <span>
                          <span className="hero-cell__name">{t.team.name}</span>
                          <span className="hero-cell__sub">{t.team.tag}</span>
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="muted">{t.team.region ? REGION_RU[t.team.region] : "—"}</td>
                  <td className="num">{t.matches}</td>
                  <td className="num" style={{ color: "var(--radiant)" }}>{t.wins}</td>
                  <td className="num" style={{ color: "var(--dire)" }}>{t.matches - t.wins}</td>
                  <td className="num" style={{ fontWeight: 700, color: wrColor(t.wr) }}>{t.wr.toFixed(1)}%</td>
                  <td className="num" style={{ fontWeight: 700, color: "#d9c07f" }}>{t.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
