import React from "react";
import { createRoot } from "react-dom/client";
import Sidepanel from "./Sidepanel";

// Mount the React component
createRoot(document.getElementById("root") as HTMLElement).render(
  <Sidepanel />
);

// Example: Log something specific to sidepanel
console.log("Sidepanel script running");
