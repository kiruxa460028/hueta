import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { BRACKET_INFO } from "../data/db.js";
import { heroBySlug, ROLE_RU, ATTR_RU } from "../data/heroes.js";
import { itemByKey } from "../data/items.js";
import { useBracket, useDataSource, BracketTabs } from "../context.jsx";
import { useHeroMeta, useTierList, useHeroDetailDemo } from "../data/hooks.js";
import { liveHeroExtra } from "../data/live.js";
import { HeroIcon, AttrBadge, PlayerAvatar, ItemIcon, TierBadge, itemNameByKey } from "../components/common.jsx";
import { LineChart } from "../components/charts.jsx";
import { MatchRow } from "../components/MatchRows.jsx";
import { wrColor, flag, fmtNum } from "../lib/format.js";

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={color ? { color } : undefined}>{value}</div>
      {sub ? <div className="stat-card__sub">{sub}</div> : null}
    </div>
  );
}

export default function HeroDetailPage() {
  const { slug } = useParams();
  const { bracket } = useBracket();
  const { mode } = useDataSource();
  const isLive = mode === "live";
  const hero = heroBySlug.get(slug);

  const metaAll = useHeroMeta(bracket);
  const tiers = useTierList(bracket);
  const m = useMemo(() => metaAll.find((r) => r.hero.id === hero?.id), [metaAll, hero]);

  const tierInfo = useMemo(() => {
    if (!hero || !tiers) return null;
    for (const t of ["S", "A", "B", "C", "D"]) {
      if (tiers[t]?.some((x) => x.hero.id === hero.id)) return t;
    }
    return "D";
  }, [tiers, hero]);

  // Живые доп. данные (матчапы, топ игроков, предметы)
  const [extra, setExtra] = useState(null);
  useEffect(() => {
    if (!isLive || !hero) return;
    let alive = true;
    setExtra(null);
    liveHeroExtra(hero.id)
      .then((x) => alive && setExtra(x))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isLive, hero]);

  // Демо-детали (для офлайн-режима)
  const demoDetail = useHeroDetailDemo(isLive ? null : bracket, hero?.id);

  const chartPoints = useMemo(() => {
    const days = m?.days || [];
    if (days.length < 3) return null;
    // демо: у дней есть поле day (0 = сегодня); live: массив по дням (старые → новые)
    if (days[0].day != null) {
      const buckets = new Map();
      for (const d of days) {
        const b = Math.floor((29 - d.day) / 3);
        const cur = buckets.get(b) || { w: 0, n: 0, last: d.day };
        cur.w += d.w;
        cur.n += d.n;
        if (d.day < cur.last) cur.last = d.day;
        buckets.set(b, cur);
      }
      return [...buckets.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, cur]) => {
          const date = new Date(Date.now() - cur.last * 86400000);
          return { label: `${date.getDate()} ${MONTHS[date.getMonth()]}`, y: cur.n ? (cur.w / cur.n) * 100 : 50 };
        });
    }
    return days.map((d, i) => {
      const ago = days.length - 1 - i;
      return { label: ago === 0 ? "сегодня" : `−${ago}д`, y: d.n ? (d.w / d.n) * 100 : 50 };
    });
  }, [m]);

  if (!hero) return <Navigate to="/heroes" replace />;

  const wr = m?.wr ?? null;
  const synergy = !isLive ? demoDetail?.synergy || [] : null;
  const counters = !isLive ? demoDetail?.counters || [] : null;
  const goodAgainst = isLive ? extra?.goodAgainst || [] : null;
  const badAgainst = isLive ? extra?.badAgainst || [] : null;
  const topPlayers = isLive ? extra?.topPlayers || [] : demoDetail?.topPlayers || [];
  const items = isLive ? extra?.items || [] : demoDetail?.items || [];
  const recentMatches = !isLive ? demoDetail?.recent || [] : [];

  const matchupList = (list, side) =>
    list.map((s) => (
      <Link key={s.hero.id} to={`/heroes/${s.hero.s}?bracket=${bracket}`} className="matchup-row">
        <HeroIcon hero={s.hero} size="sm" />
        <span style={{ fontWeight: 600, fontSize: 13 }}>{s.hero.n}</span>
        <span className="matchup-row__n muted">{s.n} игр</span>
        <span className="matchup-row__wr" style={{ color: wrColor(side === "good" ? s.wr : 100 - s.wr) }}>{s.wr.toFixed(1)}%</span>
      </Link>
    ));

  return (
    <div className="page">
      <BracketTabs
        extra={{
          title: "Мета героев",
          subtitle: isLive ? `${BRACKET_INFO[bracket].full} · живые данные OpenDota` : `${BRACKET_INFO[bracket].full} · демо-режим`,
        }}
      />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body hero-banner">
          <HeroIcon hero={hero} size="xl" />
          <div className="hero-banner__info">
            <div className="hero-banner__name">
              {hero.n}
              <AttrBadge attr={hero.a} tooltip={ATTR_RU[hero.a]} />
              {tierInfo && <TierBadge tier={tierInfo} />}
            </div>
            <div className="muted" style={{ marginTop: 4, fontSize: 12.5 }}>
              {ATTR_RU[hero.a]} · {hero.at === "Melee" ? "ближний бой" : "дальний бой"} · {m?.picks ?? 0} матчей
            </div>
            <div className="hero-banner__roles chips" style={{ marginTop: 8 }}>
              {hero.r.map((r) => <span key={r} className="chip" style={{ cursor: "default" }}>{ROLE_RU[r]}</span>)}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {isLive ? <span className="real-chip">OpenDota</span> : <span className="demo-chip">демо</span>}
          </div>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 18 }}>
        <StatCard label="Винрейт" value={wr == null ? "—" : `${wr.toFixed(1)}%`} sub={`${m?.wins ?? 0} побед из ${m?.picks ?? 0}`} color={wr != null ? wrColor(wr) : undefined} />
        <StatCard label="Пикрейт" value={m?.pickRate == null ? "—" : `${m.pickRate.toFixed(1)}%`} sub={`${m?.picks ?? 0} пиков`} />
        {m?.banRate != null ? (
          <StatCard label="Банрейт" value={`${m.banRate.toFixed(1)}%`} sub={`${m.bans} банов`} />
        ) : (
          <StatCard label="Матчей в выборке" value={fmtNum(m?.matches ?? 0)} sub="основано на всех матчах брекета" />
        )}
        {m?.kda != null && <StatCard label="KDA" value={m.kda.toFixed(2)} />}
        {m?.gpm != null && <StatCard label="Средний GPM" value={m.gpm} />}
        {m?.dmg != null && <StatCard label="Средний урон" value={fmtNum(m.dmg)} />}
        {m?.delta != null && (
          <StatCard
            label="Тренд"
            value={`${m.delta > 0 ? "▲" : "▼"} ${Math.abs(m.delta).toFixed(1)}`}
            sub="за последние дни"
            color={m.delta > 0 ? "#3ddc84" : "#ff5c5c"}
          />
        )}
      </div>

      {chartPoints && (
        <div className="card">
          <div className="card__head">
            <span className="card__title">Динамика винрейта {isLive ? "· последние дни" : "· 30 дней"}</span>
          </div>
          <LineChart points={chartPoints} minGap={5} color="#6cb1ff" valueFmt={(v) => `${v.toFixed(1)}%`} />
        </div>
      )}

      <div className="section grid-2">
        {isLive ? (
          <>
            <div className="card">
              <div className="card__head"><span className="card__title" style={{ color: "var(--radiant)" }}>Силён против</span></div>
              <div className="card__body card__body--flush" style={{ padding: 8 }}>
                {extra === null ? <div className="empty">Загружаем матчапы…</div> : goodAgainst.length ? matchupList(goodAgainst, "good") : <div className="empty">Недостаточно данных</div>}
              </div>
            </div>
            <div className="card">
              <div className="card__head"><span className="card__title" style={{ color: "var(--dire)" }}>Слаб против</span></div>
              <div className="card__body card__body--flush" style={{ padding: 8 }}>
                {extra === null ? <div className="empty">Загружаем матчапы…</div> : badAgainst.length ? matchupList(badAgainst, "bad") : <div className="empty">Недостаточно данных</div>}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="card__head"><span className="card__title" style={{ color: "var(--radiant)" }}>Лучшая синергия</span></div>
              <div className="card__body card__body--flush" style={{ padding: 8 }}>
                {synergy.length ? matchupList(synergy, "good") : <div className="empty">Недостаточно данных</div>}
              </div>
            </div>
            <div className="card">
              <div className="card__head"><span className="card__title" style={{ color: "var(--dire)" }}>Худшие матчапы</span></div>
              <div className="card__body card__body--flush" style={{ padding: 8 }}>
                {counters.length ? matchupList(counters, "bad") : <div className="empty">Недостаточно данных</div>}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="section grid-2">
        <div className="card">
          <div className="card__head">
            <span className="card__title">{isLive ? "Топ игроков на герое" : "Лучшие игроки на герое"}</span>
          </div>
          <div className="card__body card__body--flush" style={{ padding: 8 }}>
            {isLive && extra === null && <div className="empty">Загружаем…</div>}
            {isLive &&
              topPlayers.map((p) => (
                <Link key={p.playerId} to={`/players/${p.playerId}`} className="matchup-row">
                  <span className="tier-badge tier-S" style={{ minWidth: 30 }}>#{p.rank}</span>
                  <PlayerAvatar nick={p.nick} size={28} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{p.nick}</span>
                  <span className="matchup-row__wr muted" style={{ fontSize: 11 }}>очки: {fmtNum(p.score)}</span>
                </Link>
              ))}
            {!isLive &&
              topPlayers.map((p) => (
                <Link key={p.playerId} to={`/players/${p.playerId}?bracket=${bracket}`} className="matchup-row">
                  <PlayerAvatar nick={p.nick} size={28} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    {p.nick} <span style={{ fontSize: 12 }}>{flag(p.country)}</span>
                  </span>
                  <span className="matchup-row__n muted">{p.n} игр</span>
                  <span className="matchup-row__wr" style={{ color: wrColor((p.w / p.n) * 100) }}>
                    {((p.w / p.n) * 100).toFixed(0)}%
                  </span>
                </Link>
              ))}
            {!isLive && topPlayers.length === 0 && <div className="empty">Недостаточно данных</div>}
          </div>
        </div>
        <div className="card">
          <div className="card__head"><span className="card__title">Популярные предметы {isLive ? "· реальная статистика" : ""}</span></div>
          <div className="card__body card__body--flush" style={{ padding: 8 }}>
            {isLive && extra === null && <div className="empty">Загружаем…</div>}
            {items.map((it) => (
              <div key={it.key} className="item-stat">
                <ItemIcon itemKey={it.key} />
                <span>
                  <span className="item-stat__name">{itemNameByKey(it.key)}</span>
                  <span className="item-stat__meta">{it.n} игр · {it.pickRate.toFixed(0)}% подборок</span>
                </span>
                <span className="item-stat__wr" style={{ color: wrColor(it.wr) }}>{it.wr.toFixed(0)}%</span>
              </div>
            ))}
            {items.length === 0 && (isLive ? extra !== null && <div className="empty">Недостаточно данных</div> : <div className="empty">Недостаточно данных</div>)}
          </div>
        </div>
      </div>

      {!isLive && recentMatches.length > 0 && (
        <div className="section">
          <div className="section__head"><h2 className="section__title">Последние матчи с героем</h2></div>
          <div className="card">
            <div className="card__body card__body--flush">
              {recentMatches.map(({ match }) => <MatchRow key={match.id} match={match} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
