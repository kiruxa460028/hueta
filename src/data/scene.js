// Демо-сцена киберспорта: команды, ростеры, турниры.
// ВНИМАНИЕ: данные демонстрационные, ростеры могут не совпадать с реальными.

const T = (id, name, tag, region, roster) => {
  const players = roster.map(([nick, country, pos], i) => ({
    id: `p${id}_${i + 1}`,
    nick,
    country,
    pos,
    teamId: id,
    pro: true,
  }));
  return { id, name, tag, region, roster: players };
};

export const TEAMS = [
  T(1, "Team Falcons", "Falcons", "WEU", [
    ["skiter", "SK", 1], ["Malr1ne", "NO", 2], ["ATF", "JO", 3],
    ["Cr1t-", "DK", 4], ["Sneyking", "US", 5],
  ]),
  T(2, "Team Liquid", "Liquid", "WEU", [
    ["miCKe", "SE", 1], ["Nisha", "PL", 2], ["33", "IL", 3],
    ["Boxi", "SE", 4], ["Insania", "SE", 5],
  ]),
  T(3, "Team Spirit", "Spirit", "EEU", [
    ["Yatoro", "UA", 1], ["Larl", "RU", 2], ["Collapse", "RU", 3],
    ["Mira", "UA", 4], ["Miposhka", "RU", 5],
  ]),
  T(4, "BetBoom Team", "BetBoom", "EEU", [
    ["Pure", "UA", 1], ["gpk", "RU", 2], ["kataomi", "RU", 3],
    ["Save-", "RU", 4], ["TORONTOTOKYO", "RU", 5],
  ]),
  T(5, "Parivision", "PRV", "EEU", [
    ["noticed", "UA", 1], ["V-Tune", "UA", 2], ["DM", "UA", 3],
    ["Kiritych", "RU", 4], ["Nefrit", "RU", 5],
  ]),
  T(6, "Gaimin Gladiators", "GG", "WEU", [
    ["dyrachyo", "RU", 1], ["Quinn", "US", 2], ["Ace", "DK", 3],
    ["tOfu", "DK", 4], ["Seleri", "NL", 5],
  ]),
  T(7, "Tundra Esports", "Tundra", "WEU", [
    ["23savage", "TH", 1], ["Nine", "SE", 2], ["SabeRLight-", "US", 3],
    ["Ari", "US", 4], ["Whitemon", "US", 5],
  ]),
  T(8, "Xtreme Gaming", "XG", "CN", [
    ["Ame", "CN", 1], ["Xm", "CN", 2], ["Xxs", "CN", 3],
    ["XinQ", "CN", 4], ["Dy", "CN", 5],
  ]),
  T(9, "Azure Ray", "AR", "CN", [
    ["Lou", "CN", 1], ["Somnus", "CN", 2], ["Chalice", "CN", 3],
    ["fy", "CN", 4], ["Tianming", "CN", 5],
  ]),
  T(10, "LGD Gaming", "LGD", "CN", [
    ["shiro", "CN", 1], ["Emmy", "CN", 2], ["niu", "CN", 3],
    ["Pyw", "CN", 4], ["y`", "CN", 5],
  ]),
  T(11, "Nigma Galaxy", "Nigma", "EEU", [
    ["Watson", "UA", 1], ["SumaiL", "US", 2], ["Ammar", "JO", 3],
    ["GH", "LB", 4], ["KuroKy", "DE", 5],
  ]),
  T(12, "OG", "OG", "WEU", [
    ["Timado", "US", 1], ["U-", "RU", 2], ["Ceb", "FR", 3],
    ["Taiga", "NO", 4], ["Fishman", "US", 5],
  ]),
  T(13, "Team Secret", "Secret", "WEU", [
    ["Lefitan", "UA", 1], ["Cloud", "CN", 2], ["Funn1k", "UA", 3],
    ["Zayac", "KZ", 4], ["fng", "BY", 5],
  ]),
  T(14, "Heroic", "Heroic", "SA", [
    ["hFn", "BR", 1], ["Keyser", "AR", 2], ["Thrill", "AR", 3],
    ["Kingrd", "BR", 4], ["Sacred", "BR", 5],
  ]),
  T(15, "beastcoast", "bc", "SA", [
    ["Pakazs", "PE", 1], ["ChrisLuck", "PE", 2], ["Wax", "BR", 3],
    ["Scofield", "BR", 4], ["Matthew", "PE", 5],
  ]),
  T(16, "Shopify Rebellion", "SR", "NA", [
    ["Arteezy", "CA", 1], ["Abed", "PH", 2], ["Moo", "US", 3],
    ["SVG", "US", 4], ["Supamen", "US", 5],
  ]),
  T(17, "nouns", "nouns", "NA", [
    ["Egberto", "US", 1], ["Mistakes", "US", 2], ["Husky", "US", 3],
    ["Klarc", "US", 4], ["Limpel", "US", 5],
  ]),
  T(18, "M80", "M80", "NA", [
    ["Gunnar", "US", 1], ["Bushi", "US", 2], ["Ryoya", "US", 3],
    ["Wedson", "BR", 4], ["Taba", "BR", 5],
  ]),
  T(19, "Wildcard Gaming", "Wildcard", "NA", [
    ["Ashur", "US", 1], ["Sonnie", "CA", 2], ["DuBu", "KR", 3],
    ["Skitter", "US", 4], ["Vtune", "US", 5],
  ]),
  T(20, "Aurora", "Aurora", "SEA", [
    ["Palos", "PH", 1], ["NothingToSay", "MY", 2], ["Fbz", "ID", 3],
    ["DJ", "PH", 4], ["Tims", "PH", 5],
  ]),
  T(21, "Talon Esports", "Talon", "SEA", [
    ["Akashi", "MY", 1], ["Karl", "PH", 2], ["Jabz", "TH", 3],
    ["BoBoKa", "PH", 4], ["Juning", "PH", 5],
  ]),
  T(22, "BOOM Esports", "BOOM", "SEA", [
    ["1JACK", "ID", 1], ["Dreamocel", "ID", 2], ["Mikoto", "ID", 3],
    ["Ferdsss", "ID", 4], ["Ausgewittert", "ID", 5],
  ]),
  T(23, "Blacklist International", "BLCK", "SEA", [
    ["Aqua", "PH", 1], ["Aven", "PH", 2], ["Jabz1", "PH", 3],
    ["Ninjaboogie", "PH", 4], ["Moon", "PH", 5],
  ]),
  T(24, "Team Whales", "Whales", "SEA", [
    ["Ordinaire", "VN", 1], ["Blade", "VN", 2], ["T1tus", "VN", 3],
    ["Xuan", "VN", 4], ["Lania", "VN", 5],
  ]),
  T(25, "Virtus.pro", "VP", "EEU", [
    ["Raddan", "RU", 1], ["Sayuw", "RU", 2], ["Noticed", "UA", 3],
    ["Antares", "RU", 4], ["Paparazi", "RU", 5],
  ]),
  T(26, "9 Pandas", "9P", "EEU", [
    ["palant", "RU", 1], ["Zeus", "RU", 2], ["Mieek", "RU", 3],
    ["Vladimiros", "UA", 4], ["Ainkrad", "RU", 5],
  ]),
  T(27, "Nemiga Gaming", "Nemiga", "EEU", [
    ["Malik", "BY", 1], ["mellojul", "DE", 2], ["Shigetora", "SE", 3],
    ["Veljaz", "FR", 4], ["Xibbe", "DK", 5],
  ]),
  T(28, "L1GA TEAM", "L1GA", "EEU", [
    ["TheLastRide", "UA", 1], ["mOrfeus", "RU", 2], ["Nefrit1", "RU", 3],
    ["So bad", "RU", 4], ["BestInMe", "RU", 5],
  ]),
  T(29, "Hydra", "Hydra", "EEU", [
    ["Munkishi", "RU", 1], ["Six_to_win", "RU", 2], ["ShiningLucifer", "RU", 3],
    ["Fox_Li", "RU", 4], ["Meloman", "KZ", 5],
  ]),
  T(30, "B8", "B8", "EEU", [
    ["Nine1", "UA", 1], ["Kiyalzya", "RU", 2], ["MeTIslav", "UA", 3],
    ["Wisper_]", "RU", 4], ["Dendi", "UA", 5],
  ]),
  T(31, "Team Klee", "Klee", "EEU", [
    ["AveYo", "RU", 1], ["xyz-", "RU", 2], ["Grindstone", "KZ", 3],
    ["Enestrz", "RU", 4], ["Lefitan1", "RU", 5],
  ]),
  T(32, "Chimera", "Chimera", "EEU", [
    ["Zloy", "RU", 1], ["NeKoRoN", "RU", 2], ["Blizzy", "UA", 3],
    ["Dffrnt", "RU", 4], ["UnRankd", "RU", 5],
  ]),
  T(33, "Entity", "Entity", "WEU", [
    ["Kaz", "SE", 1], ["Noomi", "SE", 2], ["SabeR", "RO", 3],
    ["Kazzy", "GB", 4], ["PureBreakfast", "DE", 5],
  ]),
  T(34, "Dandelions", "DAN", "WEU", [
    ["Random noob", "DK", 1], ["Marsh", "DK", 2], ["Ryuga", "DE", 3],
    ["VoidByNature", "NO", 4], ["dCas", "DK", 5],
  ]),
  T(35, "Team Tickles", "Tickles", "WEU", [
    ["Kyzoko", "FR", 1], ["Symere", "FR", 2], ["Laron", "FR", 3],
    ["Kropp", "DE", 4], ["Tabu", "FR", 5],
  ]),
  T(36, "PSG Quest", "Quest", "WEU", [
    ["Yopaj", "PH", 1], ["OMO", "JO", 2], ["Oli", "DK", 3],
    ["W1sh-", "PL", 4], ["Aloha", "DE", 5],
  ]),
  T(37, "Team Tidebound", "Tidebound", "CN", [
    ["Flywin", "CN", 1], ["Echo", "CN", 2], ["Irving", "CN", 3],
    ["Undyne_", "CN", 4], ["Pyw1", "CN", 5],
  ]),
  T(38, "Yakult Brothers", "Yakult", "CN", [
    ["Beyond", "CN", 1], ["Monet", "CN", 2], ["Redpanda", "CN", 3],
    [" planet", "CN", 4], ["Yuru", "CN", 5],
  ]),
  T(39, "Invictus Gaming", "iG", "CN", [
    ["Ulu", "CN", 1], ["NothingToSay1", "MY", 2], ["Beyond1", "CN", 3],
    ["Meracle", "SG", 4], ["Oli1", "CN", 5],
  ]),
  T(40, "Team Bright", "Bright", "CN", [
    ["Xhv", "CN", 1], ["Setsu", "CN", 2], ["Zyd", "CN", 3],
    ["Undy1ng", "CN", 4], ["Librize", "CN", 5],
  ]),
  T(41, "Team Disillusion", "Disillusion", "CN", [
    ["Sylar", "CN", 1], ["Maybe", "CN", 2], ["Yang", "CN", 3],
    ["Lanm", "CN", 4], ["Super", "CN", 5],
  ]),
  T(42, "Mad Kings", "MK", "SA", [
    ["Gardant", "AR", 1], ["Mjz", "BR", 2], ["Nikoh", "AR", 3],
    ["Slash", "BR", 4], ["Bardo", "BR", 5],
  ]),
  T(43, "Infinity Esports", "INF", "SA", [
    ["DarkSide", "AR", 1], ["Moodeta", "AR", 2], ["Sabbeblue", "AR", 3],
    ["StingeR", "AR", 4], ["Vitaly", "PE", 5],
  ]),
  T(44, "Zero Tenacity", "ZE", "EEU", [
    ["Jacky", "CZ", 1], ["Solitude", "CZ", 2], ["Veini", "SK", 3],
    ["Barsa", "HR", 4], ["kyoryu", "PL", 5],
  ]),
];

