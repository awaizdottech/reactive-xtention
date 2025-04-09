import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import CustomPopper from "../components/CustomPopper";

const TooltipWrapper = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    setAnchorEl(target);
    setOpen(true);
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return <CustomPopper anchorEl={anchorEl} open={open} text="Hello Tooltip" />;
};

const mount = () => {
  const container = document.createElement("div");
  container.id = "tooltip-popper-container";
  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(<TooltipWrapper />);
};

mount();
