import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import {
  RESEARCH_INSTITUTIONS,
  RESEARCH_TOTAL,
  type ResearchInstitution,
} from "../data/researchInstitutions";
import { WORLD_VB_H, WORLD_VB_W } from "../data/worldPath";
import worldBase from "../assets/world-base.png";

type Tip = {
  items: ResearchInstitution[];
  x: number;
  y: number;
};

const POP_DURATION_MS = 500;
const POP_SPAN_MS = 2600;

/** LA/OC/SD metro — skip lines within this cluster */
const SOCAL_CITIES = new Set([
  "San Diego",
  "Los Angeles",
  "Orange",
  "Pasadena",
  "Duarte",
  "Santa Ana",
  "El Segundo",
  "Fountain Valley",
]);

function isSouthernCalifornia(inst: ResearchInstitution): boolean {
  return inst.r === "California" && SOCAL_CITIES.has(inst.c);
}

function popDelay(inst: ResearchInstitution): number {
  const t = inst.x / WORLD_VB_W + (inst.y / WORLD_VB_H) * 0.12;
  return Math.round(t * POP_SPAN_MS);
}

export function ResearchMap({ isFullscreen = false }: { isFullscreen?: boolean }) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [animating, setAnimating] = useState(false);

  const byLocation = useMemo(() => {
    const map = new Map<string, ResearchInstitution[]>();
    for (const inst of RESEARCH_INSTITUTIONS) {
      const key = `${inst.c}|${inst.r}`;
      const list = map.get(key);
      if (list) list.push(inst);
      else map.set(key, [inst]);
    }
    return map;
  }, []);

  const popDelays = useMemo(() => {
    const map = new Map<number, number>();
    for (const inst of RESEARCH_INSTITUTIONS) {
      map.set(inst.id, popDelay(inst));
    }
    return map;
  }, []);

  const sanDiegoHub = useMemo(() => {
    const sd = RESEARCH_INSTITUTIONS.filter((i) => i.c === "San Diego");
    if (sd.length === 0) return { x: 176.15, y: 159.12 };
    return {
      x: sd.reduce((s, i) => s + i.x, 0) / sd.length,
      y: sd.reduce((s, i) => s + i.y, 0) / sd.length,
    };
  }, []);

  const researchLinks = useMemo(() => {
    const seen = new Set<string>();
    const links: {
      key: string;
      x: number;
      y: number;
      delay: number;
      len: number;
    }[] = [];
    for (const inst of RESEARCH_INSTITUTIONS) {
      if (isSouthernCalifornia(inst)) continue;
      const key = `${inst.c}|${inst.r}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        key,
        x: inst.x,
        y: inst.y,
        delay: popDelay(inst),
        len: Math.hypot(inst.x - sanDiegoHub.x, inst.y - sanDiegoHub.y),
      });
    }
    return links;
  }, [sanDiegoHub]);

  useEffect(() => {
    if (!isFullscreen) {
      setAnimating(false);
      return;
    }
    setAnimating(true);
    const done = window.setTimeout(
      () => setAnimating(false),
      POP_SPAN_MS + POP_DURATION_MS + 80,
    );
    return () => window.clearTimeout(done);
  }, [isFullscreen]);

  function showTip(inst: ResearchInstitution, e: MouseEvent) {
    const key = `${inst.c}|${inst.r}`;
    const items = byLocation.get(key) ?? [inst];
    setHoverId(inst.id);
    const w = 320;
    const x =
      e.clientX + 16 + w > window.innerWidth
        ? e.clientX - w - 12
        : e.clientX + 16;
    const y = Math.min(e.clientY + 12, window.innerHeight - 120);
    setTip({ items, x: Math.max(8, x), y: Math.max(8, y) });
  }

  return (
    <>
      <div className="map-stack research-world">
        <img
          className="world-base-img"
          src={worldBase}
          alt=""
          draggable={false}
        />
        <svg
          className={`map world-map${animating ? " research-dots-animating" : ""}`}
          viewBox={`0 0 ${WORLD_VB_W} ${WORLD_VB_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Global map of Curebound research institutions"
        >
          {isFullscreen ? (
            <g className="research-links" aria-hidden>
              {researchLinks.map((link) => (
                <line
                  key={link.key}
                  x1={sanDiegoHub.x}
                  y1={sanDiegoHub.y}
                  x2={link.x}
                  y2={link.y}
                  className="research-link"
                  style={
                    animating
                      ? ({
                          "--line-len": link.len,
                          animationDelay: `${link.delay}ms`,
                        } as CSSProperties)
                      : undefined
                  }
                />
              ))}
            </g>
          ) : null}
          {RESEARCH_INSTITUTIONS.map((inst) => {
            const active = hoverId === inst.id;
            return (
              <circle
                key={inst.id}
                cx={inst.x}
                cy={inst.y}
                r={active ? 5.5 : 3.8}
                className={`research-dot${active ? " active" : ""}`}
                style={
                  animating
                    ? { animationDelay: `${popDelays.get(inst.id) ?? 0}ms` }
                    : undefined
                }
                onMouseEnter={(e) => showTip(inst, e)}
                onMouseMove={(e) => showTip(inst, e)}
                onMouseLeave={() => {
                  setHoverId(null);
                  setTip(null);
                }}
              >
                <title>
                  {inst.n} — {inst.c}, {inst.r}
                </title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="legend">
        <span className="item">
          <i className="dot" style={{ background: "var(--accent)" }} /> One
          point per institution
        </span>
        <span className="item muted">
          Plotted {RESEARCH_TOTAL} / {RESEARCH_TOTAL}
        </span>
      </div>

      {tip ? (
        <aside
          className="tooltip"
          style={{ left: tip.x, top: tip.y }}
          aria-hidden
        >
          <div className="tip-head">
            <strong>
              {tip.items[0].c}, {tip.items[0].r}
            </strong>
            <span>
              {tip.items.length} institution
              {tip.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul>
            {tip.items.map((inst) => (
              <li key={inst.id}>
                <div className="pi">{inst.n}</div>
                <div className="inst">
                  {inst.c}, {inst.r}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </>
  );
}