export const PRO_PLAYERS = TEAMS.flatMap((t) => t.roster);
export const teamById = new Map(TEAMS.map((t) => [t.id, t]));
export const playerById = new Map(PRO_PLAYERS.map((p) => [p.id, p]));
export const playerByNick = new Map(PRO_PLAYERS.map((p) => [p.nick.toLowerCase(), p]));

export const REGION_RU = {
  WEU: "Западная Европа",
  EEU: "Восточная Европа",
  CN: "Китай",
  SEA: "Юго-Восточная Азия",
  NA: "Северная Америка",
  SA: "Южная Америка",
};

// Турниры (лиги)
const L = (id, name, tier) => ({ id, name, tier });
export const LEAGUES = [
  L(1, "The International 2026", 1),
  L(2, "ESL One Bangkok", 1),
  L(3, "PGL Wallachia Season 5", 1),
  L(4, "DreamLeague Season 26", 1),
  L(5, "BLAST Slam IV", 1),
  L(6, "Esports World Cup 2026", 1),
  L(7, "BetBoom Dacha Belgrade", 1),
  L(8, "FISSURE Universe: Episode 6", 2),
  L(9, "Elite League Season 5", 2),
  L(10, "StarLadder StarSeries", 2),
  L(11, "ESL Challenger League S49", 3),
  L(12, "RES Regional Series 8", 3),
  L(13, "EPL World Series: America", 3),
  L(14, "Dota 2 Champions League S24", 3),
  L(15, "European Pro League S33", 3),
];
export const leagueById = new Map(LEAGUES.map((l) => [l.id, l]));

