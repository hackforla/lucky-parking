/* istanbul ignore file */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app";
import "@lucky-parking/design-system/theme.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
