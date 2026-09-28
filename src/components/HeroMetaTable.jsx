import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HeroIcon, WinRateBar, Sparkline } from "./common.jsx";
import { wrColor, trendClass } from "../lib/format.js";
import { useBracket } from "../context.jsx";

const COLS = [
  { key: "hero", label: "Герой", sortable: false },
  { key: "picks", label: "Пики", sortable: true },
  { key: "bans", label: "Баны", sortable: true },
  { key: "pickRate", label: "П%", sortable: true },
  { key: "banRate", label: "Б%", sortable: true },
  { key: "wr", label: "Винрейт", sortable: true },
  { key: "kda", label: "KDA", sortable: true },
  { key: "gpm", label: "GPM", sortable: true },
  { key: "delta", label: "Тренд", sortable: true },
];

const COMPACT_COLS = new Set(["hero", "picks", "wr", "delta"]);

export default function HeroMetaTable({ data, compact = false, limit, initialSort }) {
  const [sort, setSort] = useState(initialSort || { key: "wr", dir: "desc" });
  const { bracket } = useBracket();

  const rows = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "hero") return a.hero.n.localeCompare(b.hero.n) * dir;
      return (a[sort.key] - b[sort.key]) * dir;
    });
    return limit ? arr.slice(0, limit) : arr;
  }, [data, sort, limit]);

  const onSort = (key) => {
    if (sort.key === key) setSort({ key, dir: sort.dir === "desc" ? "asc" : "desc" });
    else setSort({ key, dir: key === "hero" ? "asc" : "desc" });
  };

  const cols = COLS.filter((c) => !compact || COMPACT_COLS.has(c.key));

  return (
    <div className="wide-table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                className={c.sortable ? "sortable" : ""}
                onClick={c.sortable ? () => onSort(c.key) : undefined}
                data-active={sort.key === c.key}
              >
                {c.label}
                {sort.key === c.key ? (sort.dir === "desc" ? " ↓" : " ↑") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.hero.id} className="link">
              <td>
                <Link to={`/heroes/${r.hero.s}?bracket=${bracket}`} style={{ display: "block" }}>
                  <span className="hero-cell">
                    <HeroIcon hero={r.hero} size="md" />
                    <span>
                      <span className="hero-cell__name">{r.hero.n}</span>
                      <span className="hero-cell__sub">{r.picks} игр · {r.bans} банов</span>
                    </span>
                  </span>
                </Link>
              </td>
              <td className="num">{r.picks}</td>
              {!compact && <td className="num">{r.bans}</td>}
              {!compact && <td className="num">{r.pickRate.toFixed(1)}%</td>}
              {!compact && <td className="num">{r.banRate.toFixed(1)}%</td>}
              <td className="num" style={{ fontWeight: 700, color: wrColor(r.wr) }}>
                {r.wr.toFixed(1)}%{!compact && <WinRateBar wr={r.wr} />}
              </td>
              {!compact && <td className="num">{r.kda.toFixed(2)}</td>}
              {!compact && <td className="num">{r.gpm}</td>}
              <td className="num">
                <span className={trendClass(r.delta)}>
                  {r.delta > 0.05 ? "▲" : r.delta < -0.05 ? "▼" : "•"} {Math.abs(r.delta).toFixed(1)}
                </span>{" "}
                <Sparkline values={r.days.slice(-14).map((d) => (d.n ? (d.w / d.n) * 100 : 50))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
