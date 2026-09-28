// ============================================================================
// СЛОЙ ЖИВЫХ ДАННЫХ: OpenDota API (https://docs.opendota.com), публичный, без ключа,
// с CORS. Загружается в браузере пользователя → данные всегда актуальные.
// Кэш в localStorage: heroStats 30 мин, матчи 2 мин, команды 1 ч, матчи-детали 24 ч.
// Если API недоступен — сайт автоматически работает на демо-данных (db.js).
// ============================================================================
import { HEROES, heroById } from "./heroes.js";
import { ITEM_BY_ID } from "./constants.js";
import { itemByKey } from "./items.js";

const API = "https://api.opendota.com/api";
const LS = "dpt:";

function lsGet(key, ttl) {
  try {
    const raw = localStorage.getItem(LS + key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > ttl) return null;
    return v;
  } catch {
    return null;
  }
}
function lsSet(key, v) {
  try {
    localStorage.setItem(LS + key, JSON.stringify({ t: Date.now(), v }));
  } catch {
    /* квота — игнорируем */
  }
}

const inflight = new Map();
async function api(path, ttl = 300000) {
  const cached = lsGet(path, ttl);
  if (cached) return cached;
  if (inflight.has(path)) return inflight.get(path);
  const p = (async () => {
    const res = await fetch(API + path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} (${path})`);
    const json = await res.json();
    lsSet(path, json);
    return json;
  })();
  inflight.set(path, p);
  try {
    return await p;
  } finally {
    inflight.delete(path);
  }
}

// ----------------------------------------------------------------------------
// Стор: инициализация ядра (heroStats + лента про-матчей + команды)
// ----------------------------------------------------------------------------
export const live = {
  status: "idle", // idle | loading | ok | error
  core: null,
  loadedAt: 0,
  _listeners: new Set(),
  _proPlayers: null,

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  },
  emit() {
    for (const fn of this._listeners) fn();
  },

  async init(force = false) {
    if (typeof fetch !== "function") {
      this.status = "error";
      this.emit();
      return;
    }
    if (this.status === "loading") return;
    if (!force && this.core && Date.now() - this.loadedAt < 120000) return;
    this.status = "loading";
    this.emit();
    try {
      const [heroStats, m1, m2, teams] = await Promise.all([
        api("/heroStats", 30 * 60000),
        api("/proMatches", 120000),
        api("/proMatches?offset=100", 120000),
        api("/teams", 3600000),
      ]);
      const matches = [...(m1 || []), ...(m2 || [])];
      const leagues = new Map();
      for (const m of matches) if (m.leagueid && m.league_name) leagues.set(m.leagueid, m.league_name);
      // активные команды: играли за последние 180 дней
      const nowSec = Date.now() / 1000;
      const teamsActive = (teams || [])
        .filter((t) => t.name && t.rating && t.last_match_time && nowSec - t.last_match_time < 180 * 86400)
        .slice(0, 50);
      this.core = { heroStats, matches, leagues, teams: teamsActive };
      this.status = "ok";
      this.loadedAt = Date.now();
    } catch (e) {
      console.warn("[ProTracker] OpenDota недоступна, переключаемся на демо-данные:", e?.message);
      this.status = "error";
    }
    this.emit();
  },
};

// ----------------------------------------------------------------------------
// Мета героев по брекетам (heroStats: pro_*, 8_* = Immortal, 7_* = Divine)
// ----------------------------------------------------------------------------
const BRACKET_FIELDS = {
  pro: { pick: "pro_pick", win: "pro_win", ban: "pro_ban" },
  immortal: { pick: "8_pick", win: "8_win", ban: null },
  divine: { pick: "7_pick", win: "7_win", ban: null },
};

export function liveHeroMeta(bracket, core = live.core) {
  if (!core) return null;
  const F = BRACKET_FIELDS[bracket] || BRACKET_FIELDS.pro;
  let totalPicks = 0;
  for (const hs of core.heroStats) totalPicks += hs[F.pick] || 0;
  const totalMatches = Math.max(1, Math.round(totalPicks / 10));

  const rows = [];
  for (const hs of core.heroStats) {
    const hero = heroById.get(hs.id ?? hs.hero_id);
    if (!hero) continue;
    const picks = hs[F.pick] || 0;
    const wins = hs[F.win] || 0;
    const bans = F.ban ? hs[F.ban] || 0 : null;
    const wr = picks >= 1 ? (wins / picks) * 100 : null;

    // тренды: pub_pick_trend / pub_win_trend (последние ~7 дней; последний элемент — неполный день)
    let days = null;
    let delta = null;
    const pt = hs.pub_pick_trend;
    const wt = hs.pub_win_trend;
    if (Array.isArray(pt) && Array.isArray(wt) && pt.length >= 4) {
      const n = pt.length - 1; // без неполного последнего дня
      days = [];
      for (let i = 0; i < n; i++) if (pt[i] > 0) days.push({ n: pt[i], w: wt[i] || 0 });
      const half = Math.floor(n / 2);
      const sum = (arr) => arr.reduce((a, x) => a + x.n, 0);
      const swin = (arr) => arr.reduce((a, x) => a + x.w, 0);
      const old = days.slice(0, half);
      const recent = days.slice(half);
      if (sum(old) > 20 && sum(recent) > 20) {
        delta = (swin(recent) / sum(recent) - swin(old) / sum(old)) * 100;
      }
    }

    rows.push({
      hero,
      matches: totalMatches,
      picks,
      bans,
      pickRate: (picks / totalMatches) * 100,
      banRate: bans != null ? (bans / totalMatches) * 100 : null,
      wins,
      wr,
      kda: null,
      gpm: null,
      xpm: null,
      lh: null,
      dmg: null,
      delta,
      days,
      score: wr != null ? (wr - 50) * Math.sqrt(picks) : -999,
      real: true,
    });
  }
  return rows;
}

export function liveTierList(bracket) {
  const rows = liveHeroMeta(bracket);
  if (!rows) return null;
  const arr = [...rows].sort((a, b) => b.score - a.score);
  const sizes = { S: 14, A: 26, B: 38, C: 32, D: 17 };
  const out = { S: [], A: [], B: [], C: [], D: [] };
  let i = 0;
  for (const tier of ["S", "A", "B", "C", "D"]) {
    out[tier] = arr.slice(i, i + sizes[tier]);
    i += sizes[tier];
  }
  return out;
}

// ----------------------------------------------------------------------------
// Лента про-матчей (реальные, со счётом)
// ----------------------------------------------------------------------------
const SERIES_LABEL = { 0: "Bo1", 1: "Bo3", 2: "Bo5" };

export function liveMatchRows(core = live.core) {
  if (!core) return null;
  return core.matches.map((m) => ({
    id: "r" + m.match_id,
    real: true,
    bracket: "pro",
    leagueId: m.leagueid ?? null,
    leagueName: m.league_name || "Турнир",
    stage: SERIES_LABEL[m.series_type] || null,
    series: null,
    teams: {
      radiant: { id: m.radiant_team_id, name: m.radiant_name || "Radiant" },
      dire: { id: m.dire_team_id, name: m.dire_name || "Dire" },
    },
    winner: m.radiant_win ? "radiant" : "dire",
    kills: {
      radiant: m.radiant_score ?? null,
      dire: m.dire_score ?? null,
    },
    duration: m.duration,
    startTs: m.start_time * 1000,
    live: false,
  }));
}

// ----------------------------------------------------------------------------
// Детали реального матча: /matches/{id} → единый формат сайта
// ----------------------------------------------------------------------------
export async function liveMatchDetail(realId) {
  const m = await api(`/matches/${realId}`, 24 * 3600000);
  const radiantWin = !!m.radiant_win;
  const players = m.players || [];
  const isRadiant = (p) => (p.player_slot ?? 0) < 128;
  const bySide = (r) => players.filter((p) => isRadiant(p) === r);

  // позиции 1–5: эвристика по GPM внутри команды
  const posOf = new Map();
  for (const side of [true, false]) {
    [...bySide(side)]
      .sort((a, b) => (b.gold_per_min || 0) - (a.gold_per_min || 0))
      .forEach((p, i) => posOf.set(p.player_slot, i + 1));
  }

  const itemKey = (id) => (id ? ITEM_BY_ID[id]?.key ?? null : null);
  const mkPerf = (list) =>
    [...list]
      .sort((a, b) => (posOf.get(a.player_slot) || 9) - (posOf.get(b.player_slot) || 9))
      .map((p) => ({
        heroId: p.hero_id,
        pos: posOf.get(p.player_slot) || 0,
        kills: p.kills ?? 0,
        deaths: p.deaths ?? 0,
        assists: p.assists ?? 0,
        gpm: p.gold_per_min ?? 0,
        xpm: p.xp_per_min ?? 0,
        lh: p.last_hits ?? 0,
        dn: p.denies ?? 0,
        nw: p.net_worth ?? p.gold_spent ?? 0,
        dmg: p.hero_damage ?? 0,
        level: p.level ?? 0,
        items: [0, 1, 2, 3, 4, 5].map((i) => itemKey(p["item_" + i])),
        neutral: itemKey(p.item_neutral),
        win: isRadiant(p) === radiantWin,
        playerId: p.account_id ? "a" + p.account_id : null,
        nick: p.personaname || p.name || "Аноним",
        country: null,
      }));

  const sumK = (list) => list.reduce((a, p) => a + (p.kills || 0), 0);
  const perfR = mkPerf(bySide(true));
  const perfD = mkPerf(bySide(false));

  // формат как в демо-данных: { picks: {radiant, dire}, bans: {radiant, dire} }
  const draft = { picks: { radiant: [], dire: [] }, bans: { radiant: [], dire: [] } };
  for (const pb of m.picks_bans || []) {
    const side = pb.team === 0 ? "radiant" : "dire";
    (pb.is_pick ? draft.picks[side] : draft.bans[side]).push(pb.hero_id);
  }
  // позиция пика = позиция игрока с этим героем
  for (const side of ["radiant", "dire"]) {
    draft.picks[side] = draft.picks[side].map((heroId) => {
      const pl = players.find((p) => p.hero_id === heroId);
      return { heroId, pos: pl ? posOf.get(pl.player_slot) || null : null };
    });
  }

  return {
    id: "r" + m.match_id,
    real: true,
    bracket: "pro",
    duration: m.duration,
    startTs: m.start_time * 1000,
    winner: radiantWin ? "radiant" : "dire",
    kills: {
      radiant: m.radiant_score ?? sumK(bySide(true)),
      dire: m.dire_score ?? sumK(bySide(false)),
    },
    teams: {
      radiant: { id: m.radiant_team_id, name: m.radiant_name || "Radiant" },
      dire: { id: m.dire_team_id, name: m.dire_name || "Dire" },
    },
    leagueName: m.league?.name || live.core?.leagues.get(m.leagueid) || "Турнир",
    stage: SERIES_LABEL[m.series_type] || null,
    series: null,
    draft,
    perf: { radiant: perfR, dire: perfD },
    goldAdv: m.radiant_gold_adv || [],
    xpAdv: m.radiant_xp_adv || [],
    live: false,
  };
}

// ----------------------------------------------------------------------------
// Команды и составы
// ----------------------------------------------------------------------------
export function liveTeams(core = live.core) {
  if (!core) return null;
  return [...core.teams]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .map((t) => {
    const w = t.wins || 0;
    const l = t.losses || 0;
    return {
      team: {
        id: t.team_id,
        name: t.name,
        tag: t.tag || (t.name || "?").slice(0, 4),
        region: null,
        logoUrl: t.logo_url || null,
      },
      rating: Math.round(t.rating || 1000),
      matches: w + l,
      wins: w,
      wr: w + l ? (w / (w + l)) * 100 : 50,
      real: true,
    };
  });
}

const rosterCache = new Map();
export async function liveRoster(teamId) {
  if (rosterCache.has(teamId)) return rosterCache.get(teamId);
  const players = await api(`/teams/${teamId}/players`, 3600000).catch(() => []);
  const roster = (players || [])
    .filter((p) => (p.name || "").trim())
    .map((p) => ({
      id: "a" + p.account_id,
      nick: (p.name || "").trim(),
      country: (p.country_code || p.loccountrycode || "").toUpperCase() || null,
      pos: p.fantasy_role || 0,
      pro: true,
      teamId,
    }));
  rosterCache.set(teamId, roster);
  return roster;
}

// Список про-игроков: составы топ-12 активных команд (лениво, один раз)
export async function liveProPlayers() {
  if (live._proPlayers) return live._proPlayers;
  if (!live.core) return [];
  const top = live.core.teams.slice(0, 12);
  const rosters = await Promise.all(
    top.map(async (t) => ({ team: t, roster: await liveRoster(t.team_id).catch(() => []) }))
  );
  const out = [];
  rosters.forEach(({ team, roster }, ti) => {
    for (const p of roster) out.push({ ...p, teamName: team.name, teamTag: team.tag, teamRank: ti + 1, logoUrl: team.logo_url });
  });
  live._proPlayers = out;
  return out;
}

// ----------------------------------------------------------------------------
// Страница игрока: /players/{account_id} + wl + recentMatches
// ----------------------------------------------------------------------------
export async function livePlayer(accountId) {
  const [prof, wl, recent] = await Promise.all([
    api(`/players/${accountId}`, 3600000).catch(() => null),
    api(`/players/${accountId}/wl`, 600000).catch(() => null),
    api(`/players/${accountId}/recentMatches`, 600000).catch(() => []),
  ]);
  if (!prof) return null;
  const p = prof.profile || {};
  const matches = (recent || [])
    .map((m) => {
      const hero = heroById.get(m.hero_id);
      if (!hero) return null;
      return {
        id: "r" + m.match_id,
        hero,
        kills: m.kills ?? 0,
        deaths: m.deaths ?? 0,
        assists: m.assists ?? 0,
        gpm: m.gold_per_min ?? null,
        win: !!m.radiant_win === ((m.player_slot ?? 0) < 128),
        duration: m.duration ?? 0,
        startTs: (m.start_time || 0) * 1000,
      };
    })
    .filter(Boolean);

  const heroes = new Map();
  for (const m of matches) {
    const s = heroes.get(m.hero.id) || { hero: m.hero, n: 0, w: 0 };
    s.n++;
    if (m.win) s.w++;
    heroes.set(m.hero.id, s);
  }

  return {
    nick: p.personaname || "Аноним",
    country: (p.loccountrycode || "").toUpperCase() || null,
    rankTier: prof.rank_tier ?? null,
    mmr: prof.mmr_estimate?.estimate ?? null,
    steamUrl: p.profileurl || null,
    win: wl?.win ?? null,
    lose: wl?.lose ?? null,
    matches,
    heroes: [...heroes.values()].map((h) => ({ ...h, wr: (h.w / h.n) * 100 })).sort((a, b) => b.n - a.n),
  };
}

// ----------------------------------------------------------------------------
// Страница героя: матчапы, топ игроков, предметы
// ----------------------------------------------------------------------------
const heroExtraCache = new Map();
export async function liveHeroExtra(heroId) {
  if (heroExtraCache.has(heroId)) return heroExtraCache.get(heroId);
  const [matchups, rankings, itemTimings] = await Promise.all([
    api(`/heroes/${heroId}/matchups`, 12 * 3600000).catch(() => []),
    api(`/rankings?hero_id=${heroId}`, 6 * 3600000).catch(() => ({ rankings: [] })),
    api(`/scenarios/itemTimings?hero_id=${heroId}`, 12 * 3600000).catch(() => []),
  ]);

  // matchups: {hero_id, games_played, wins} — победы НАШЕГО героя против указанного
  const counters = (matchups || [])
    .filter((x) => heroById.has(x.hero_id) && x.games_played >= 25)
    .map((x) => ({
      hero: heroById.get(x.hero_id),
      n: x.games_played,
      wr: x.games_played ? (x.wins / x.games_played) * 100 : 50,
    }))
    .sort((a, b) => a.wr - b.wr);

  const topPlayers = ((rankings?.rankings) || []).slice(0, 10).map((r) => ({
    playerId: "a" + r.account_id,
    nick: r.name || "Аноним",
    country: null,
    rank: r.rank,
    score: r.score,
  }));

  const agg = new Map();
  for (const it of itemTimings || []) {
    const cur = agg.get(it.item) || { n: 0, w: 0 };
    cur.n += it.games_played || 0;
    cur.w += it.wins || 0;
    agg.set(it.item, cur);
  }
  const totalGames = [...agg.values()].reduce((a, b) => a + b.n, 0) || 1;
  const items = [...agg.entries()]
    .filter(([key, v]) => v.n >= 25 && key)
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 12)
    .map(([key, v]) => ({ key, n: v.n, wr: (v.w / v.n) * 100, pickRate: (v.n / totalGames) * 100 }));

  const res = {
    goodAgainst: [...counters].sort((a, b) => b.wr - a.wr).slice(0, 8),
    badAgainst: counters.slice(0, 8),
    synergy: null,
    topPlayers,
    items,
  };
  heroExtraCache.set(heroId, res);
  return res;
}

// ----------------------------------------------------------------------------
// Живой поиск (герои + реальные команды + про-игроки из кэша)
// ----------------------------------------------------------------------------
export function liveSearch(q) {
  const query = (q || "").trim().toLowerCase();
  if (!query || !live.core) return { heroes: [], players: [], teams: [] };
  const heroes = HEROES.filter((h) => h.n.toLowerCase().includes(query)).slice(0, 6);
  const teams = live.core.teams
    .filter((t) => t.name.toLowerCase().includes(query) || (t.tag || "").toLowerCase().includes(query))
    .slice(0, 4)
    .map((t) => ({ id: t.team_id, name: t.name, tag: t.tag, logoUrl: t.logo_url, real: true }));
  const players = (live._proPlayers || [])
    .filter((p) => p.nick.toLowerCase().includes(query))
    .slice(0, 5)
    .map((p) => ({ id: p.id, nick: p.nick, country: p.country, teamName: p.teamName, pro: true }));
  return { heroes, teams, players };
}
