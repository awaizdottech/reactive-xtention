1. Ad Blocker with Custom Filters
   Users should be able to enable/disable the ad blocker.
   Custom filtering: Allow users to add custom rules (e.g., block ads from specific domains).
   Provide an option to view blocked ads count.
2. Productivity Tracker
   Tracks time spent on each website.
   Displays time spent per site in a tabular or graphical format.
   Ability to reset or set daily limits.
3. Smart Note-Taking Tool
   Users can take local notes (specific to the current page).
   Users can take global notes (accessible from any page).
   Notes should be editable and removable.
4. Tab Manager
   Automatically groups open tabs based on categories (e.g., Social Media, Work, News).
   Supports saving and restoring tab sessions.

#TODOS:

- add mutation observer to detect changes in the DOM & update the highest zindex
  old content-script index.ts

```
import { finder } from "@medv/finder";
const SELECTOR_STORAGE_KEY = "selectorsWithURL";

console.log("Content script injected", window.location.origin);

const highlightBox = document.createElement("div");
highlightBox.style.border = "2px solid cyan";
highlightBox.style.position = "absolute";
highlightBox.style.display = "none";
highlightBox.style.pointerEvents = "none";
const tooltipBox = document.createElement("div");
tooltipBox.style.position = "absolute";
tooltipBox.style.background = "black";
tooltipBox.style.color = "white";
tooltipBox.style.padding = "4px 8px";
tooltipBox.style.borderRadius = "4px";
tooltipBox.style.fontSize = "12px";
tooltipBox.style.whiteSpace = "nowrap";
tooltipBox.style.display = "none";
tooltipBox.textContent = "I am tooltip";
const iconBox = document.createElement("div");
iconBox.innerHTML = "⭐";
iconBox.style.position = "absolute";
iconBox.style.cursor = "pointer";
iconBox.style.display = "none";
iconBox.style.background = "white";
iconBox.style.padding = "4px";
iconBox.style.borderRadius = "50%";
iconBox.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

document.body.appendChild(highlightBox);
document.body.appendChild(iconBox);
document.body.appendChild(tooltipBox);

const getHighestZIndexFromTab = (): number => {
  let maxZ = 10;
  document.querySelectorAll("*").forEach((el) => {
    const z = window.getComputedStyle(el).zIndex;
    if (!isNaN(parseInt(z))) {
      maxZ = Math.max(maxZ, parseInt(z));
    }
  });

  return maxZ;
};

const attachTooltip = (
  top: number,
  left: number,
  width: number,
  height: number
) => {
  tooltipBox.style.top = `${top + window.scrollY + height / 2 - 30}px`;
  tooltipBox.style.left = `${left + window.scrollX + width + 20}px`;

  iconBox.style.top = `${top + window.scrollY + height / 2 - 10}px`;
  iconBox.style.left = `${left + window.scrollX + width + 5}px`;
  iconBox.style.display = "block";
  iconBox.onmouseenter = () => {
    tooltipBox.style.display = "block";
  };
  iconBox.onmouseleave = () => {
    tooltipBox.style.display = "none";
  };
};

const attachStoredTooltips = async () => {
  const data = await chrome.storage.local.get(SELECTOR_STORAGE_KEY);
  const selectorsWithURL = data[SELECTOR_STORAGE_KEY] || {};
  const selectors = selectorsWithURL[window.location.href] || [];

  selectors.forEach((selector: string) => {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) {
      const { top, left, width, height } = el.getBoundingClientRect();
      attachTooltip(top, left, width, height);
    }
  });
};

const observer = new MutationObserver(() => {
  attachStoredTooltips();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

attachStoredTooltips();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "calculateHighestZIndex") {
    const highestZ = getHighestZIndexFromTab();
    sendResponse({ zIndex: highestZ });
    return true;
  } else if (message.action == "enableElementSelection") {
    addEventListeners();
  } else if (message.action == "elementSelected") {
    removeEventListeners();
    console.log("Data received on elemetnt selection: ", message);
  }
});

const { zIndex } = await chrome.runtime.sendMessage({
  action: "getHighestZIndex",
  url: window.location.href,
});

if (zIndex !== undefined) {
  const highestZIndex = zIndex + 10;
  console.log("highestZIndex", highestZIndex);

  highlightBox.style.zIndex = highestZIndex.toString();
  iconBox.style.zIndex = highestZIndex.toString();
  tooltipBox.style.zIndex = highestZIndex.toString();
}

const addEventListeners = () => {
  document.addEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.addEventListener("click", clickListenerCallback, { capture: true });
};

const removeEventListeners = () => {
  document.removeEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.removeEventListener("click", clickListenerCallback, {
    capture: true,
  });
};

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
  console.log("click listener attached", window.document);

  highlightBox.style.display = "none";
  console.log(e.target);
  const target = e.composedPath()[0] || e.target;

  if (target instanceof HTMLElement) {
    const { top, left, width, height } = target.getBoundingClientRect();
    attachTooltip(top, left, width, height);
    hookIntersectionObserver(target as Element);
  }

  console.log("Content script: send message to background");
  chrome.runtime.sendMessage({
    action: "elementSelected",
    selector: finder(target as Element),
  });
};

const hookIntersectionObserver = (target: Element) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        iconBox!.style.display = "none";
      } else {
        iconBox!.style.display = "block";
      }
    });
  });

  observer.observe(target);
};

window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    highlightBox.style.display = "none";
  }
});

if (window.top !== window.self) {
  window.document.addEventListener("mouseenter", (e) => {
    window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
    e.stopPropagation();
  });
  window.document.addEventListener("mouseleave", () => {
    highlightBox.style.display = "none";
  });
}
```
