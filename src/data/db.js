// ============================================================================
// ЯДРО ДАННЫХ: детерминированная генерация демо-матчей и мета-статистики.
// Все числа на сайте согласованы между собой: винрейты, матчапы, предметы,
// игроки и команды считаются из одного и того же набора сгенерированных матчей.
// ============================================================================
import { HEROES, heroById } from "./heroes.js";
import { ITEM_POOLS, NEUTRAL_POOL, itemByKey } from "./items.js";
import { TEAMS, PRO_PLAYERS, LEAGUES, STAGES, makePubPlayers } from "./scene.js";

// ---------- PRNG ----------
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x20260928);
const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1));
const pickOne = (arr) => arr[Math.floor(rng() * arr.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const DAY = 86400000;
const NOW = Date.now();
const PERIOD = 30 * DAY;

export const BRACKETS = ["pro", "immortal", "divine"];
export const BRACKET_INFO = {
  pro: { label: "Про", full: "Professional", pub: false },
  immortal: { label: "Immortal", full: "Immortal", pub: true },
  divine: { label: "Divine", full: "Divine", pub: true },
};

// ---------- Скрытая модель меты ----------
const meta = {};
for (const b of BRACKETS) {
  meta[b] = {};
  for (const h of HEROES) {
    const shared = gauss() * 0.012;
    meta[b][h.id] = {
      power: clamp(shared + gauss() * 0.032, -0.085, 0.085),
      drift: gauss() * 0.03,
      pop: 0.05 + Math.pow(rng(), 0.45) * 0.95 + (rng() < 0.1 ? 0.55 : 0),
    };
  }
}
const powerAt = (bracket, heroId, t) => {
  const m = meta[bracket][heroId];
  return m.power + m.drift * (t - 0.5);
};

// Пулы героев по позициям
const POS_POOLS = {
  1: HEROES.filter((h) => h.r.includes("Carry")),
  2: HEROES.filter((h) => h.r.includes("Carry") || h.r.includes("Nuker")),
  3: HEROES.filter((h) => h.r.some((x) => ["Durable", "Initiator", "Disabler", "Escape"].includes(x))),
  4: HEROES.filter((h) => h.r.some((x) => ["Support", "Nuker", "Initiator", "Disabler"].includes(x))),
  5: HEROES.filter((h) => h.r.includes("Support")),
};

function weightedHero(cands, used, weightFn) {
  let total = 0;
  const ws = [];
  for (const h of cands) {
    if (used.has(h.id)) continue;
    const w = Math.max(0.0001, weightFn(h));
    ws.push([h, w]);
    total += w;
  }
  if (!ws.length) return null;
  let r = rng() * total;
  for (const [h, w] of ws) {
    r -= w;
    if (r <= 0) return h;
  }
  return ws[ws.length - 1][0];
}

function generateDraft(bracket, t) {
  const used = new Set();
  const bans = { radiant: [], dire: [] };
  const picks = { radiant: [], dire: [] };
  const banW = (h) => meta[bracket][h.id].pop * Math.exp(powerAt(bracket, h.id, t) * 8) * (0.25 + rng());
  const pickW = (h) => meta[bracket][h.id].pop * Math.exp(powerAt(bracket, h.id, t) * 6) * (0.2 + rng());

  for (let i = 0; i < 7; i++) {
    for (const side of ["radiant", "dire"]) {
      const h = weightedHero(HEROES, used, banW) || weightedHero(HEROES, used, pickW);
      if (h) {
        used.add(h.id);
        bans[side].push(h.id);
      }
    }
  }
  for (let pos = 1; pos <= 5; pos++) {
    for (const side of ["radiant", "dire"]) {
      let h = weightedHero(POS_POOLS[pos], used, pickW) || weightedHero(HEROES, used, pickW);
      if (!h) h = pickOne(HEROES.filter((x) => !used.has(x.id)));
      used.add(h.id);
      picks[side].push({ heroId: h.id, pos });
    }
  }
  return { bans, picks };
}

// ---------- Статистика игроков ----------
function distribute(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const res = weights.map((w) => Math.floor((total * w) / sum + rng()));
  let diff = total - res.reduce((a, b) => a + b, 0);
  let i = 0;
  while (diff !== 0 && i < 50) {
    const idx = i % 5;
    if (diff > 0) { res[idx]++; diff--; }
    else if (res[idx] > 0) { res[idx]--; diff++; }
    i++;
  }
  return res;
}

function genItems(pos, dur) {
  const pool = ITEM_POOLS[pos];
  const out = [pickOne(pool.boots)];
  const nCore = clamp(Math.round(dur / 6.5) + (rng() < 0.45 ? 1 : 0) - 2, 2, 5);
  const core = [...pool.core];
  let added = 0;
  while (added < nCore && core.length) {
    const idx = Math.floor(rng() * core.length);
    const key = core.splice(idx, 1)[0];
    const it = itemByKey.get(key);
    if (it && it.cost > 4100 && dur < 33 && rng() < 0.75) continue;
    out.push(key);
    added++;
  }
  const neutral = dur > 24 && rng() < 0.85 ? pickOne(NEUTRAL_POOL) : null;
  return { items: out.slice(0, 6), neutral };
}

function genSidePerfs(picks, players, sideKills, oppKills, sideAssists, dur, win, bracket) {
  const killW = [1, 2, 3, 4, 5].map((p) => [0.27, 0.25, 0.19, 0.16, 0.10][p - 1] * (0.45 + rng() * 1.25));
  const deathW = [1, 2, 3, 4, 5].map((p) => [0.16, 0.17, 0.23, 0.22, 0.22][p - 1] * (0.6 + rng() * 0.95));
  const assW = [1, 2, 3, 4, 5].map((p) => [0.13, 0.19, 0.20, 0.24, 0.24][p - 1] * (0.6 + rng() * 0.95));
  const kills = distribute(sideKills, killW);
  const deaths = distribute(oppKills, deathW);
  const assists = distribute(sideAssists, assW);
  const gpmF = bracket === "pro" ? 1.0 : bracket === "immortal" ? 0.965 : 0.91;

  return picks.map((pk, i) => {
    const pos = pk.pos;
    const gpm = Math.round([560, 505, 425, 345, 295][pos - 1] * (0.85 + rng() * 0.3) * (0.88 + dur / 70) * (win ? 1.06 : 0.94) * gpmF);
    const xpm = Math.round([620, 690, 565, 455, 390][pos - 1] * (0.85 + rng() * 0.3) * (0.9 + dur / 75) * (win ? 1.05 : 0.95));
    const lhF = [0.95, 0.8, 0.7, 0.38, 0.3][pos - 1] * (0.7 + rng() * 0.6);
    const lh = Math.max(3, Math.round(((gpm - 110) * dur * lhF) / 50));
    const dn = pos <= 2 ? Math.round(lh * (0.05 + rng() * 0.08)) : randInt(1, 7);
    const nw = Math.round((((gpm - 125) * dur + 2300 + kills[i] * 260 + assists[i] * 35) / 10)) * 10;
    const dmgF = [1.0, 1.15, 0.95, 0.7, 0.55][pos - 1] * (0.55 + rng() * 0.75);
    const dmg = Math.round(nw * dmgF);
    const level = clamp(Math.floor(Math.sqrt((xpm * dur) / 33)), 5, 30);
    return {
      heroId: pk.heroId,
      pos,
      kills: kills[i],
      deaths: deaths[i],
      assists: assists[i],
      gpm,
      xpm,
      lh,
      dn,
      nw,
      dmg,
      level,
      items: genItems(pos, dur),
      win,
      playerId: players[i].id,
      nick: players[i].nick,
      country: players[i].country,
    };
  });
}

function bridgeSeries(n, final, sigma) {
  const walk = [0];
  for (let i = 1; i < n; i++) walk.push(walk[i - 1] + (rng() * 2 - 1) * sigma);
  const out = [];
  for (let i = 0; i < n; i++) {
    const lin = final * ((i + 1) / n);
    const b = walk[i] - walk[n - 1] * ((i + 1) / n);
    out.push(Math.round(lin + b));
  }
  out[n - 1] = final;
  return out;
}

// ---------- Пул паб-игроков ----------
const PUB_PLAYERS = {
  immortal: makePubPlayers(rng, 520, "immortal"),
  divine: makePubPlayers(rng, 520, "divine"),
};
for (const p of PUB_PLAYERS.immortal) p.rating = Math.round(5450 + Math.pow(rng(), 1.4) * 3000);
for (const p of PUB_PLAYERS.divine) p.rating = Math.round(4550 + Math.pow(rng(), 1.2) * 950);

// ---------- Генерация матчей ----------
const MATCHES = [];
const MATCH_BY_ID = new Map();
const LEAGUE_W = [3, 4, 5, 4, 3, 5, 4, 6, 7, 6, 8, 9, 10, 9, 10]; // веса популярности лиг

function genMatchCommon(bracket, idx, opts = {}) {
  const durationMin = opts.live
    ? clamp(Math.round(32 + gauss() * 8 + rng() * 8), 24, 55)
    : bracket === "pro"
      ? clamp(Math.round(31 + gauss() * 8 + rng() * 10), 22, 55)
      : clamp(Math.round(29 + gauss() * 9 + rng() * 9), 20, 58);
  const duration = durationMin * 60;
  const startTs = opts.live ? opts.startTs : NOW - Math.pow(rng(), 1.2) * PERIOD;
  const t = clamp(1 - (NOW - startTs) / PERIOD, 0, 1);
  const draft = generateDraft(bracket, t);

  // вероятность победы Radiant с учётом силы драфта
  const sumPower = (side) => draft.picks[side].reduce((a, pk) => a + powerAt(bracket, pk.heroId, t), 0);
  const pR = clamp(0.5 + (sumPower("radiant") - sumPower("dire")) * 1.0 + 0.02, 0.15, 0.85);
  const winner = rng() < pR ? "radiant" : "dire";
  const winSide = winner === "radiant";

  const wk = Math.round(durationMin * (0.55 + rng() * 0.42));
  const lk = Math.max(1, Math.round(wk * (0.4 + rng() * 0.5)));
  const rKills = winSide ? wk : lk;
  const dKills = winSide ? lk : wk;
  const rAssists = Math.round(rKills * (1.7 + rng() * 0.8));
  const dAssists = Math.round(dKills * (1.7 + rng() * 0.8));

  let teams, playersR, playersD;
  if (bracket === "pro") {
    const a = randInt(1, TEAMS.length);
    let b = randInt(1, TEAMS.length);
    let guard = 0;
    while (b === a && guard++ < 10) b = randInt(1, TEAMS.length);
    const ta = TEAMS[a - 1], tb = TEAMS[b - 1];
    teams = { radiant: ta.id, dire: tb.id };
    playersR = ta.roster;
    playersD = tb.roster;
  } else {
    const pool = PUB_PLAYERS[bracket];
    const idxs = new Set();
    while (idxs.size < 10) idxs.add(Math.floor(rng() * pool.length));
    const ten = [...idxs].map((i) => pool[i]).sort((x, y) => x.pos - y.pos);
    playersR = ten.slice(0, 5);
    playersD = ten.slice(5, 10);
    teams = null;
  }

  const perfR = genSidePerfs(draft.picks.radiant, playersR, rKills, dKills, rAssists, durationMin, winSide, bracket);
  const perfD = genSidePerfs(draft.picks.dire, playersD, dKills, rKills, dAssists, durationMin, !winSide, bracket);

  const nwR = perfR.reduce((a, p) => a + p.nw, 0);
  const nwD = perfD.reduce((a, p) => a + p.nw, 0);
  const xpR = perfR.reduce((a, p) => a + p.xpm, 0) * durationMin;
  const xpD = perfD.reduce((a, p) => a + p.xpm, 0) * durationMin;
  const n = Math.max(2, durationMin);
  const goldAdv = bridgeSeries(n, nwR - nwD, 520);
  const xpAdv = bridgeSeries(n, Math.round(xpR - xpD), 640);

  let league = null, stage = null, series = null;
  if (bracket === "pro") {
    // взвешенный выбор лиги
    const total = LEAGUE_W.reduce((a, b) => a + b, 0);
    let r = rng() * total, li = 0;
    for (; li < LEAGUE_W.length; li++) { r -= LEAGUE_W[li]; if (r <= 0) break; }
    league = LEAGUES[Math.min(li, LEAGUES.length - 1)];
    stage = pickOne(STAGES);
    const bo = pickOne([2, 2, 3, 3, 3, 5]);
    const wsc = bo === 2 ? randInt(1, 2) : bo === 3 ? 2 : 3;
    const lsc = Math.max(0, wsc - randInt(0, 2) - (bo === 2 ? 1 : 1));
    series = winner === "radiant" ? { a: wsc, b: lsc, bo } : { a: lsc, b: wsc, bo };
  }

  const id = `m-${bracket}-${idx}`;
  const m = {
    id,
    bracket,
    duration,
    startTs,
    winner,
    kills: { radiant: rKills, dire: dKills },
    draft,
    teams,
    leagueId: league ? league.id : null,
    stage,
    series,
    perf: { radiant: perfR, dire: perfD },
    goldAdv,
    xpAdv,
    live: !!opts.live,
  };
  MATCHES.push(m);
  MATCH_BY_ID.set(id, m);
  return m;
}

// Про-матчи
for (let i = 0; i < 1600; i++) genMatchCommon("pro", i);
// Пабы
for (let i = 0; i < 2000; i++) genMatchCommon("immortal", i);
for (let i = 0; i < 2000; i++) genMatchCommon("divine", i);

// Живые матчи
export const LIVE = [];
for (let i = 0; i < 5; i++) {
  const m = genMatchCommon("pro", 9000 + i, { live: true, startTs: NOW - randInt(4, 48) * 60000 });
  LIVE.push(m.id);
}
for (let i = 0; i < 3; i++) {
  const m = genMatchCommon("immortal", 9100 + i, { live: true, startTs: NOW - randInt(6, 40) * 60000 });
  LIVE.push(m.id);
}

// MMR паб-игроков (для таблиц в immortal/divine)
const PUB_RATING = new Map();
for (const p of PUB_PLAYERS.immortal) PUB_RATING.set(p.id, p.rating);
for (const p of PUB_PLAYERS.divine) PUB_RATING.set(p.id, p.rating);

// ---------- Селекторы (с мемоизацией) ----------
const cache = new Map();
function memo(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

export const getLiveMatches = () => LIVE.map((id) => MATCH_BY_ID.get(id));

export const getMatches = (bracket) =>
  memo(`matches:${bracket}`, () =>
    MATCHES.filter((m) => m.bracket === bracket && !m.live).sort((a, b) => b.startTs - a.startTs)
  );

export const getMatch = (id) => MATCH_BY_ID.get(id);

const emptyStat = () => ({ picks: 0, bans: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, lh: 0, nw: 0, dmg: 0, byDay: {} });

// Мета героев по брекету
export function getHeroMeta(bracket) {
  return memo(`heroMeta:${bracket}`, () => {
    const stats = {};
    for (const h of HEROES) stats[h.id] = emptyStat();
    const matches = getMatches(bracket);
    for (const m of matches) {
      const day = Math.min(29, Math.floor((NOW - m.startTs) / DAY));
      for (const side of ["radiant", "dire"]) {
        const won = m.winner === side;
        for (const bid of m.draft.bans[side]) stats[bid].bans++;
        for (const p of m.perf[side]) {
          const s = stats[p.heroId];
          s.picks++;
          if (won) s.wins++;
          s.kills += p.kills; s.deaths += p.deaths; s.assists += p.assists;
          s.gpm += p.gpm; s.xpm += p.xpm; s.lh += p.lh; s.nw += p.nw; s.dmg += p.dmg;
          const d = (s.byDay[day] = s.byDay[day] || { w: 0, n: 0 });
          d.n++; if (won) d.w++;
        }
      }
    }
    const total = matches.length || 1;
    return HEROES.map((h) => {
      const s = stats[h.id];
      const days = [];
      for (let d = 29; d >= 0; d--) if (s.byDay[d]) days.push({ day: d, ...s.byDay[d] });
      // тренд: последние 10 дней против предыдущих 10
      const recent = days.filter((x) => x.day <= 9);
      const older = days.filter((x) => x.day > 9 && x.day <= 19);
      const rw = recent.reduce((a, x) => a + x.w, 0), rn = recent.reduce((a, x) => a + x.n, 0);
      const ow = older.reduce((a, x) => a + x.w, 0), on = older.reduce((a, x) => a + x.n, 0);
      const wr = s.picks ? s.wins / s.picks : 0.5;
      const delta = rn > 2 && on > 2 ? (rw / rn - ow / on) * 100 : 0;
      return {
        hero: h,
        matches: total,
        picks: s.picks,
        bans: s.bans,
        pickRate: (s.picks / total) * 100,
        banRate: (s.bans / total) * 100,
        wins: s.wins,
        wr: s.picks ? (s.wins / s.picks) * 100 : 50,
        kda: s.deaths ? (s.kills + s.assists) / s.deaths : (s.kills + s.assists),
        gpm: s.picks ? Math.round(s.gpm / s.picks) : 0,
        xpm: s.picks ? Math.round(s.xpm / s.picks) : 0,
        lh: s.picks ? Math.round(s.lh / s.picks) : 0,
        dmg: s.picks ? Math.round(s.dmg / s.picks) : 0,
        delta,
        days,
        score: (wr - 0.5) * Math.sqrt(s.picks) * 100 + (s.picks / total) * 18,
      };
    });
  });
}

export function getTierList(bracket) {
  return memo(`tier:${bracket}`, () => {
    const arr = [...getHeroMeta(bracket)].sort((a, b) => b.score - a.score);
    const sizes = { S: 14, A: 26, B: 38, C: 32, D: 17 };
    const out = { S: [], A: [], B: [], C: [], D: [] };
    let i = 0;
    for (const tier of ["S", "A", "B", "C", "D"]) {
      out[tier] = arr.slice(i, i + sizes[tier]);
      i += sizes[tier];
    }
    return out;
  });
}

// Детальная страница героя
export function getHeroDetail(bracket, heroId) {
  return memo(`heroDetail:${bracket}:${heroId}`, () => {
    const matches = getMatches(bracket);
    const metaRow = getHeroMeta(bracket).find((x) => x.hero.id === heroId);
    const players = new Map(); // playerId -> stat
    const synergy = new Map(); // heroId -> {n, w}
    const vs = new Map(); // heroId -> {n, w}
    const items = new Map(); // key -> {n, w}
    const recent = [];
    let n = 0, wins = 0;

    for (const m of matches) {
      for (const side of ["radiant", "dire"]) {
        const won = m.winner === side;
        const enemySide = side === "radiant" ? "dire" : "radiant";
        const perf = m.perf[side].find((p) => p.heroId === heroId);
        if (!perf) continue;
        n++;
        if (won) wins++;
        const ps = players.get(perf.playerId) || { n: 0, w: 0, k: 0, d: 0, a: 0, gpm: 0, nick: perf.nick, country: perf.country, playerId: perf.playerId };
        ps.n++; ps.w += won ? 1 : 0; ps.k += perf.kills; ps.d += perf.deaths; ps.a += perf.assists; ps.gpm += perf.gpm;
        players.set(perf.playerId, ps);
        for (const tm of m.perf[side]) {
          if (tm.heroId === heroId) continue;
          const s = synergy.get(tm.heroId) || { n: 0, w: 0 };
          s.n++; if (won) s.w++;
          synergy.set(tm.heroId, s);
        }
        for (const en of m.perf[enemySide]) {
          const s = vs.get(en.heroId) || { n: 0, w: 0 };
          s.n++; if (won) s.w++;
          vs.set(en.heroId, s);
        }
        for (const key of perf.items.items) {
          const s = items.get(key) || { n: 0, w: 0 };
          s.n++; if (won) s.w++;
          items.set(key, s);
        }
        if (recent.length < 400) recent.push({ match: m, perf, side, won });
      }
    }
    recent.sort((a, b) => b.match.startTs - a.match.startTs);

    const shrink = (s, k = 5) => (s.w + k * 0.5) / (s.n + k);
    const topPlayers = [...players.values()].filter((p) => p.n >= 2).sort((a, b) => b.n - a.n).slice(0, 40)
      .sort((a, b) => (b.w / b.n) * Math.sqrt(b.n) - (a.w / a.n) * Math.sqrt(a.n)).slice(0, 10);
    const synergyList = [...synergy.entries()].filter(([, s]) => s.n >= 6)
      .map(([id, s]) => ({ hero: heroById.get(id), n: s.n, wr: shrink(s) * 100 }))
      .sort((a, b) => b.wr - a.wr);
    const counterList = [...vs.entries()].filter(([, s]) => s.n >= 6)
      .map(([id, s]) => ({ hero: heroById.get(id), n: s.n, wr: shrink(s) * 100 }))
      .sort((a, b) => a.wr - b.wr);
    const itemList = [...items.entries()].filter(([, s]) => s.n >= 3)
      .map(([key, s]) => ({ key, n: s.n, wr: (s.w / s.n) * 100 }))
      .sort((a, b) => b.n - a.n).slice(0, 12)
      .map((x) => ({ ...x, pickRate: (x.n / Math.max(1, n)) * 100 }));

    return { meta: metaRow, n, wins, topPlayers, synergy: synergyList.slice(0, 8), counters: counterList.slice(0, 8), items: itemList, recent: recent.slice(0, 12) };
  });
}

// Игроки по брекету
export function getPlayersList(bracket) {
  return memo(`players:${bracket}`, () => {
    const agg = new Map();
    for (const m of getMatches(bracket)) {
      for (const side of ["radiant", "dire"]) {
        const won = m.winner === side;
        for (const p of m.perf[side]) {
          const s = agg.get(p.playerId) || { playerId: p.playerId, nick: p.nick, country: p.country, n: 0, w: 0, k: 0, d: 0, a: 0, gpm: 0, nw: 0, heroes: new Map() };
          s.n++; s.w += won ? 1 : 0; s.k += p.kills; s.d += p.deaths; s.a += p.assists; s.gpm += p.gpm; s.nw += p.nw;
          const hs = s.heroes.get(p.heroId) || { n: 0, w: 0 };
          hs.n++; if (won) hs.w++;
          s.heroes.set(p.heroId, hs);
          agg.set(p.playerId, s);
        }
      }
    }
    const out = [];
    for (const s of agg.values()) {
      if (s.n < 3) continue;
      const pro = PRO_PLAYERS.find((x) => x.id === s.playerId || `pub_${x.id}` === s.playerId);
      out.push({
        ...s,
        pro: !!pro && bracket === "pro",
        teamId: pro && bracket === "pro" ? pro.teamId : null,
        pos: pro ? pro.pos : 0,
        wr: (s.w / s.n) * 100,
        kda: s.d ? (s.k + s.a) / s.d : s.k + s.a,
        gpmAvg: Math.round(s.gpm / s.n),
        nwAvg: Math.round(s.nw / s.n),
        rating:
          PUB_RATING.get(s.playerId) ??
          Math.round(1000 + (s.w / s.n) * 700 + Math.sqrt(s.n) * 25 + (s.d ? (s.k + s.a) / s.d : 3) * 30),
      });
    }
    out.sort((a, b) => b.rating - a.rating);
    return out;
  });
}

// Детальная страница игрока
export function getPlayerDetail(playerId, bracket) {
  return memo(`player:${bracket}:${playerId}`, () => {
    const list = getPlayersList(bracket);
    const row = list.find((p) => p.playerId === playerId);
    if (!row) return null;
    const pro = PRO_PLAYERS.find((x) => x.id === playerId || `pub_${x.id}` === playerId);
    const appearances = [];
    for (const m of getMatches(bracket)) {
      for (const side of ["radiant", "dire"]) {
        const won = m.winner === side;
        const perf = m.perf[side].find((p) => p.playerId === playerId);
        if (perf) appearances.push({ match: m, perf, side, won });
      }
    }
    appearances.sort((a, b) => b.match.startTs - a.match.startTs);
    const heroes = [...row.heroes.entries()]
      .map(([id, s]) => ({ hero: heroById.get(id), n: s.n, wr: (s.w / s.n) * 100 }))
      .sort((a, b) => b.n - a.n)
      .map((h) => ({ ...h, top: h.hero }));
    return { row, pro, heroes, recent: appearances.slice(0, 12) };
  });
}

// Команды
export function getTeamsList() {
  return memo("teams", () => {
    const matches = getMatches("pro");
    const agg = new Map();
    for (const m of matches) {
      const rId = m.teams.radiant, dId = m.teams.dire;
      const rs = agg.get(rId) || { n: 0, w: 0 };
      rs.n++; if (m.winner === "radiant") rs.w++;
      agg.set(rId, rs);
      const ds = agg.get(dId) || { n: 0, w: 0 };
      ds.n++; if (m.winner === "dire") ds.w++;
      agg.set(dId, ds);
    }
    return TEAMS.map((t) => {
      const s = agg.get(t.id) || { n: 0, w: 0 };
      return {
        team: t,
        matches: s.n,
        wins: s.w,
        wr: s.n ? (s.w / s.n) * 100 : 0,
        rating: Math.round(900 + (s.n ? s.w / s.n : 0.5) * 550 + Math.min(s.n, 40) * 4),
      };
    }).sort((a, b) => b.rating - a.rating);
  });
}

export function getTeamDetail(teamId) {
  return memo(`team:${teamId}`, () => {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return null;
    const list = getTeamsList();
    const row = list.find((x) => x.team.id === teamId);
    const matches = [];
    const heroes = new Map();
    for (const m of getMatches("pro")) {
      const side = m.teams.radiant === teamId ? "radiant" : m.teams.dire === teamId ? "dire" : null;
      if (!side) continue;
      const won = m.winner === side;
      matches.push({ match: m, side, won });
      for (const p of m.perf[side]) {
        const hs = heroes.get(p.heroId) || { n: 0, w: 0 };
        hs.n++; if (won) hs.w++;
        heroes.set(p.heroId, hs);
      }
    }
    matches.sort((a, b) => b.match.startTs - a.match.startTs);
    const topHeroes = [...heroes.entries()]
      .map(([id, s]) => ({ hero: heroById.get(id), n: s.n, wr: (s.w / s.n) * 100 }))
      .sort((a, b) => b.n - a.n).slice(0, 10);
    return { team, row, matches: matches.slice(0, 12), topHeroes };
  });
}

// Поиск
export function searchAll(q) {
  const query = q.trim().toLowerCase();
  if (!query) return { heroes: [], players: [], teams: [] };
  const heroes = HEROES.filter((h) => h.n.toLowerCase().includes(query)).slice(0, 6);
  const teams = TEAMS.filter((t) => t.name.toLowerCase().includes(query) || t.tag.toLowerCase().includes(query)).slice(0, 4);
  const proPlayers = PRO_PLAYERS.filter((p) => p.nick.toLowerCase().includes(query)).slice(0, 5);
  const pubPlayers = [...PUB_PLAYERS.immortal, ...PUB_PLAYERS.divine]
    .filter((p) => p.nick.toLowerCase().includes(query)).slice(0, 6);
  return { heroes, teams, players: [...proPlayers, ...pubPlayers] };
}

export { PUB_PLAYERS };
export const getPubPlayers = (bracket) => PUB_PLAYERS[bracket] || [];
export { teamById, leagueById, playerById } from "./scene.js";
