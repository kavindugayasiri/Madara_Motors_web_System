import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// document.getElementById("root") එකට පස්සේ තිබුණු '!' ලකුණ අයින් කළා
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);