import { useEffect, useState } from "react";
import CustomPopper from "./CustomPopper";
import { fetchSelector } from "../helpers/tooltip.helpers";
import CustomTooltip from "./Tooltip";

const TooltipManager = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selector, setSelector] = useState<string | null>(null);
  console.log("TooltipManager roars");

  useEffect(() => {
    (async () => {
      setSelector(await fetchSelector());
    })();
  }, []);

  useEffect(() => {
    if (!selector) return;

    const tryAttach = () => {
      const el = document.querySelector(selector);
      console.log("tryAttach roars", selector, el);
      if (el instanceof HTMLElement) {
        setAnchorEl(el);
        setOpen(true);
      }
    };

    tryAttach();

    const observer = new MutationObserver(() => {
      tryAttach();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [selector]);

  return (
    <CustomPopper anchorEl={anchorEl} open={open}>
      <CustomTooltip text="Restored Tooltip" />
    </CustomPopper>
  );
};

export default TooltipManager;
