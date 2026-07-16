import { aggregateByState } from "../data/programs";
import { STATE_NAMES } from "../data/stateNames";
import { STATE_PATHS } from "../data/statePaths";
import { fillForCount } from "../lib/mapColors";
import "./export.css";

const VB_W = 980;
const VB_H = 580;

export function ResearchExport() {
  const byState = aggregateByState(STATE_NAMES);
  const activeStates = Object.keys(byState).sort();
  const maxPrograms = Math.max(
    ...Object.values(byState).map((s) => s.programCount),
  );

  return (
    <div className="export-page" id="export-root" data-export-ready="true">
      <h1 className="export-title">Curebound Research</h1>
      <div className="export-body">
        <aside className="export-panel">
          {activeStates.map((abbr) => {
            const agg = byState[abbr];
            return (
              <section key={abbr} className="export-state">
                <h3>
                  {agg.name} ({agg.state}) · {agg.programCount} program
                  {agg.programCount === 1 ? "" : "s"}
                </h3>
                {agg.programs.map((p) => (
                  <article key={p.id} className="export-program">
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
                          {partner.name}{" "}
                          <small>({partner.role})</small>
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </aside>

        <div className="export-map-col">
          <div className="export-map-wrap">
            <svg
              className="map"
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="US map of research partnerships by state"
            >
              {Object.entries(STATE_PATHS).map(([abbr, d]) => {
                const count = byState[abbr]?.programCount ?? 0;
                return (
                  <path
                    key={abbr}
                    d={d}
                    fill={fillForCount(count, maxPrograms)}
                  />
                );
              })}
            </svg>
            <div className="export-legend">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
