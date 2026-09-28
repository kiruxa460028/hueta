import React, { useState } from "react";
import { heroIconUrl, ATTR_SHORT_RU } from "../data/heroes.js";
import { itemUrl, itemByKey } from "../data/items.js";
import { ITEM_BY_ID } from "../data/constants.js";
import { strColor, initialsOf, wrColor } from "../lib/format.js";

// Название предмета по ключу: свой каталог → карта dotaconstants → ключ
const KEY_TO_ITEM = Object.values(ITEM_BY_ID).reduce((acc, it) => {
  acc[it.key] = it;
  return acc;
}, {});
export const itemNameByKey = (key) => itemByKey.get(key)?.name || KEY_TO_ITEM[key]?.name || key;

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

// ---------- Логотип команды ----------
// Реальный логотип (если есть), иначе цветные инициалы.
// Устойчив к отсутствию tag/name (реальные матчи OpenDota дают только name).
export function TeamLogo({ team, size = 32, tooltip }) {
  if (!team) return null;
  const name = team.name || team.tag || "?";
  const label = (team.tag || name).slice(0, 4).toUpperCase();
  const style = {
    width: size,
    height: size,
    background: `linear-gradient(135deg, ${strColor(name)}, ${strColor((team.tag || "") + name)})`,
    fontSize: Math.max(8, Math.round(size * 0.34)),
    borderRadius: Math.round(size * 0.22),
  };
  return (
    <span className="team-logo" style={style} data-tip={tooltip}>
      {team.logoUrl ? <TeamLogoImg url={team.logoUrl} label={label} /> : label}
    </span>
  );
}

function TeamLogoImg({ url, label }) {
  const [err, setErr] = useState(false);
  if (err) return <>{label}</>;
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setErr(true)}
      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }}
    />
  );
}

// ---------- Аватар игрока ----------
export function PlayerAvatar({ nick, size = 34 }) {
  return (
    <span className="player-avatar" style={{ width: size, height: size, background: strColor(nick || "?"), fontSize: Math.max(9, Math.round(size * 0.36)) }}>
      {initialsOf(nick || "?")}
    </span>
  );
}

// ---------- Иконка предмета с тултипом ----------
export function ItemIcon({ itemKey, neutral, empty }) {
  const [err, setErr] = useState(false);
  if (!itemKey || empty) {
    return <span className="item-icon item-icon--empty" />;
  }
  return (
    <span className={`item-icon ${neutral ? "item-icon--neutral" : ""}`} data-tip={itemNameByKey(itemKey)}>
      {err ? (
        <span style={{ fontSize: 7.5, color: "#8b95a8", fontWeight: 700 }}>{itemNameByKey(itemKey).slice(0, 3).toUpperCase()}</span>
      ) : (
        <img src={itemUrl(itemKey)} alt="" loading="lazy" onError={() => setErr(true)} />
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
  if (wr == null) return null;
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
