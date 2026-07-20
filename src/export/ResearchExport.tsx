import { useMemo } from "react";
import {
  RESEARCH_INSTITUTIONS,
  RESEARCH_TOTAL,
} from "../data/researchInstitutions";
import { WORLD_VB_H, WORLD_VB_W } from "../data/worldPath";
import worldBase from "../assets/world-base.png";
import "./export.css";

export function ResearchExport() {
  const byRegion = useMemo(() => {
    const map = new Map<string, typeof RESEARCH_INSTITUTIONS>();
    for (const inst of RESEARCH_INSTITUTIONS) {
      const key = inst.r;
      const list = map.get(key);
      if (list) list.push(inst);
      else map.set(key, [inst]);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  return (
    <div className="export-page" id="export-root" data-export-ready="true">
      <h1 className="export-title">
        Curebound Research · {RESEARCH_TOTAL} institutions plotted
      </h1>
      <div className="export-body">
        <aside className="export-panel export-panel-scroll">
          <p className="export-count">
            Plotted {RESEARCH_TOTAL} / {RESEARCH_TOTAL} from
            updatedresearchinstitution.csv
          </p>
          {byRegion.map(([region, items]) => (
            <section key={region} className="export-state">
              <h3>
                {region} · {items.length}
              </h3>
              {items.map((inst) => (
                <article key={inst.id} className="export-program">
                  <div className="pi">{inst.n}</div>
                  <div className="inst">
                    {inst.c}, {inst.r}
                  </div>
                </article>
              ))}
            </section>
          ))}
        </aside>

        <div className="export-map-col">
          <div className="export-map-wrap">
            <div className="export-map-stack research-world-export">
              <img
                className="world-base-img"
                src={worldBase}
                alt=""
                draggable={false}
              />
              <svg
                className="map"
                viewBox={`0 0 ${WORLD_VB_W} ${WORLD_VB_H}`}
                preserveAspectRatio="none"
                role="img"
                aria-label="Global map of Curebound research institutions"
              >
                {RESEARCH_INSTITUTIONS.map((inst) => (
                  <circle
                    key={inst.id}
                    cx={inst.x}
                    cy={inst.y}
                    r="3.2"
                    fill="#f0ff5a"
                    fillOpacity="0.9"
                    stroke="#0a0a0a"
                    strokeWidth="0.5"
                  />
                ))}
              </svg>
            </div>
            <div className="export-legend">
              <span className="item">
                <i className="dot" style={{ background: "#f0ff5a" }} /> One
                point per institution
              </span>
              <span>
                Plotted {RESEARCH_TOTAL} / {RESEARCH_TOTAL}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
