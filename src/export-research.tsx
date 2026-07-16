import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ResearchExport } from "./export/ResearchExport";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResearchExport />
  </StrictMode>,
);
