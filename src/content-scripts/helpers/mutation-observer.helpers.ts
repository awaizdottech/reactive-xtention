import { attachStoredTooltips } from "./tooltip.helpers";

const observer = new MutationObserver(() => {
  attachStoredTooltips();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