export const STAGES = [
  "Group Stage", "Playoffs", "Upper Bracket", "Upper Bracket Semifinal",
  "Upper Bracket Final", "Lower Bracket", "Lower Bracket Final", "Grand Final",
];

// Генератор ников паб-игроков (Immortal / Divine)
const NICK_A = [
  "dark", "shadow", "mid", "only", "smurf", "ez", "gg", "wolf", "toxic", "cry",
  "black", "red", "sniper", "hunter", "pudge", "cheese", "crazy", "mad", "evil",
  "silent", "storm", "frost", "iron", "golden", "last", "first", "solo", "lazy",
  "angry", "lucky", "turbo", "mega", "ultra", "night", "day", "zero", "one",
  "toha", "vanya", "sanya", "kesha", "misha", "dima", "slava", "artem", "oleg",
];
const NICK_B = [
  "king", "lord", "boss", "boy", "god", "slav", "boy", "man", "bro", "dude",
  "cat", "dog", "bear", "duck", "panda", "potato", "melon", "cake", "bread",
  "master", "grandmaster", "legend", "hero", "noob", "pro", "player", "gamer",
  "girl", "wife", "mom", "dad", "uncle", "gnome", "orc", "elf", "troll",
];
const NICK_C = ["", "", "", "_", ".", "-", "2", "7", "69", "007", "x", "xd", "lol", "1", "5", "10"];

