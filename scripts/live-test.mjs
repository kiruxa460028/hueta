// Тест живого слоя: мокаем fetch реальной структурой ответов OpenDota
// и проверяем все адаптеры (мета, матчи, команды, детали матча, игрок, герой).
import assert from "node:assert/strict";

// --- моки браузерного окружения ---
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};

// --- тестовые данные в СТРУКТУРЕ OpenDota ---
const { HEROES } = await import("../src/data/heroes.js");

const heroStats = HEROES.slice(0, 60).map((h, i) => ({
  id: h.id,
  name: "npc_dota_hero_" + h.s,
  localized_name: h.n,
  pro_pick: 100 - i,
  pro_win: Math.round((100 - i) * (0.42 + (i % 20) * 0.01)),
  pro_ban: 40 - Math.floor(i / 2),
  "7_pick": 5000 + i * 10,
  "7_win": Math.round((5000 + i * 10) * 0.5),
  "8_pick": 3000 + i * 5,
  "8_win": Math.round((3000 + i * 5) * 0.52),
  pub_pick_trend: [1000, 1100, 900, 1200, 1300, 1250, 600],
  pub_win_trend: [500, 570, 440, 630, 700, 660, 300],
}));

const proMatches = Array.from({ length: 30 }, (_, i) => ({
  match_id: 9000000000 + i,
  duration: 2400 + i * 37,
  start_time: Math.floor(Date.now() / 1000) - i * 3600,
  radiant_team_id: 36,
  radiant_name: "Natus Vincere",
  dire_team_id: 2163,
  dire_name: "Team Liquid",
  leagueid: 20279,
  league_name: "PGL Wallachia 2026 Season 9",
  series_id: 1,
  series_type: 1,
  radiant_score: 30,
  dire_score: 22,
  radiant_win: i % 2 === 0,
  version: 22,
}));

const teams = [
  { team_id: 36, rating: 1406.68, wins: 1519, losses: 1226, last_match_time: Math.floor(Date.now() / 1000) - 3600, name: "Natus Vincere", tag: "NAVI", logo_url: null },
  { team_id: 2163, rating: 1407.57, wins: 1877, losses: 1276, last_match_time: Math.floor(Date.now() / 1000) - 7200, name: "Team Liquid", tag: "Liquid", logo_url: "https://example.com/logo.png" },
  { team_id: 999, rating: 1400, wins: 10, losses: 5, last_match_time: Math.floor(Date.now() / 1000) - 999 * 86400, name: "Древняя команда", tag: "OLD", logo_url: null },
];

const teamPlayers = [
  { account_id: 111, name: "TestPlayer1", country_code: "ua", fantasy_role: 1, team_id: 36 },
  { account_id: 222, name: "TestPlayer2", country_code: "ru", fantasy_role: 2, team_id: 36 },
];

const fullMatch = {
  match_id: 9000000042,
  duration: 2513,
  start_time: Math.floor(Date.now() / 1000) - 7200,
  radiant_win: true,
  radiant_score: 31,
  dire_score: 21,
  radiant_team_id: 36,
  radiant_name: "Natus Vincere",
  dire_team_id: 2163,
  dire_name: "Team Liquid",
  leagueid: 20279,
  series_type: 1,
  league: { leagueid: 20279, name: "PGL Wallachia 2026 Season 9" },
  players: HEROES.slice(0, 10).map((h, i) => ({
    player_slot: i < 5 ? i : 128 + i - 5,
    account_id: 1000 + i,
    personaname: "Player" + i,
    hero_id: h.id,
    kills: 5 + i,
    deaths: 10 - i,
    assists: 8,
    level: 25,
    gold_per_min: 700 - i * 40,
    xp_per_min: 800 - i * 40,
    last_hits: 200 - i * 15,
    denies: 10,
    net_worth: 25000 - i * 1500,
    hero_damage: 30000 - i * 1500,
    item_0: 1, // blink
    item_1: 116, // boots of travel?
    item_2: 0,
    item_3: 0,
    item_4: 0,
    item_5: 0,
    item_neutral: null,
  })),
  picks_bans: HEROES.slice(0, 10).map((h, i) => ({
    hero_id: h.id,
    team: i % 2,
    is_pick: true,
    order: i,
  })).concat(HEROES.slice(10, 14).map((h, i) => ({ hero_id: h.id, team: i % 2, is_pick: false, order: 10 + i }))),
  radiant_gold_adv: Array.from({ length: 41 }, (_, i) => Math.round(Math.sin(i / 6) * 4000 + i * 50)),
  radiant_xp_adv: Array.from({ length: 41 }, (_, i) => Math.round(Math.cos(i / 7) * 3500 + i * 60)),
};

