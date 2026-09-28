// Форматирование чисел, дат и прочего

export function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} дн назад`;
  return fmtDate(ts);
}

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtNum(x) {
  return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function pct(x, digits = 1) {
  return `${x.toFixed(digits)}%`;
}

export function flag(cc) {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(
    ...cc.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

// Цвет винрейта
export function wrColor(wr) {
  if (wr >= 54) return "#3ddc84";
  if (wr >= 51) return "#7ee0a3";
  if (wr > 49) return "#d7dce5";
  if (wr > 46) return "#ff9b8a";
  return "#ff5c5c";
}

export function wrText(wr) {
  return { color: wrColor(wr) };
}

export const POS_LABELS = { 1: "Керри", 2: "Мид", 3: "Оффлейн", 4: "Семи-саппорт", 5: "Фулл-саппорт" };

// Детерминированный цвет по строке (для логотипов команд)
export function strColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash);
  const palette = ["#e0574c", "#3d9be0", "#48b96e", "#e0a63d", "#9a6de0", "#e05fa8", "#3dc0b0", "#c07a3d", "#5f8fe0", "#b0c03d"];
  return palette[h % palette.length];
}

export function initialsOf(name) {
  const parts = name.replace(/[^a-zA-Zа-яА-Я0-9 `\-.]/g, "").split(/[\s`\-.]+/).filter(Boolean);
  if (!parts.length) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function trendClass(delta) {
  if (delta > 1.5) return "trend-up";
  if (delta < -1.5) return "trend-down";
  return "trend-flat";
}
