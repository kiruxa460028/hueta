// Генерирует src/data/constants.js из пакета dotaconstants (id предмета → ключ/название)
// Запуск: node scripts/gen-constants.mjs
import { writeFileSync } from "node:fs";
import { items, item_ids } from "dotaconstants";

const byId = {};
for (const [key, it] of Object.entries(items)) {
  if (!it || it.id == null) continue;
  if (key.startsWith("recipe")) continue;
  if (!it.dname) continue;
  byId[it.id] = { key, name: it.dname, cost: it.cost ?? 0 };
}

// Проверка: item_ids — обратная карта (id → key), сверим
let mismatches = 0;
for (const [id, key] of Object.entries(item_ids || {})) {
  if (byId[id] && byId[id].key !== key) mismatches++;
}

const file = `// СГЕНЕРИРОВАНО scripts/gen-constants.mjs из dotaconstants (не редактировать вручную)
// Карта: числовой id предмета (как в API матчей OpenDota) → {key, name, cost}
export const ITEM_BY_ID = ${JSON.stringify(byId)};

export const itemById = (id) => ITEM_BY_ID[id] || null;
`;

writeFileSync(new URL("../src/data/constants.js", import.meta.url), file);
console.log(`Предметов с id: ${Object.keys(byId).length}, расхождений с item_ids: ${mismatches}`);
