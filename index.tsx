/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import global styles
import "./styles/global.css";
import "./styles/App.css";
import "./styles/buttons.css";
import "./styles/forms.css";
import "./styles/Modals.css";
import "./styles/Settings.css";
import "./styles/StatisticsPage.css";
import "./styles/StudentsPage.css";
import "./styles/TimeSlotCell.css";
import "./styles/ToastNotification.css";
import "./styles/WeeklyCalendar.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}
