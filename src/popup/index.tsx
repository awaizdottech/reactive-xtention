import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";

// Mount the React component
const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Popup />);

// Example: Send a message to background script
// chrome.runtime.sendMessage({ from: "popup", message: "Hello!" }, (response) => {
//   console.log("Response from background:", response);
// });
