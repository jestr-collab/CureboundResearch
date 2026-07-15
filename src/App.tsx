import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import { DonorZipMap } from "./components/DonorZipMap";
import { ResearchMap } from "./components/ResearchMap";

type WidgetId = "research" | "donors";

function Widget({
  id,
  title,
  subtitle,
  fullscreen,
  onToggleFullscreen,
  children,
}: {
  id: WidgetId;
  title: string;
  subtitle: string;
  fullscreen: WidgetId | null;
  onToggleFullscreen: (id: WidgetId) => void;
  children: ReactNode;
}) {
  const isFullscreen = fullscreen === id;
  if (fullscreen && !isFullscreen) return null;

  return (
    <section className={`widget${isFullscreen ? " fullscreen" : ""}`}>
      <div className="widget-head">
        <h2>{title}</h2>
        <div className="widget-actions">
          <span>{subtitle}</span>
          <button
            type="button"
            className="fs-btn"
            onClick={() => onToggleFullscreen(id)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>
      <div className="widget-body">{children}</div>
    </section>
  );
}

export default function App() {
  const [fullscreen, setFullscreen] = useState<WidgetId | null>(null);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  function toggleFullscreen(id: WidgetId) {
    setFullscreen((prev) => (prev === id ? null : id));
  }

  return (
    <div className={`page${fullscreen ? " has-fs" : ""}`}>
      {!fullscreen ? (
        <header className="header">
          <h1>
            Curebound Research: A National Footprint Built on San Diego Science
          </h1>
          <p className="sub">
            Research partnerships and donor accounts side by side
          </p>
        </header>
      ) : null}

      <div className={`widgets${fullscreen ? " fs-mode" : ""}`}>
        <Widget
          id="research"
          title="Curebound Research"
          subtitle="Programs by state"
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        >
          <ResearchMap />
        </Widget>

        <Widget
          id="donors"
          title="Donor accounts by ZIP"
          subtitle="One point per account"
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        >
          <DonorZipMap />
        </Widget>
      </div>
    </div>
  );
}
