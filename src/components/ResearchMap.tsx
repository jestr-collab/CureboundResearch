import { useState, type MouseEvent } from "react";
import { PROGRAMS, aggregateByState } from "../data/programs";
import { STATE_NAMES } from "../data/stateNames";
import { STATE_PATHS } from "../data/statePaths";

function fillForCount(count: number, max: number): string {
  if (count <= 0) return "var(--map-empty)";
  const t = count / max;
  if (t >= 0.75) return "var(--map-high)";
  if (t >= 0.4) return "var(--map-mid)";
  return "var(--map-low)";
}

export function ResearchMap() {
  const byState = aggregateByState(STATE_NAMES);
  const maxPrograms = Math.max(
    ...Object.values(byState).map((s) => s.programCount),
  );

  const [hovered, setHovered] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const agg = hovered ? byState[hovered] : null;

  function moveTip(abbr: string, e: MouseEvent) {
    if (!byState[abbr]) {
      setHovered(null);
      setTip(null);
      return;
    }
    setHovered(abbr);
    const w = 300;
    const x =
      e.clientX + 18 + w > window.innerWidth ? e.clientX - w - 12 : e.clientX + 18;
    const y = Math.min(e.clientY + 14, window.innerHeight - 120);
    setTip({ x: Math.max(8, x), y: Math.max(8, y) });
  }

  return (
    <>
      <svg
        className="map"
        viewBox="0 0 980 580"
        role="img"
        aria-label="US map of research partnerships by state"
      >
        {Object.entries(STATE_PATHS).map(([abbr, d]) => {
          const count = byState[abbr]?.programCount ?? 0;
          const active = count > 0;
          const focus = hovered === abbr;
          return (
            <path
              key={abbr}
              d={d}
              fill={fillForCount(count, maxPrograms)}
              className={[active ? "active" : "", focus ? "focus" : ""]
                .filter(Boolean)
                .join(" ")}
              opacity={hovered && active && !focus ? 0.45 : 1}
              onMouseEnter={(e) => moveTip(abbr, e)}
              onMouseMove={(e) => moveTip(abbr, e)}
              onMouseLeave={() => {
                setHovered(null);
                setTip(null);
              }}
            />
          );
        })}
      </svg>

      <div className="legend">
        <span>Programs</span>
        <span className="item">
          <i style={{ background: "var(--map-empty)" }} /> None
        </span>
        <span className="item">
          <i style={{ background: "var(--map-low)" }} /> 1
        </span>
        <span className="item">
          <i style={{ background: "var(--map-high)" }} /> {maxPrograms}
        </span>
        <span className="item muted">{PROGRAMS.length} programs</span>
      </div>

      {agg && tip ? (
        <aside className="tooltip" style={{ left: tip.x, top: tip.y }} aria-hidden>
          <div className="tip-head">
            <strong>
              {agg.name} ({agg.state})
            </strong>
            <span>
              {agg.programCount} program{agg.programCount === 1 ? "" : "s"}
            </span>
          </div>
          <ul>
            {agg.programs.map((p) => (
              <li key={p.id}>
                <div className="pi">
                  {p.pi}
                  {p.priority ? <em>★</em> : null}
                </div>
                <div className="area">{p.cancerArea}</div>
                <div className="inst">
                  {p.institution} · {p.city}, {p.state}
                </div>
                <div className="people">
                  {p.partners.map((partner) => (
                    <span key={partner.name}>
                      {partner.name} <small>({partner.role})</small>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </>
  );
}
