import { ProductivityTracker } from "../types/chrome";

console.log("Background script running");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log(sender);

  console.log("Message received:", message);
  sendResponse({ reply: "Hi from background!" });
});

// triggers when theres changes inside the tab/page
chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (changeInfo.url)
      updateProductivityTrackerForInBrowserChanges(changeInfo.url);
  }
);

// triggers when there's tab change
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ active: true }, (tabs) => {
    updateProductivityTrackerForInBrowserChanges(tabs[0].url!);
  });
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

  console.log("productivityTracker", productivityTracker);
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
