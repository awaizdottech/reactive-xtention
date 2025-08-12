// import { attachStoredTooltips } from "./helpers/tooltip.helpers";
// import { getHighestZIndexFromTab } from "./helpers/z-index.helpers";
import {
  addEventListeners,
  removeEventListeners,
} from "./helpers/event-listeners.helpers";
import { mountTooltipManager } from "./helpers/mountTooltipManager";

// console.log("Content script injected", window.location.origin);

export const highlightBox = document.createElement("div");
highlightBox.style.border = "2px solid cyan";
highlightBox.style.position = "absolute";
highlightBox.style.display = "none";
highlightBox.style.pointerEvents = "none";
document.body.appendChild(highlightBox);

// export const tooltipBox = document.createElement("div");
// tooltipBox.style.position = "absolute";
// tooltipBox.style.background = "black";
// tooltipBox.style.color = "white";
// tooltipBox.style.padding = "4px 8px";
// tooltipBox.style.borderRadius = "4px";
// tooltipBox.style.fontSize = "12px";
// tooltipBox.style.whiteSpace = "nowrap";
// tooltipBox.style.display = "none";
// tooltipBox.textContent = "I am tooltip";

// export const iconBox = document.createElement("div");
// iconBox.innerHTML = "⭐";
// iconBox.style.position = "absolute";
// iconBox.style.cursor = "pointer";
// iconBox.style.display = "none";
// iconBox.style.background = "white";
// iconBox.style.padding = "4px";
// iconBox.style.borderRadius = "50%";
// iconBox.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

// document.body.appendChild(iconBox);
// document.body.appendChild(tooltipBox);

// attachStoredTooltips();

chrome.runtime.onMessage.addListener((message) => {
  //   if (message.action === "calculateHighestZIndex") {
  //     const highestZ = getHighestZIndexFromTab();
  //     sendResponse({ zIndex: highestZ });
  //     return true;
  //   } else
  if (message.action == "enableElementSelection") addEventListeners();
  else if (message.action == "elementSelected") removeEventListeners();
});

const SELECTOR_STORAGE_KEY = "selectorsWithURL";

// const { zIndex } = await chrome.runtime.sendMessage({
//   action: "getHighestZIndex",
//   url: window.location.href,
// });

// if (zIndex !== undefined) {
//   const highestZIndex = zIndex + 10;
//   console.log("highestZIndex", highestZIndex);

//   highlightBox.style.zIndex = highestZIndex.toString();
//   iconBox.style.zIndex = highestZIndex.toString();
//   tooltipBox.style.zIndex = highestZIndex.toString();
// }

window.addEventListener(
  "message",
  (e) => {
    if (e.data.action === "mouseEnteredIframe") {
      highlightBox.style.display = "none";
    } else {
      console.log("coming from iframes", e.data);
      console.log("context", window.document);

      const senderWindow = e.source as Window;
      console.log("senderWindow", senderWindow);

      // Find the iframe whose contentWindow matches the sender
      const matchedIframe = Array.from(
        document.querySelectorAll("iframe")
      ).find((iframe) => {
        console.log("iframe", iframe);

        iframe.contentWindow === senderWindow;
      });

      if (!matchedIframe) {
        console.warn("Iframe source not found for received message.");
        return;
      }

      const iframeRect = matchedIframe.getBoundingClientRect();
      console.log(iframeRect);

      // const targetRect = e.data.payload.rect;

      // const absoluteTop = iframeRect.top + targetRect.top;
      // const absoluteLeft = iframeRect.left + targetRect.left;

      // Now place your tooltip here:
      // showTooltipAt(absoluteLeft, absoluteTop);
    }
  },
  { capture: true }
);

if (window.top !== window.self) {
  // iframes
  window.document.addEventListener(
    "mouseenter",
    (e) => {
      window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
      e.stopPropagation();
    },
    { capture: true }
  );

  window.document.addEventListener(
    "mouseleave",
    () => {
      highlightBox.style.display = "none";
    },
    { capture: true }
  );
} else {
  // main window
  mountTooltipManager();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    const changed = changes[SELECTOR_STORAGE_KEY];
    if (changed) {
      const currentTabKey = `${window.location.origin}${window.location.pathname}`;
      if (changed.oldValue[currentTabKey] !== changed.newValue[currentTabKey])
        mountTooltipManager();
    }
  });
}