const playerProfile = {
  profile: { account_id: 111, personaname: "TestPlayer1", loccountrycode: "ua", profileurl: "https://steamcommunity.com/id/test" },
  rank_tier: 80,
  mmr_estimate: { estimate: 6500 },
};
const playerWl = { win: 120, lose: 80 };
const playerRecent = [
  { match_id: 9000000042, player_slot: 0, radiant_win: true, hero_id: 1, kills: 10, deaths: 2, assists: 5, duration: 2400, start_time: Math.floor(Date.now() / 1000) - 3600, gold_per_min: 600 },
];
const rankings = { hero_id: 1, rankings: [{ account_id: 111, name: "BestAM", rank: 1, score: 1234.5 }] };
const matchups = HEROES.slice(1, 30).map((h, i) => ({ hero_id: h.id, games_played: 100, wins: 30 + i }));
const itemTimings = [
  { hero_id: 1, item: "bfury", timing: 12, games_played: 50, wins: 30 },
  { hero_id: 1, item: "manta", timing: 24, games_played: 60, wins: 35 },
];

const routes = {
  "/api/heroStats": heroStats,
  "/api/proMatches": proMatches,
  "/api/proMatches?offset=100": [],
  "/api/teams": teams,
  "/api/teams/36/players": teamPlayers,
  "/api/matches/9000000042": fullMatch,
  "/api/players/111": playerProfile,
  "/api/players/111/wl": playerWl,
  "/api/players/111/recentMatches": playerRecent,
  "/api/rankings?hero_id=1": rankings,
  "/api/heroes/1/matchups": matchups,
  "/api/scenarios/itemTimings?hero_id=1": itemTimings,
};

let calls = 0;
globalThis.fetch = async (url) => {
  calls++;
  const path = url.replace("https://api.opendota.com", "");
  if (!(path in routes)) throw new Error("нет мока для " + path);
  return { ok: true, json: async () => routes[path] };
};

const live = (await import("../src/data/live.js")).live;
const mod = await import("../src/data/live.js");

// --- init ---
await live.init(true);
assert.equal(live.status, "ok", "init должен перейти в ok");
assert.ok(calls >= 4, "должны были быть запросы API");

// --- мета героев ---
const metaPro = mod.liveHeroMeta("pro");
assert.equal(metaPro.length, 60);
const amRow = metaPro.find((r) => r.hero.id === 1);
assert.equal(amRow.picks, 100);
assert.ok(amRow.wr > 0 && amRow.wr < 100);
assert.ok(amRow.banRate >= 0);
assert.equal(amRow.kda, null, "в live-режиме KDA недоступен");

const metaImm = mod.liveHeroMeta("immortal");
assert.equal(metaImm[0].picks, 3000, "8_pick");
assert.equal(metaImm[0].bans, null, "банрейт для пабов недоступен");
assert.ok(metaImm[0].days && metaImm[0].days.length >= 3, "тренд из pub_trend");
assert.ok(metaImm[0].delta !== null);

const tiers = mod.liveTierList("pro");
assert.equal(tiers.S.length, 14);

// --- лента матчей ---
const rows = mod.liveMatchRows();
assert.equal(rows.length, 30);
assert.equal(rows[0].teams.radiant.name, "Natus Vincere");
assert.equal(rows[0].kills.radiant, 30);
assert.ok(rows[0].id.startsWith("r"));
assert.equal(rows[0].leagueName, "PGL Wallachia 2026 Season 9");

// --- команды ---
const teamsRows = mod.liveTeams();
assert.equal(teamsRows.length, 2, "древняя команда (матч 999 дней назад) должна отфильтроваться");
assert.equal(teamsRows[0].team.name, "Team Liquid");

// --- состав ---
const roster = await mod.liveRoster(36);
assert.equal(roster.length, 2);
assert.equal(roster[0].id, "a111");

// --- детали матча ---
const detail = await mod.liveMatchDetail(9000000042);
assert.equal(detail.winner, "radiant");
assert.equal(detail.perf.radiant.length, 5);
assert.equal(detail.perf.dire.length, 5);
assert.ok(detail.perf.radiant[0].items.includes("blink"), "item_0=1 → blink");
assert.equal(detail.draft.picks.radiant.length, 5);
assert.equal(detail.draft.bans.radiant.length + detail.draft.bans.dire.length, 4);
assert.ok(detail.goldAdv.length === 41);
// позиции: у radiant игроки отсортированы по gpm → pos 1..5
assert.deepEqual(detail.perf.radiant.map((p) => p.pos), [1, 2, 3, 4, 5]);

// --- игрок ---
const player = await mod.livePlayer(111);
assert.equal(player.nick, "TestPlayer1");
assert.equal(player.country, "UA");
assert.equal(player.rankTier, 80);
assert.equal(player.matches.length, 1);
assert.equal(player.matches[0].win, true);

// --- герой: доп. данные ---
const extra = await mod.liveHeroExtra(1);
assert.equal(extra.topPlayers[0].nick, "BestAM");
assert.ok(extra.goodAgainst.length > 0);
assert.ok(extra.badAgainst.length > 0);
assert.ok(extra.items.some((x) => x.key === "manta"));

console.log("✓ Живой слой: все адаптеры работают (" + calls + " запросов, " + metaPro.length + " героев, " + rows.length + " матчей)");
