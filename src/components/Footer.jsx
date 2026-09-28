import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>
            DOTA<span style={{ color: "var(--accent)" }}>PROTRACKER</span>
          </div>
          <div style={{ marginTop: 6, maxWidth: 520 }}>
            Демо-проект: клон сервиса меты Dota 2. Все матчи и статистика сгенерированы
            детерминированно и не являются реальными данными. Ростеры команд приблизительные.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Link to="/heroes?bracket=pro">Мета героев</Link>
          <Link to="/matches?bracket=pro">Матчи</Link>
          <Link to="/players?bracket=pro">Игроки</Link>
          <Link to="/teams">Команды</Link>
        </div>
        <div style={{ maxWidth: 300 }}>
          Данные: <a href="https://www.opendota.com" target="_blank" rel="noreferrer">OpenDota API</a> (мета, матчи,
          команды, профили) загружаются в браузере и всегда актуальны; если API недоступен, работает
          офлайн-демо-режим с локальным генератором. Не аффилировано с Valve Corporation.
          Dota 2 — товарный знак Valve. Изображения: © Valve Corporation через Steam CDN.
        </div>
      </div>
    </footer>
  );
}
