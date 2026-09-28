import React, { useMemo, useRef, useState } from "react";
import { fmtNum } from "../lib/format.js";

// ============================================================================
// График преимущества (золото/опыт): область выше нуля — зелёная, ниже — красная
// ============================================================================
export function AdvChart({ series, label }) {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const W = 1000, H = 240, PAD_T = 14, PAD_B = 22;

  const { maxAbs, path, area } = useMemo(() => {
    const ma = Math.max(1000, ...series.map((v) => Math.abs(v))) * 1.12;
    const x = (i) => (i / Math.max(1, series.length - 1)) * W;
    const y = (v) => PAD_T + (1 - (v + ma) / (2 * ma)) * (H - PAD_T - PAD_B);
    let d = "", a = "";
    series.forEach((v, i) => {
      d += `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    });
    a = d + `L${W},${y(0).toFixed(1)}L0,${y(0).toFixed(1)}Z`;
    return { maxAbs: ma, path: d, area: a };
  }, [series]);

  const zeroY = PAD_T + (1 - 0.5) * (H - PAD_T - PAD_B);

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(frac * (series.length - 1));
    setHover({ idx, x: frac * 100, v: series[idx] });
  };

  const hoverText = hover
    ? `${Math.floor(hover.idx + 1)} мин · ${hover.v >= 0 ? "+" : "−"}${fmtNum(Math.abs(hover.v))} ${label}`
    : "";

  return (
    <div className="chart-wrap" style={{ padding: "10px 12px 6px" }}>
      {hover && (
        <>
          <div className="chart-tip">{hoverText}</div>
          <div style={{ position: "absolute", top: 10, bottom: 24, left: `${hover.x}%`, width: 1, background: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
        </>
      )}
      <svg
        ref={ref}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <clipPath id="adv-clip-top"><rect x="0" y="0" width={W} height={zeroY} /></clipPath>
          <clipPath id="adv-clip-bot"><rect x="0" y={zeroY} width={W} height={H - zeroY} /></clipPath>
        </defs>
        {/* сетка */}
        {[0.25, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={PAD_T + f * (H - PAD_T - PAD_B)} y2={PAD_T + f * (H - PAD_T - PAD_B)} stroke="#1c2230" strokeWidth="1" />
        ))}
        <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="#39435c" strokeWidth="1.5" />
        {/* области */}
        <g clipPath="url(#adv-clip-top)"><path d={area} fill="rgba(61, 220, 132, 0.22)" /></g>
        <g clipPath="url(#adv-clip-bot)"><path d={area} fill="rgba(255, 92, 92, 0.22)" /></g>
        {/* линия */}
        <g clipPath="url(#adv-clip-top)"><path d={path} fill="none" stroke="#3ddc84" strokeWidth="2" vectorEffect="non-scaling-stroke" /></g>
        <g clipPath="url(#adv-clip-bot)"><path d={path} fill="none" stroke="#ff5c5c" strokeWidth="2" vectorEffect="non-scaling-stroke" /></g>
        {/* подписи */}
        <text x="6" y={PAD_T + 2} fill="#5d6678" fontSize="15" fontFamily="Inter">+{fmtNum(maxAbs)}</text>
        <text x="6" y={H - 26} fill="#5d6678" fontSize="15" fontFamily="Inter">−{fmtNum(maxAbs)}</text>
        {Array.from({ length: Math.ceil((series.length - 1) / 10) }, (_, k) => (k + 1) * 10).map((m) => (
          <text key={m} x={(m / (series.length - 1)) * W} y={H - 6} fill="#5d6678" fontSize="15" textAnchor="middle" fontFamily="Inter">{m}</text>
        ))}
      </svg>
    </div>
  );
}

// ============================================================================
// Линейный график (винрейт по дням)
// ============================================================================
export function LineChart({ points, color = "#6cb1ff", valueFmt = (v) => `${v.toFixed(1)}%`, minGap }) {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const W = 1000, H = 220, PAD_T = 14, PAD_B = 24, PAD_L = 8;
  const values = points.map((p) => p.y);

  const { min, max, path, area, x0 } = useMemo(() => {
    let mn = Math.min(...values), mx = Math.max(...values);
    if (minGap) { const mid = (mn + mx) / 2; mn = Math.min(mn, mid - minGap); mx = Math.max(mx, mid + minGap); }
    const pad = (mx - mn) * 0.15 + 0.5;
    mn -= pad; mx += pad;
    const x = (i) => PAD_L + (i / Math.max(1, points.length - 1)) * (W - PAD_L * 2);
    const y = (v) => PAD_T + (1 - (v - mn) / (mx - mn)) * (H - PAD_T - PAD_B);
    let d = "";
    points.forEach((p, i) => { d += `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`; });
    const a = d + `L${x(points.length - 1).toFixed(1)},${H - PAD_B}L${PAD_L},${H - PAD_B}Z`;
    return { min: mn, max: mx, path: d, area: a, x0: x };
  }, [points, minGap]);

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(frac * (points.length - 1));
    setHover({ idx, x: frac * 100, p: points[idx] });
  };

  const yOf = (v) => PAD_T + (1 - (v - min) / (max - min)) * (H - PAD_T - PAD_B);

  return (
    <div className="chart-wrap" style={{ padding: "10px 12px 6px" }}>
      {hover && (
        <>
          <div className="chart-tip">{hover.p.label} · {valueFmt(hover.p.y)}</div>
          <div style={{ position: "absolute", top: 10, bottom: 24, left: `${hover.x}%`, width: 1, background: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
        </>
      )}
      <svg
        ref={ref}
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.5].map((f) => (
          <line key={f} x1="0" x2={W} y1={PAD_T + f * (H - PAD_T - PAD_B)} y2={PAD_T + f * (H - PAD_T - PAD_B)} stroke="#1c2230" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#line-fill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {minGap && (
          <line x1="0" x2={W} y1={yOf((min + max) / 2)} y2={yOf((min + max) / 2)} stroke="#39435c" strokeDasharray="6 6" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        )}
        {/* подписи оси X — каждые ~5 точек */}
        {points.map((p, i) =>
          i % Math.ceil(points.length / 7) === 0 || i === points.length - 1 ? (
            <text key={i} x={x0(i)} y={H - 6} fill="#5d6678" fontSize="15" textAnchor="middle" fontFamily="Inter">{p.label}</text>
          ) : null
        )}
      </svg>
    </div>
  );
}
