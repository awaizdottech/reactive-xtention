import { useEffect, useState } from "react";
import CustomPopper from "./CustomPopper";
import CustomTooltip from "./CustomTooltip";

interface TooltipPopperProps {
  anchor: Element;
}

const TooltipPopper = ({ anchor }: TooltipPopperProps) => {
  const [open, setOpen] = useState(false);
  // console.log(
  //   "TooltipPopper roars",
  //   selector,
  //   window.top !== window.self ? "iframe" : "main"
  // );

  useEffect(() => {
    (() => {
      // console.log(
      //   "tryAttach roars",
      //   selector,
      //   el,
      //   window.top !== window.self ? "iframe" : "main"
      // );

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

      observer.observe(anchor);

      return () => observer.unobserve(anchor);
    })();
  }, []);

  return (
    <CustomPopper anchorEl={anchor as HTMLElement} open={open}>
      <CustomTooltip text="I am Tooltip" />
    </CustomPopper>
  );
};

export default TooltipPopper;