export function makePubPlayers(rng, count, bracket) {
  const used = new Set(PRO_PLAYERS.map((p) => p.nick.toLowerCase()));
  const players = [];
  let guard = 0;
  while (players.length < count && guard < count * 20) {
    guard++;
    let nick;
    const r = rng();
    if (r < 0.42) {
      nick = NICK_A[Math.floor(rng() * NICK_A.length)] + NICK_B[Math.floor(rng() * NICK_B.length)] + NICK_C[Math.floor(rng() * NICK_C.length)];
    } else if (r < 0.72) {
      nick = NICK_A[Math.floor(rng() * NICK_A.length)] + NICK_B[Math.floor(rng() * NICK_B.length)];
    } else {
      // иногда в пабах играют про
      const pro = PRO_PLAYERS[Math.floor(rng() * PRO_PLAYERS.length)];
      if (rng() < 0.5) {
        players.push({ ...pro, id: `pub_${pro.id}`, pro: false, bracket, pos: Math.min(5, Math.max(1, pro.pos + Math.floor(rng() * 3) - 1)) });
        continue;
      }
      nick = pro.nick;
    }
    nick = nick.charAt(0).toUpperCase() + nick.slice(1);
    const key = nick.toLowerCase();
    if (used.has(key)) continue;
    used.add(key);
    const countries = ["RU", "UA", "BY", "KZ", "US", "DE", "PL", "PH", "ID", "BR", "CN", "TR", "SE", "GB", "RO", "CZ"];
    players.push({
      id: `pub_${bracket}_${players.length}`,
      nick,
      country: countries[Math.floor(rng() * countries.length)],
      pos: 1 + Math.floor(rng() * 5),
      teamId: null,
      pro: false,
      bracket,
    });
  }
  return players;
}
