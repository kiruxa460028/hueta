import React, { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getHeroDetail, getTierList, BRACKET_INFO } from "../data/db.js";
import { heroBySlug, ROLE_RU, ATTR_RU } from "../data/heroes.js";
import { itemByKey } from "../data/items.js";
import { useBracket, BracketTabs } from "../context.jsx";
import { HeroIcon, AttrBadge, PlayerAvatar, ItemIcon, TierBadge, WinRateBar } from "../components/common.jsx";
import { LineChart } from "../components/charts.jsx";
import { MatchRow } from "../components/MatchRows.jsx";
import { wrColor, flag, fmtNum } from "../lib/format.js";

const DAY = 86400000;
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export default function HeroDetailPage() {
  const { slug } = useParams();
  const { bracket } = useBracket();
  const hero = heroBySlug.get(slug);

  const detail = useMemo(() => (hero ? getHeroDetail(bracket, hero.id) : null), [bracket, hero]);
  const tierInfo = useMemo(() => {
    if (!hero) return null;
    const tiers = getTierList(bracket);
    for (const t of ["S", "A", "B", "C", "D"]) {
      if (tiers[t].some((x) => x.hero.id === hero.id)) return t;
    }
    return "D";
  }, [bracket, hero]);

  const m = detail?.meta;
  const chartPoints = useMemo(() => {
    // 3-дневные корзины за 30 дней
    const days = m?.days || [];
    const buckets = new Map();
    for (const d of days) {
      const b = Math.floor((29 - d.day) / 3);
      const cur = buckets.get(b) || { w: 0, n: 0, last: d.day };
      cur.w += d.w; cur.n += d.n;
      if (d.day < cur.last) cur.last = d.day;
      buckets.set(b, cur);
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([b, cur]) => {
        const date = new Date(Date.now() - cur.last * DAY);
        return { label: `${date.getDate()} ${MONTHS[date.getMonth()]}`, y: cur.n ? (cur.w / cur.n) * 100 : 50, n: cur.n };
      });
  }, [m]);

  if (!hero || !detail) return <Navigate to="/heroes" replace />;


  return (
    <div className="page">
      <BracketTabs extra={{ title: "Мета героев", subtitle: BRACKET_INFO[bracket].full }} />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body hero-banner">
          <HeroIcon hero={hero} size="xl" />
          <div className="hero-banner__info">
            <div className="hero-banner__name">
              {hero.n}
              <AttrBadge attr={hero.a} tooltip={ATTR_RU[hero.a]} />
              <TierBadge tier={tierInfo} />
            </div>
            <div className="muted" style={{ marginTop: 4, fontSize: 12.5 }}>
              {ATTR_RU[hero.a]} · {hero.at === "Melee" ? "ближний бой" : "дальний бой"} · {detail.n} матчей
            </div>
            <div className="hero-banner__roles chips" style={{ marginTop: 8 }}>
              {hero.r.map((r) => <span key={r} className="chip" style={{ cursor: "default" }}>{ROLE_RU[r]}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 18 }}>
        <div className="stat-card">
          <div className="stat-card__label">Винрейт</div>
          <div className="stat-card__value" style={{ color: wrColor(m.wr) }}>{m.wr.toFixed(1)}%</div>
          <div className="stat-card__sub">{detail.wins} из {detail.n} побед</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Пикрейт</div>
          <div className="stat-card__value">{m.pickRate.toFixed(1)}%</div>
          <div className="stat-card__sub">{m.picks} пиков из {fmtNum(m.matches)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Банрейт</div>
          <div className="stat-card__value">{m.banRate.toFixed(1)}%</div>
          <div className="stat-card__sub">{m.bans} банов</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">KDA</div>
          <div className="stat-card__value">{m.kda.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Средний GPM</div>
          <div className="stat-card__value">{m.gpm}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Средний урон</div>
          <div className="stat-card__value">{fmtNum(m.dmg)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card__head"><span className="card__title">Динамика винрейта · 30 дней</span></div>
        <LineChart
          points={chartPoints}
          minGap={5}
          color="#6cb1ff"
          valueFmt={(v) => `${v.toFixed(1)}%`}
        />
      </div>

      <div className="section grid-2">
        <div className="card">
          <div className="card__head"><span className="card__title" style={{ color: "var(--radiant)" }}>Лучшая синергия</span></div>
          <div className="card__body card__body--flush" style={{ padding: "8px" }}>
            {detail.synergy.map((s) => (
              <Link key={s.hero.id} to={`/heroes/${s.hero.s}?bracket=${bracket}`} className="matchup-row">
                <HeroIcon hero={s.hero} size="sm" />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.hero.n}</span>
                <span className="matchup-row__n muted">{s.n} игр</span>
                <span className="matchup-row__wr" style={{ color: wrColor(s.wr) }}>{s.wr.toFixed(1)}%</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card__head"><span className="card__title" style={{ color: "var(--dire)" }}>Худшие матчапы</span></div>
          <div className="card__body card__body--flush" style={{ padding: "8px" }}>
            {detail.counters.map((s) => (
              <Link key={s.hero.id} to={`/heroes/${s.hero.s}?bracket=${bracket}`} className="matchup-row">
                <HeroIcon hero={s.hero} size="sm" />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.hero.n}</span>
                <span className="matchup-row__n muted">{s.n} игр</span>
                <span className="matchup-row__wr" style={{ color: wrColor(100 - s.wr) }}>{s.wr.toFixed(1)}%</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="section grid-2">
        <div className="card">
          <div className="card__head"><span className="card__title">Лучшие игроки на герое</span></div>
          <div className="card__body card__body--flush" style={{ padding: "8px" }}>
            {detail.topPlayers.map((p) => (
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
          </div>
        </div>
        <div className="card">
          <div className="card__head"><span className="card__title">Популярные предметы</span></div>
          <div className="card__body card__body--flush" style={{ padding: "8px" }}>
            {detail.items.map((it) => (
              <div key={it.key} className="item-stat">
                <ItemIcon itemKey={it.key} />
                <span>
                  <span className="item-stat__name">{itemByKey.get(it.key)?.name}</span>
                  <span className="item-stat__meta">{it.n} раз · {it.pickRate.toFixed(0)}% подборок</span>
                </span>
                <span className="item-stat__wr" style={{ color: wrColor(it.wr) }}>{it.wr.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section__head"><h2 className="section__title">Последние матчи с героем</h2></div>
        <div className="card">
          <div className="card__body card__body--flush">
            {detail.recent.map(({ match }) => <MatchRow key={match.id} match={match} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
