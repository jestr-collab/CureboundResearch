import { useEffect, useRef, useState } from "react";
import { STATE_PATHS } from "../data/statePaths";
import type { DonorPoint } from "../components/DonorZipMap";
import "./export.css";

const VB_W = 980;
const VB_H = 580;

function fitTransform(w: number, h: number) {
  const scale = Math.min(w / VB_W, h / VB_H);
  return {
    scale,
    offsetX: (w - VB_W * scale) / 2,
    offsetY: (h - VB_H * scale) / 2,
  };
}

export function DonorExport() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const whiteMap = new URLSearchParams(window.location.search).has("white");
  const [points, setPoints] = useState<DonorPoint[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}donor-accounts.json`)
      .then((r) => r.json())
      .then((data: { points: DonorPoint[] }) => {
        if (cancelled) return;
        setPoints(data.points);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || points.length === 0) return;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = 2;
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const fit = fitTransform(w, h);

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

  return (
    <div
      className="export-page"
      id="export-root"
      data-export-ready={ready ? "true" : undefined}
      style={{ width: 1200, height: 760 }}
    >
      <h1 className="export-title">Donor accounts by ZIP</h1>
      <div className="export-body" style={{ flex: 1 }}>
        <div className="export-map-col" style={{ width: "100%" }}>
          <div className={`export-map-wrap${whiteMap ? " white-us-map" : ""}`}>
            <div className="export-map-stack" ref={wrapRef}>
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
              <canvas ref={canvasRef} />
            </div>
            <div className="export-legend">
              <span>Each point = 1 account</span>
              <span className="item">
                <i className="dot" style={{ background: "#f0ff5a" }} /> Plotted
                by ZIP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
