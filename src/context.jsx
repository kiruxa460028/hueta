import React, { createContext, useContext, useEffect, useState } from "react";
import { BRACKETS } from "./data/db.js";
import { live } from "./data/live.js";

const BracketCtx = createContext({ bracket: "pro", setBracket: () => {} });
const DataCtx = createContext({ mode: "loading", refresh: () => {} });

export function BracketProvider({ children }) {
  const [bracket, setBracketState] = useState(() => {
    const q = new URLSearchParams(window.location.search).get("bracket");
    return BRACKETS.includes(q) ? q : "pro";
  });

  const setBracket = (b) => {
    setBracketState(b);
    const url = new URL(window.location);
    url.searchParams.set("bracket", b);
    window.history.replaceState({}, "", url);
  };

  useEffect(() => {
    const onPop = () => {
      const q = new URLSearchParams(window.location.search).get("bracket");
      if (BRACKETS.includes(q)) setBracketState(q);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return <BracketCtx.Provider value={{ bracket, setBracket }}>{children}</BracketCtx.Provider>;
}

export const useBracket = () => useContext(BracketCtx);

// Источник данных: 'loading' → 'live' (OpenDota) | 'demo' (офлайн-генератор)
export function DataSourceProvider({ children }) {
  const [mode, setMode] = useState("loading");

  useEffect(() => {
    const apply = () => setMode(live.status === "ok" ? "live" : live.status === "loading" || live.status === "idle" ? "loading" : "demo");
    const unsub = live.subscribe(apply);
    live.init();
    apply();
    return unsub;
  }, []);

  const refresh = () => live.init(true);
  return <DataCtx.Provider value={{ mode, refresh }}>{children}</DataCtx.Provider>;
}

export const useDataSource = () => useContext(DataCtx);

export function BracketTabs({ extra }) {
  const { bracket, setBracket } = useBracket();
  return (
    <div className="bracket-row">
      <div>
        <h1 className="page-title">{extra?.title || "Мета-статистика"}</h1>
        {extra?.subtitle ? <p className="page-subtitle">{extra.subtitle}</p> : null}
      </div>
      <div className="segmented">
        {BRACKETS.map((b) => (
          <button key={b} className={bracket === b ? "active" : ""} onClick={() => setBracket(b)}>
            {b === "pro" ? "Про" : b === "immortal" ? "Immortal" : "Divine"}
          </button>
        ))}
      </div>
    </div>
  );
}
