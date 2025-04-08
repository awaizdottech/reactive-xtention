import { ProductivityTracker } from "../types/chrome";

console.log("Background script running");
const ZINDEX_STORAGE_KEY = "highestZIndexMap";
export const SELECTOR_STORAGE_KEY = "selectorsWithURL";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("recevied on BG: ", message, sender);

  const activeTabs = await chrome.tabs.query({ active: true });
  if (message.action === "enableElementSelection") {
    chrome.tabs.sendMessage(activeTabs[0].id!, message);
  } else if (message.action === "elementSelected") {
    const storageData = await chrome.storage.local.get(SELECTOR_STORAGE_KEY);
    const selectorsWithURL = storageData[SELECTOR_STORAGE_KEY] || {};
    console.log("onmessage element selected", message, selectorsWithURL);

    if (selectorsWithURL[activeTabs[0].url!])
      selectorsWithURL[activeTabs[0].url!] = [
        message.selector,
        ...selectorsWithURL[activeTabs[0].url!],
      ];
    else selectorsWithURL[activeTabs[0].url!] = [message.selector];

    chrome.tabs.sendMessage(sender?.tab?.id!, { ...message, selectorsWithURL });
    chrome.storage.local.set({ [SELECTOR_STORAGE_KEY]: selectorsWithURL });
  } else if (message.action === "getHighestZIndex") {
    const storedZindex = await chrome.storage.local.get(ZINDEX_STORAGE_KEY);

    console.log("domo", storedZindex);
    const storedData = storedZindex[ZINDEX_STORAGE_KEY] || {};

    if (storedData[message.url] !== undefined) {
      sendResponse({ zIndex: storedData[message.url] });
      console.log("arigato", storedData[message.url]);
      return true;
    } else {
      const response = await chrome.tabs.sendMessage(sender.tab!.id!, {
        action: "calculateHighestZIndex",
      });

      const highestZ = response?.zIndex ?? 10;
      console.log("arigato", highestZ);
      sendResponse({ zIndex: highestZ });
      storedData[message.url] = highestZ;
      chrome.storage.local.set({ [ZINDEX_STORAGE_KEY]: storedData });
      return true;
    }
  }
});

// triggers when theres changes inside the tab/page
chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (changeInfo.url)
      updateProductivityTrackerForInBrowserChanges(changeInfo.url);
  }
);

// triggers when there's tab change
chrome.tabs.onActivated.addListener(async () => {
  const tabs = await chrome.tabs.query({ active: true });
  updateProductivityTrackerForInBrowserChanges(tabs[0].url!);
});

// triggers when user locks screen
chrome.idle.onStateChanged.addListener((state) => {
  if (state == "locked") {
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId == chrome.windows.WINDOW_ID_NONE) {
  }
});

const getproductivityTrackerData = async () =>
  (await chrome.storage.local.get("productivityTracker")).productivityTracker ||
  {};

const setproductivityTrackerData = (productivityTracker: ProductivityTracker) =>
  chrome.storage.local.set({ productivityTracker });

const updateProductivityTrackerForInBrowserChanges = async (url: string) => {
  let productivityTracker: ProductivityTracker =
    await getproductivityTrackerData();

  const currentActiveWebsite = new URL(url).hostname;

  // were u on any website
  if (productivityTracker.activeWebsite) {
    if (productivityTracker.activeWebsite != currentActiveWebsite) {
      let lastActiveWebsite = productivityTracker.activeWebsite;
      productivityTracker.allWebsites[lastActiveWebsite].duration +=
        Date.now() -
        productivityTracker.allWebsites[lastActiveWebsite].visitTimestamp;
      productivityTracker.activeWebsite = currentActiveWebsite;

      // did we previously visit the website we're on
      if (productivityTracker.allWebsites[currentActiveWebsite]) {
        productivityTracker.allWebsites[currentActiveWebsite].visitTimestamp =
          Date.now();
      } else {
        productivityTracker.allWebsites[currentActiveWebsite] = {
          visitTimestamp: Date.now(),
          duration: 0,
        };
      }
      setproductivityTrackerData(productivityTracker);
    }
  } else {
    productivityTracker = {
      activeWebsite: currentActiveWebsite,
      allWebsites: {
        [currentActiveWebsite]: { visitTimestamp: Date.now(), duration: 0 },
      },
    };
    setproductivityTrackerData(productivityTracker);
  }

  // console.log("productivityTracker", productivityTracker);
};

// chrome.webRequest.onBeforeRequest.addListener(
//   () => ({ cancel: true }),
//   { urls: [] },
//   ["blocking"]
// );

// chrome.alarms.create("keepAliveAndKicking", { periodInMinutes: 4 });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name == "keepAliveAndKicking")
//     console.log("Background script running");
// });
