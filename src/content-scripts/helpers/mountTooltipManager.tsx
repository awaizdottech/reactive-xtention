import ReactDOM from "react-dom/client";
import TooltipManager from "../components/TooltipsManager";

export const mountTooltipManager = () => {
  console.log(
    "mountTooltipManager roars",
    window.top !== window.self ? "iframe" : "main"
  );

  const container = document.createElement("div");
  container.id = "tooltip-mount";
  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(<TooltipManager />);
};
