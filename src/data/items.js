// Каталог предметов. key — внутреннее имя для CDN Steam,
// name — отображаемое название, cost — стоимость, cat — категория для генерации билдов
const I = (key, name, cost, cat) => ({ key, name, cost, cat });

export const ITEMS = [
  // Ботинки
  I("power_treads", "Power Treads", 1400, "boots"),
  I("phase_boots", "Phase Boots", 1500, "boots"),
  I("arcane_boots", "Arcane Boots", 1300, "boots"),
  I("tranquil_boots", "Tranquil Boots", 925, "boots"),
  I("travel_boots", "Boots of Travel", 2200, "boots"),

  // Ранние / расходники
  I("magic_wand", "Magic Wand", 450, "early"),
  I("bracer", "Bracer", 505, "early"),
  I("wraith_band", "Wraith Band", 505, "early"),
  I("null_talisman", "Null Talisman", 505, "early"),
  I("orb_of_corrosion", "Orb of Corrosion", 925, "early"),
  I("hand_of_midas", "Hand of Midas", 2200, "early"),

  // Керри-предметы (позиция 1)
  I("bfury", "Battle Fury", 4100, "carry"),
  I("manta", "Manta Style", 4600, "carry"),
  I("butterfly", "Butterfly", 4975, "carry"),
  I("satanic", "Satanic", 5050, "carry"),
  I("abyssal_blade", "Abyssal Blade", 5000, "carry"),
  I("monkey_king_bar", "Monkey King Bar", 4300, "carry"),
  I("lesser_crit", "Daedalus", 5150, "carry"),
  I("skadi", "Eye of Skadi", 5300, "carry"),
  I("sange_and_yasha", "Sange and Yasha", 4100, "carry"),
  I("mjollnir", "Mjollnir", 5600, "carry"),
  I("radiance", "Radiance", 4700, "carry"),
  I("diffusal_blade", "Diffusal Blade", 3150, "carry"),
  I("silver_edge", "Silver Edge", 4300, "carry"),
  I("bloodthorn", "Bloodthorn", 6100, "carry"),
  I("hurricane_pike", "Hurricane Pike", 4275, "carry"),
  I("desolator", "Desolator", 3500, "carry"),
  I("crystalys", "Crystalys", 2130, "carry"),
  I("echo_sabre", "Echo Sabre", 2650, "carry"),
  I("harpoon", "Harpoon", 4700, "carry"),
  I("disperser", "Disperser", 4350, "carry"),
  I("gleipnir", "Gleipnir", 5650, "carry"),
  I("maelstrom", "Maelstrom", 2850, "carry"),
  I("armlet", "Armlet of Mordiggian", 2400, "carry"),
  I("heart", "Heart of Tarrasque", 5000, "carry"),
  I("assault", "Assault Cuirass", 5125, "carry"),
  I("sphere", "Linken's Sphere", 4600, "carry"),
  I("rapier", "Divine Rapier", 5800, "carry"),
  I("bash_of_the_deep", "Basher", 2775, "carry"),

  // Мид / магические
  I("black_king_bar", "Black King Bar", 4050, "core"),
  I("blink", "Blink Dagger", 2250, "core"),
  I("aghanims_scepter", "Aghanim's Scepter", 4200, "core"),
  I("sheepstick", "Scythe of Vyse", 5625, "core"),
  I("octarine_core", "Octarine Core", 5000, "core"),
  I("refresher", "Refresher Orb", 5000, "core"),
  I("shivas_guard", "Shiva's Guard", 4850, "core"),
  I("bloodstone", "Bloodstone", 4400, "core"),
  I("wind_waker", "Wind Waker", 7175, "core"),
  I("kaya", "Kaya", 2050, "core"),
  I("yasha_and_kaya", "Yasha and Kaya", 4100, "core"),
  I("kaya_and_sange", "Kaya and Sange", 4100, "core"),
  I("aether_lens", "Aether Lens", 2275, "core"),
  I("eternal_shroud", "Eternal Shroud", 4400, "core"),
  I("orchid", "Orchid Malevolence", 3475, "core"),
  I("rod_of_atos", "Rod of Atos", 2700, "core"),
  I("dagon_5", "Dagon 5", 6575, "core"),
  I("manta_style", "Manta Style", 4600, "core"),
  I("eblanas_riddle", "Eblana's Riddle", 5600, "core"),
  I("crown_of_the_magi", "Crown of the Magi", 4200, "core"),

  // Оффлейн / утилити
  I("vanguard", "Vanguard", 1825, "offlane"),
  I("blade_mail", "Blade Mail", 2200, "offlane"),
  I("crimson_guard", "Crimson Guard", 3800, "offlane"),
  I("pipe", "Pipe of Insight", 4175, "offlane"),
  I("heavens_halberd", "Heaven's Halberd", 3800, "offlane"),
  I("lotus_orb", "Lotus Orb", 4000, "offlane"),
  I("aeon_disk", "Aeon Disk", 3100, "offlane"),
  I("gem", "Gem of True Sight", 900, "offlane"),
  I("cetors_blessing", "Forged Relic", 3950, "offlane"),

  // Саппорт-предметы
  I("urn_of_shadows", "Urn of Shadows", 880, "support"),
  I("spirit_vessel", "Spirit Vessel", 2940, "support"),
  I("glimmer", "Glimmer Cape", 1950, "support"),
  I("force_staff", "Force Staff", 2200, "support"),
  I("ghost", "Ghost Scepter", 1500, "support"),
  I("cyclone", "Eul's Scepter of the Wind God", 2725, "support"),
  I("medallion_of_courage", "Medallion of Courage", 1175, "support"),
  I("solar_crest", "Solar Crest", 3525, "support"),
  I("veil_of_discord", "Veil of Discord", 1525, "support"),
  I("guardian_greaves", "Guardian Greaves", 5250, "support"),
  I("tome_of_knowledge", "Tome of Knowledge", 75, "support"),
  I("flying_courier", "Flying Courier", 0, "support"),

  // Нейтральные (для слота нейтрала)
  I("flicker", "Flicker", 0, "neutral"),
  I("trusty_shovel", "Trusty Shovel", 0, "neutral"),
  I("ocean_heart", "Ocean Heart", 0, "neutral"),
  I("ironwood_tree", "Ironwood Tree", 0, "neutral"),
  I("philosophers_stone", "Philosopher's Stone", 0, "neutral"),
  I("giant_ring", "Giant Ring", 0, "neutral"),
  I("spell_prism", "Spell Prism", 0, "neutral"),
  I("ninja_gear", "Ninja Gear", 0, "neutral"),
  I("timeless_relic", "Timeless Relic", 0, "neutral"),
  I("apex", "Apex", 0, "neutral"),
];

