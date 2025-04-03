import React from "react";
import { createRoot } from "react-dom/client";

const Sidepanel = () => {
  return <h1>Sidepanel Works!</h1>;
};

// Mount the React component
createRoot(document.getElementById("root") as HTMLElement).render(
  <Sidepanel />
);

// Example: Log something specific to sidepanel
console.log("Sidepanel script running");
