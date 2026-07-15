import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { STATE_PATHS } from "../data/statePaths";

export type DonorPoint = {
  x: number;
  y: number;
  n: string;
  z: string;
  c: string;
  s: string;
};

type DonorPayload = {
  points: DonorPoint[];
  meta: { accounts: number; missingZip: number };
};

type Fit = {
  scale: number;
  offsetX: number;
  offsetY: number;
  w: number;
  h: number;
};

const VB_W = 980;
const VB_H = 580;

/** Match SVG preserveAspectRatio="xMidYMid meet" */
function fitTransform(w: number, h: number): Fit {
  const scale = Math.min(w / VB_W, h / VB_H);
  return {
    scale,
    offsetX: (w - VB_W * scale) / 2,
    offsetY: (h - VB_H * scale) / 2,
    w,
    h,
  };
}

export function DonorZipMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fitRef = useRef<Fit>(fitTransform(VB_W, VB_H));
  const [points, setPoints] = useState<DonorPoint[]>([]);
  const [hover, setHover] = useState<{
    point: DonorPoint;
    x: number;
    y: number;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/donor-accounts.json")
      .then((r) => r.json())
      .then((data: DonorPayload) => {
        if (cancelled) return;
        setPoints(data.points);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const grid = useMemo(() => {
    const cell = 8;
    const map = new Map<string, number[]>();
    points.forEach((p, i) => {
      const key = `${Math.floor(p.x / cell)},${Math.floor(p.y / cell)}`;
      const arr = map.get(key);
      if (arr) arr.push(i);
      else map.set(key, [i]);
    });
    return { cell, map };
  }, [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || points.length === 0) return;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const fit = fitTransform(w, h);
      fitRef.current = fit;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const r = Math.max(1.1, fit.scale * 1.2);
      ctx.fillStyle = "rgba(240, 255, 90, 0.55)";
      for (const p of points) {
        const px = fit.offsetX + p.x * fit.scale;
        const py = fit.offsetY + p.y * fit.scale;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [points]);

  function findNearest(mx: number, my: number): DonorPoint | null {
    if (points.length === 0) return null;
    const { scale, offsetX, offsetY, cell } = {
      ...fitRef.current,
      cell: grid.cell,
    };
    if (scale <= 0) return null;

    const vx = (mx - offsetX) / scale;
    const vy = (my - offsetY) / scale;
    const cx = Math.floor(vx / cell);
    const cy = Math.floor(vy / cell);
    const threshold = 10;

    let best: DonorPoint | null = null;
    let bestD = threshold;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const idxs = grid.map.get(`${cx + dx},${cy + dy}`);
        if (!idxs) continue;
        for (const i of idxs) {
          const p = points[i];
          const d = Math.hypot(p.x - vx, p.y - vy);
          if (d < bestD) {
            bestD = d;
            best = p;
          }
        }
      }
    }
    return best;
  }

  function onMove(e: MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const p = findNearest(mx, my);
    if (!p) {
      setHover(null);
      return;
    }
    const tipW = 280;
    const x =
      e.clientX + 16 + tipW > window.innerWidth
        ? e.clientX - tipW - 12
        : e.clientX + 16;
    const y = Math.min(e.clientY + 12, window.innerHeight - 100);
    setHover({ point: p, x: Math.max(8, x), y: Math.max(8, y) });
  }

  return (
    <>
      <div className="map-stack" ref={wrapRef}>
        <svg
          className="map base-map"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {Object.entries(STATE_PATHS).map(([abbr, d]) => (
            <path key={abbr} d={d} className="state-outline" />
          ))}
        </svg>
        <canvas
          ref={canvasRef}
          className="point-layer"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
        {!ready ? <div className="map-loading">Loading accounts…</div> : null}
      </div>

      <div className="legend">
        <span>Each point = 1 account</span>
        <span className="item">
          <i style={{ background: "var(--accent)" }} /> Plotted by ZIP
        </span>
      </div>

      {hover ? (
        <aside
          className="tooltip"
          style={{ left: hover.x, top: hover.y }}
          aria-hidden
        >
          <div className="tip-head">
            <strong>{hover.point.n || "Account"}</strong>
          </div>
          <div className="tip-grid">
            <span>ZIP</span>
            <b>{hover.point.z}</b>
            <span>Location</span>
            <b>
              {[hover.point.c, hover.point.s].filter(Boolean).join(", ") || "—"}
            </b>
          </div>
        </aside>
      ) : null}
    </>
  );
}
