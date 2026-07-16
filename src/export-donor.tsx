import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DonorExport } from "./export/DonorExport";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DonorExport />
  </StrictMode>,
);
