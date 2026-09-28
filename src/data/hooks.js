// Хуки-адаптеры: возвращают живые данные OpenDota, если доступны, иначе демо-данные
import { useEffect, useMemo, useState } from "react";
import { useDataSource } from "../context.jsx";
import {
  getHeroMeta,
  getTierList,
  getMatches,
  getTeamsList,
  getHeroDetail,
} from "./db.js";
import { live, liveHeroMeta, liveTierList, liveMatchRows, liveTeams, liveProPlayers } from "./live.js";

export function useHeroMeta(bracket) {
  const { mode } = useDataSource();
  return useMemo(() => {
    if (mode === "live") {
      const rows = liveHeroMeta(bracket);
      if (rows) return rows;
    }
    return getHeroMeta(bracket);
  }, [mode, bracket]);
}

export function useTierList(bracket) {
  const { mode } = useDataSource();
  return useMemo(() => {
    if (mode === "live") {
      const t = liveTierList(bracket);
      if (t) return t;
    }
    return getTierList(bracket);
  }, [mode, bracket]);
}

// Лента матчей: про — реальные; immortal/divine — демо
export function useMatchList(bracket) {
  const { mode } = useDataSource();
  return useMemo(() => {
    if (mode === "live" && bracket === "pro") {
      const rows = liveMatchRows();
      if (rows) return rows;
    }
    return getMatches(bracket);
  }, [mode, bracket]);
}

export function useTeamsList() {
  const { mode } = useDataSource();
  return useMemo(() => {
    if (mode === "live") {
      const rows = liveTeams();
      if (rows) return rows;
    }
    return getTeamsList();
  }, [mode]);
}

// Про-игроки (live): составы топ-команд; иначе null → страница использует демо
export function useLiveProPlayers() {
  const { mode } = useDataSource();
  const [players, setPlayers] = useState(null);
  useEffect(() => {
    if (mode !== "live") return;
    let alive = true;
    liveProPlayers()
      .then((p) => alive && setPlayers(p))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [mode]);
  return players;
}

// Демо-детали героя (используются, когда live недоступен)
export function useHeroDetailDemo(bracket, heroId) {
  return useMemo(() => (heroId ? getHeroDetail(bracket, heroId) : null), [bracket, heroId]);
}
