// import { finder } from "@medv/finder";
import {
  highlightBox,
  // iconBox
} from "..";
import { mountTooltipManager } from "./mountTooltipManager";
// import { hookIntersectionObserver } from "./intersection-observer.helpers";
// import { attachTooltip } from "./tooltip.helpers";

export const addEventListeners = () => {
  document.addEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.addEventListener("click", clickListenerCallback, { capture: true });
};

// export const removeEventListeners = () => {
//   document.removeEventListener("mousemove", mouseMoveListenerCalback, {
//     capture: true,
//   });
//   document.removeEventListener("click", clickListenerCallback, {
//     capture: true,
//   });
// };

const mouseMoveListenerCalback = async (e: MouseEvent) => {
  const target = e.composedPath()[0] || e.target;

  if (target instanceof HTMLElement) {
    const { top, left, width, height } = target.getBoundingClientRect();
    highlightBox.style.top = `${top + window.scrollY}px`;
    highlightBox.style.left = `${left + window.scrollX}px`;
    highlightBox.style.width = `${width}px`;
    highlightBox.style.height = `${height}px`;
    highlightBox.style.display = "block";
  }
};

const clickListenerCallback = async (e: MouseEvent) => {
  highlightBox.style.display = "none";
  console.log("selected element", e.target);
  mountTooltipManager();
  // const target = e.composedPath()[0] || e.target;

  // if (target instanceof HTMLElement) {
  //   const { top, left, width, height } = target.getBoundingClientRect();
  //   attachTooltip(top, left, width, height);
  // hookIntersectionObserver(target as Element, iconBox);
  // }

  // console.log("Content script: send message to background");
  // chrome.runtime.sendMessage({
  //   action: "elementSelected",
  //   selector: finder(target as Element),
  // });
};
