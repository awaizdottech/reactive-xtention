import ReactDOM from "react-dom/client";
import TooltipManager from "../components/TooltipManager";

export const mountTooltipManager = () => {
  console.log("mountTooltipManager roars");

  const container = document.createElement("div");
  container.id = "tooltip-mount";
  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(<TooltipManager />);
};
