import { useEffect, useState } from "react";
import { getAnchors } from "../helpers/tooltip.helpers";
import TooltipPopper from "./TooltipPopper";

const TooltipsManager = () => {
  const [anchors, setAnchors] = useState<Element[] | null>(null);
  // console.log(
  //   "TooltipsManager roars",
  //   window.top !== window.self ? "iframe" : "main"
  // );

  useEffect(() => {
    const updateSelectors = async () => {
      const fetchedAnchors = await getAnchors();
      // console.log(
      //   "updateSelectors roars",
      //   fetchedAnchors,
      //   window.top !== window.self ? "iframe" : "main"
      // );
      setAnchors(fetchedAnchors);
    };

    updateSelectors();

    const observer = new MutationObserver(() => {
      updateSelectors();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      // attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return !anchors ? (
    <> "loading..."</>
  ) : (
    <>
      {anchors.map((anchor: Element) => (
        <TooltipPopper anchor={anchor} />
      ))}
    </>
  );
};

export default TooltipsManager;
