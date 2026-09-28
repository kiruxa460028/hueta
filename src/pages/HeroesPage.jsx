import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getHeroMeta, getTierList, BRACKET_INFO } from "../data/db.js";
import { ROLE_RU, ATTR_RU } from "../data/heroes.js";
import { useBracket, BracketTabs } from "../context.jsx";
import HeroMetaTable from "../components/HeroMetaTable.jsx";
import { HeroIcon, TierBadge } from "../components/common.jsx";
import { wrColor } from "../lib/format.js";

const ATTRS = [
  { key: "all", label: "Все" },
  { key: "str", label: "Сила" },
  { key: "agi", label: "Ловкость" },
  { key: "int", label: "Интеллект" },
  { key: "universal", label: "Универсальные" },
];

const ROLES = ["Carry", "Support", "Nuker", "Disabler", "Initiator", "Durable", "Escape", "Pusher"];

export default function HeroesPage() {
  const { bracket } = useBracket();
  const meta = useMemo(() => getHeroMeta(bracket), [bracket]);
  const tiers = useMemo(() => getTierList(bracket), [bracket]);
  const [attr, setAttr] = useState("all");
  const [role, setRole] = useState(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState("table");

  const filtered = useMemo(() => {
    return meta.filter((r) => {
      if (attr !== "all" && r.hero.a !== attr) return false;
      if (role && !r.hero.r.includes(role)) return false;
      if (q && !r.hero.n.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [meta, attr, role, q]);

  return (
    <div className="page">
      <BracketTabs extra={{ title: "Мета героев", subtitle: `${BRACKET_INFO[bracket].full} · последние 30 дней` }} />

      <div className="filter-row">
        <div className="chips">
          {ATTRS.map((a) => (
            <button key={a.key} className={`chip ${attr === a.key ? "active" : ""}`} onClick={() => setAttr(a.key)}>
              {a.key !== "all" && a.key !== "uni" && <span className={`attr-badge attr-${a.key}`} style={{ marginRight: 6 }}>{a.key.toUpperCase().slice(0, 3)}</span>}
              {a.key === "uni" && <span className="attr-badge attr-all" style={{ marginRight: 6 }}>ALL</span>}
              {a.label}
            </button>
          ))}
        </div>
        <div className="chips">
          {ROLES.map((r) => (
            <button key={r} className={`chip ${role === r ? "active" : ""}`} onClick={() => setRole(role === r ? null : r)}>
              {ROLE_RU[r]}
            </button>
          ))}
        </div>
        <input className="input" placeholder="Поиск героя…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginLeft: "auto" }} />
        <div className="segmented">
          <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Таблица</button>
          <button className={view === "tiers" ? "active" : ""} onClick={() => setView("tiers")}>Тир-лист</button>
        </div>
      </div>

      {view === "table" && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Герои · {filtered.length}</span>
            <span className="muted" style={{ fontSize: 12 }}>Нажмите на заголовок колонки для сортировки</span>
          </div>
          <HeroMetaTable data={filtered} />
        </div>
      )}

      {view === "tiers" && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Тир-лист · {BRACKET_INFO[bracket].label}</span>
            <span className="muted" style={{ fontSize: 12 }}>S — сильнейшие герои меты, D — слабейшие</span>
          </div>
          <div>
            {["S", "A", "B", "C", "D"].map((t) => (
              <div key={t} className="tier-row">
                <span className="tier-row__label"><TierBadge tier={t} /></span>
                <span className="tier-row__heroes">
                  {tiers[t].map((r) => (
                    <Link key={r.hero.id} to={`/heroes/${r.hero.s}?bracket=${bracket}`} className="tier-hero" data-tip={`${r.hero.n} · ${r.wr.toFixed(1)}%`}>
                      <HeroIcon hero={r.hero} size="md" />
                      <span className="tier-hero__wr" style={{ color: wrColor(r.wr) }}>{r.wr.toFixed(0)}%</span>
                    </Link>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
