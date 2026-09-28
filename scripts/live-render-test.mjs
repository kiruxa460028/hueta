// Тест рендера страниц в ЖИВОМ режиме (mode='live', данные OpenDota замоканы).
// Воспроизводит то, что происходит в браузере пользователя после загрузки API.
import { createServer } from "vite";

// --- браузерное окружение ---
globalThis.window = {
  location: { search: "", href: "http://localhost/" },
  history: { replaceState() {} },
  addEventListener() {},
  removeEventListener() {},
};
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};

const { HEROES } = await import("../src/data/heroes.js");

// --- моки ответов OpenDota (реальная структура) ---
const heroStats = HEROES.map((h, i) => ({
  id: h.id,
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

const proMatches = Array.from({ length: 40 }, (_, i) => ({
  match_id: 9000000000 + i,
  duration: 2400 + i * 37,
  start_time: Math.floor(Date.now() / 1000) - i * 3600,
  radiant_team_id: 36,
  radiant_name: "Natus Vincere",
  dire_team_id: 2163,
  dire_name: "Team Liquid",
  leagueid: 20279,
  league_name: "PGL Wallachia 2026 Season 9",
  series_type: 1,
  radiant_score: 30,
  dire_score: 22,
  radiant_win: i % 2 === 0,
}));

const teams = [
  { team_id: 36, rating: 1406.68, wins: 1519, losses: 1226, last_match_time: Math.floor(Date.now() / 1000) - 3600, name: "Natus Vincere", tag: "NAVI", logo_url: null },
  { team_id: 2163, rating: 1407.57, wins: 1877, losses: 1276, last_match_time: Math.floor(Date.now() / 1000) - 7200, name: "Team Liquid", tag: "Liquid", logo_url: "https://example.com/logo.png" },
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
  league: { name: "PGL Wallachia 2026 Season 9" },
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
    item_0: 1,
    item_1: 0,
    item_2: 0,
    item_3: 0,
    item_4: 0,
    item_5: 0,
    item_neutral: 0,
  })),
  picks_bans: HEROES.slice(0, 10).map((h, i) => ({ hero_id: h.id, team: i % 2, is_pick: true, order: i }))
    .concat(HEROES.slice(10, 14).map((h, i) => ({ hero_id: h.id, team: i % 2, is_pick: false, order: 10 + i }))),
  radiant_gold_adv: Array.from({ length: 41 }, (_, i) => Math.round(Math.sin(i / 6) * 4000 + i * 50)),
  radiant_xp_adv: Array.from({ length: 41 }, (_, i) => Math.round(Math.cos(i / 7) * 3500 + i * 60)),
};

const routes = {
  "/api/heroStats": heroStats,
  "/api/proMatches": proMatches,
  "/api/proMatches?offset=100": proMatches.slice(0, 50),
  "/api/teams": teams,
  "/api/teams/36/players": [{ account_id: 111, name: "TestPlayer1", country_code: "ua", fantasy_role: 1 }],
  "/api/matches/9000000042": fullMatch,
  "/api/players/111": { profile: { account_id: 111, personaname: "TestPlayer1", loccountrycode: "ua", profileurl: "x" }, rank_tier: 80, mmr_estimate: { estimate: 6500 } },
  "/api/players/111/wl": { win: 120, lose: 80 },
  "/api/players/111/recentMatches": [],
  "/api/rankings?hero_id=1": { rankings: [{ account_id: 111, name: "BestAM", rank: 1, score: 1234.5 }] },
  "/api/heroes/1/matchups": HEROES.slice(1, 30).map((h, i) => ({ hero_id: h.id, games_played: 100, wins: 30 + i })),
  "/api/scenarios/itemTimings?hero_id=1": [{ hero_id: 1, item: "bfury", timing: 12, games_played: 50, wins: 30 }],
};

globalThis.fetch = async (url) => {
  const path = url.replace("https://api.opendota.com", "");
  if (!(path in routes)) throw new Error("нет мока для " + path);
  return { ok: true, json: async () => routes[path] };
};

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const liveMod = await vite.ssrLoadModule("/src/data/live.js");
const { render } = await vite.ssrLoadModule("/src/ssr-entry.jsx");

// Инициализируем живой слой ДО рендера — DataSourceProvider начнёт сразу в mode='live'
await liveMod.live.init(true);
if (liveMod.live.status !== "ok") throw new Error("init не удался");

const list = [
  "/",
  "/heroes",
  "/heroes?bracket=immortal",
  "/heroes?bracket=divine",
  "/heroes/antimage",
  "/heroes/pudge?bracket=divine",
  "/matches",
  "/matches?bracket=divine",
  "/teams",
  "/teams/36",
  "/teams/999999",
  "/players",
  "/search?q=navi",
  "/matches/r9000000042",
];

let failed = 0;
for (const url of list) {
  const q = url.indexOf("?");
  globalThis.window.location.search = q >= 0 ? url.slice(q) : "";
  try {
    const html = await render(url);
    if (html.length < 400) {
      failed++;
      console.log("SHORT", url, html.length);
    } else {
      const hasLive = html.includes("OpenDota");
      console.log("OK   ", url.padEnd(30), `${html.length} симв.`, hasLive ? "· live-плашки ✓" : "· БЕЗ live-плашек?!");
    }
  } catch (e) {
    failed++;
    console.log("FAIL ", url, "\n      ", (e.stack || e.message).split("\n").slice(0, 4).join("\n       "));
  }
}

await vite.close();
console.log(failed ? `\n✗ Ошибок: ${failed}` : "\n✓ Живой режим: все страницы рендерятся без падений");
process.exit(failed ? 1 : 0);