export const itemByKey = new Map(ITEMS.map((it) => [it.key, it]));
export const itemUrl = (key) =>
  `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${key}.png`;

// Пулы для генерации билдов по позициям
export const ITEM_POOLS = {
  1: {
    boots: ["power_treads", "phase_boots", "travel_boots"],
    core: [
      "bfury", "manta", "butterfly", "satanic", "abyssal_blade", "monkey_king_bar",
      "lesser_crit", "skadi", "sange_and_yasha", "mjollnir", "radiance", "diffusal_blade",
      "silver_edge", "bloodthorn", "hurricane_pike", "desolator", "harpoon", "disperser",
      "gleipnir", "armlet", "heart", "assault", "sphere", "black_king_bar", "aghanims_scepter",
      "bash_of_the_deep", "maelstrom", "echo_sabre", "crystalys",
    ],
  },
  2: {
    boots: ["power_treads", "arcane_boots", "phase_boots", "travel_boots"],
    core: [
      "black_king_bar", "blink", "aghanims_scepter", "sheepstick", "octarine_core",
      "refresher", "shivas_guard", "bloodstone", "wind_waker", "yasha_and_kaya",
      "kaya_and_sange", "aether_lens", "eternal_shroud", "orchid", "rod_of_atos",
      "manta", "skadi", "butterfly", "satanic", "eblanas_riddle", "crown_of_the_magi",
      "bloodthorn", "dagon_5", "kaya",
    ],
  },
  3: {
    boots: ["phase_boots", "arcane_boots", "tranquil_boots", "power_treads", "travel_boots"],
    core: [
      "blink", "blade_mail", "crimson_guard", "pipe", "heavens_halberd", "lotus_orb",
      "shivas_guard", "assault", "heart", "black_king_bar", "aghanims_scepter",
      "vanguard", "radiance", "eternal_shroud", "harpoon", "aeon_disk", "cetors_blessing",
      "sange_and_yasha", "kaya_and_sange", "gem", "octarine_core", "refresher", "sheepstick",
    ],
  },
  4: {
    boots: ["arcane_boots", "tranquil_boots", "phase_boots", "travel_boots"],
    core: [
      "force_staff", "glimmer", "blink", "aeon_disk", "ghost", "cyclone", "rod_of_atos",
      "urn_of_shadows", "spirit_vessel", "solar_crest", "veil_of_discord", "aghanims_scepter",
      "sheepstick", "lotus_orb", "pipe", "guardian_greaves", "orchid", "octarine_core",
      "wind_waker", "refresher", "medallion_of_courage",
    ],
  },
  5: {
    boots: ["arcane_boots", "tranquil_boots", "travel_boots"],
    core: [
      "glimmer", "force_staff", "ghost", "cyclone", "urn_of_shadows", "spirit_vessel",
      "aeon_disk", "solar_crest", "veil_of_discord", "medallion_of_courage", "lotus_orb",
      "guardian_greaves", "pipe", "sheepstick", "aghanims_scepter", "gem", "wind_waker",
    ],
  },
};

export const NEUTRAL_POOL = [
  "flicker", "trusty_shovel", "ocean_heart", "ironwood_tree", "philosophers_stone",
  "giant_ring", "spell_prism", "ninja_gear", "timeless_relic", "apex",
];

export const EARLY_GAME = ["magic_wand", "bracer", "wraith_band", "null_talisman", "orb_of_corrosion", "hand_of_midas"];
