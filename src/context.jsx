import React, { createContext, useContext, useEffect, useState } from "react";
import { BRACKETS } from "./data/db.js";

const BracketCtx = createContext({ bracket: "pro", setBracket: () => {} });

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

  // синхронизация при навигации назад/вперёд
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
