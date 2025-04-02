import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Popup />);
