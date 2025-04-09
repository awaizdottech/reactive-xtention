// import { iconBox, tooltipBox } from "..";

const SELECTOR_STORAGE_KEY = "selectorsWithURL";

// export const attachStoredTooltips = async () => {
//   const data = await chrome.storage.local.get(SELECTOR_STORAGE_KEY);
//   const selectorsWithURL = data[SELECTOR_STORAGE_KEY] || {};
//   const selectors = selectorsWithURL[window.location.href] || [];

//   selectors.forEach((selector: string) => {
//     const el = document.querySelector(selector);
//     if (el instanceof HTMLElement) {
//       const { top, left, width, height } = el.getBoundingClientRect();
//       attachTooltip(top, left, width, height);
//     }
//   });
// };

// export const attachTooltip = (
//   top: number,
//   left: number,
//   width: number,
//   height: number
// ) => {
//   tooltipBox.style.top = `${top + window.scrollY + height / 2 - 30}px`;
//   tooltipBox.style.left = `${left + window.scrollX + width + 20}px`;

//   iconBox.style.top = `${top + window.scrollY + height / 2 - 10}px`;
//   iconBox.style.left = `${left + window.scrollX + width + 5}px`;
//   iconBox.style.display = "block";
//   iconBox.onmouseenter = () => {
//     tooltipBox.style.display = "block";
//   };
//   iconBox.onmouseleave = () => {
//     tooltipBox.style.display = "none";
//   };
// };

export const fetchSelectors = async () => {
  const data = await chrome.storage.local.get(SELECTOR_STORAGE_KEY);
  const selectorsWithURL = data[SELECTOR_STORAGE_KEY] || {};
  const selectorsForCurrentTab: string[] =
    selectorsWithURL[`${window.location.origin}${window.location.pathname}`] ||
    [];
  if (selectorsForCurrentTab.length > 0) {
    // console.log(
    //   "fetchSelectors roars",
    //   selectorsForCurrentTab,
    //   window.top !== window.self ? "iframe" : "main"
    // );
    return selectorsForCurrentTab;
  }
  return null;
};
