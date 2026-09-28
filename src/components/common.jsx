import React, { useState } from "react";
import { heroIconUrl, ATTR_SHORT_RU } from "../data/heroes.js";
import { itemUrl, itemByKey } from "../data/items.js";
import { strColor, initialsOf, wrColor } from "../lib/format.js";

// ---------- Иконка героя с фолбэком ----------
// Используются вертикальные иконки из CDN Steam (как в клиенте игры)
export function HeroIcon({ hero, size = "md", tooltip }) {
  const [err, setErr] = useState(false);
  const cls = `hero-icon hero-icon--${size}`;
  if (err) {
    return (
      <span className={cls} style={{ background: strColor(hero.n) }} data-tip={tooltip}>
        <span className="fallback">{initialsOf(hero.n)}</span>
      </span>
    );
  }
  return (
    <span className={cls} data-tip={tooltip}>
      <img src={heroIconUrl(hero.s)} alt={hero.n} loading="lazy" onError={() => setErr(true)} />
    </span>
  );
}

// ---------- Логотип команды (цветные инициалы) ----------
export function TeamLogo({ team, size = 32, tooltip }) {
  if (!team) return null;
  const style = {
    width: size,
    height: size,
    background: `linear-gradient(135deg, ${strColor(team.name)}, ${strColor(team.tag + team.name)})`,
    fontSize: Math.max(8, Math.round(size * 0.34)),
    borderRadius: Math.round(size * 0.22),
  };
  return (
    <span className="team-logo" style={style} data-tip={tooltip}>
      {team.tag.slice(0, 4).toUpperCase()}
    </span>
  );
}

// ---------- Аватар игрока ----------
export function PlayerAvatar({ nick, size = 34 }) {
  return (
    <span className="player-avatar" style={{ width: size, height: size, background: strColor(nick), fontSize: Math.max(9, Math.round(size * 0.36)) }}>
      {initialsOf(nick)}
    </span>
  );
}

// ---------- Иконка предмета с тултипом ----------
export function ItemIcon({ itemKey, neutral, empty }) {
  const item = itemByKey.get(itemKey);
  const [err, setErr] = useState(false);
  if (!itemKey || empty || !item) {
    return <span className="item-icon item-icon--empty" />;
  }
  return (
    <span className={`item-icon ${neutral ? "item-icon--neutral" : ""}`} data-tip={item.name}>
      {err ? (
        <span style={{ fontSize: 7.5, color: "#8b95a8", fontWeight: 700 }}>{item.name.slice(0, 3).toUpperCase()}</span>
      ) : (
        <img src={itemUrl(itemKey)} alt={item.name} loading="lazy" onError={() => setErr(true)} />
      )}
    </span>
  );
}

// ---------- Бейдж атрибута ----------
export function AttrBadge({ attr, tooltip }) {
  return (
    <span className={`attr-badge attr-${attr}`} data-tip={tooltip} title={tooltip}>
      {ATTR_SHORT_RU[attr]}
    </span>
  );
}

// ---------- Полоска винрейта ----------
export function WinRateBar({ wr }) {
  const color = wrColor(wr);
  return (
    <span className="wr-bar">
      <i style={{ width: `${Math.min(100, Math.max(0, wr))}%`, background: color }} />
    </span>
  );
}

// ---------- Спарклайн ----------
export function Sparkline({ values, width = 74, height = 22 }) {
  if (!values || values.length < 2) return <span className="muted">—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - 3 - ((v - min) / range) * (height - 6)).toFixed(1)}`);
  const up = values[values.length - 1] >= values[0];
  const color = up ? "#3ddc84" : "#ff5c5c";
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------- Бейджи ----------
export function TierBadge({ tier }) {
  return <span className={`tier-badge tier-${tier}`}>{tier}</span>;
}

export function RankBadge({ bracket }) {
  if (bracket === "pro") return <span className="rank-badge rank-pro">PRO</span>;
  if (bracket === "immortal") return <span className="rank-badge rank-immortal">IMMORTAL</span>;
  return <span className="rank-badge rank-divine">DIVINE</span>;
}

export function Empty({ text = "Ничего не найдено" }) {
  return <div className="empty">{text}</div>;
}
