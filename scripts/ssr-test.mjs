// Смоук-тест: рендерит все маршруты через react-dom/server и ловит ошибки рантайма
import { createServer } from "vite";

globalThis.window = {
  location: { search: "", href: "http://localhost/" },
  history: { replaceState() {} },
  addEventListener() {},
  removeEventListener() {},
};

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });

const { render } = await vite.ssrLoadModule("/src/ssr-entry.jsx");
const db = await vite.ssrLoadModule("/src/data/db.js");

const proMatch = db.getMatches("pro")[0].id;
const pubMatch = db.getMatches("immortal")[0].id;
const liveMatch = db.getLiveMatches()[0].id;
const proPlayer = db.getPlayersList("pro")[0].playerId;
const pubPlayer = db.getPlayersList("immortal")[0].playerId;

const routes = [
  "/",
  "/?bracket=immortal",
  "/?bracket=divine",
  "/heroes",
  "/heroes?bracket=immortal",
  "/heroes?bracket=divine",
  "/heroes/antimage",
  "/heroes/pudge?bracket=divine",
  "/heroes/kez",
  "/heroes/largo?bracket=immortal",
  "/players",
  "/players?bracket=immortal",
  "/players?bracket=divine",
  `/players/${proPlayer}`,
  `/players/${pubPlayer}?bracket=immortal`,
  "/teams",
  "/teams/1",
  "/teams/44",
  "/matches",
  "/matches?bracket=divine",
  "/matches?bracket=immortal",
  `/matches/${proMatch}`,
  `/matches/${pubMatch}`,
  `/matches/${liveMatch}`,
  "/search?q=yatoro",
  "/search?q=axe",
  "/search?q=falcons",
  "/blabla404",
];

let failed = 0;
for (const url of routes) {
  // BracketProvider читает window.location.search — эмулируем браузер
  const qIdx = url.indexOf("?");
  globalThis.window.location.search = qIdx >= 0 ? url.slice(qIdx) : "";
  try {
    const html = await render(url);
    if (html.length < 500) {
      failed++;
      console.log("SHORT", url, html.length);
    } else {
      console.log("OK   ", url.padEnd(46), `${html.length} симв.`);
    }
  } catch (e) {
    failed++;
    console.log("FAIL ", url, "\n     ", (e.stack || e.message).split("\n").slice(0, 3).join("\n      "));
  }
}

await vite.close();
console.log(failed ? `\n✗ Ошибок: ${failed}` : "\n✓ Все маршруты отрендерились");
process.exit(failed ? 1 : 0);
