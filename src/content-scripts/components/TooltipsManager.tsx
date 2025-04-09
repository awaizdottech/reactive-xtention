import { useEffect, useState } from "react";
import { fetchSelectors } from "../helpers/tooltip.helpers";
import TooltipPopper from "./TooltipPopper";

const TooltipsManager = () => {
  const [selectors, setSelectors] = useState<string[] | null>(null);
  console.log(
    "TooltipsManager roars",
    window.top !== window.self ? "iframe" : "main"
  );

  useEffect(() => {
    const updateSelectors = async () => {
      const fetchedSelectors = await fetchSelectors();
      console.log(
        "updateSelectors roars",
        fetchedSelectors,
        window.top !== window.self ? "iframe" : "main"
      );
      setSelectors(fetchedSelectors);
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

  return !selectors ? (
    <> "loading..."</>
  ) : (
    <>
      {selectors.map((selector: string) => (
        <TooltipPopper selector={selector} />
      ))}
    </>
  );
};

export default TooltipsManager;
