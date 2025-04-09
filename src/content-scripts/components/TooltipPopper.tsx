import { useEffect, useState } from "react";
import CustomPopper from "./CustomPopper";
import CustomTooltip from "./CustomTooltip";

interface TooltipPopperProps {
  selector: string;
}

const TooltipPopper = ({ selector }: TooltipPopperProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  // console.log(
  //   "TooltipPopper roars",
  //   selector,
  //   window.top !== window.self ? "iframe" : "main"
  // );

  useEffect(() => {
    (() => {
      const el = document.querySelector(selector);
      // console.log(
      //   "tryAttach roars",
      //   selector,
      //   el,
      //   window.top !== window.self ? "iframe" : "main"
      // );
      if (el instanceof HTMLElement) {
        setAnchorEl(el);
        setOpen(true);

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              setOpen(false);
            } else {
              setOpen(true);
            }
          });
        });

        observer.observe(el);

        return () => observer.unobserve(el);
      }
    })();
  }, []);

  return (
    <CustomPopper anchorEl={anchorEl} open={open}>
      <CustomTooltip text="I am Tooltip" />
    </CustomPopper>
  );
};

export default TooltipPopper;
