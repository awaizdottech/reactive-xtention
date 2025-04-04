import { ProductivityTracker } from "../types/chrome";

console.log("Background script running");
const STORAGE_KEY = "highestZIndexMap";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("recevied on BG: ", message, sender);
  // return true;

  if (message.action === "enableElementSelection") {
    const activeTabs = await chrome.tabs.query({ active: true });
    chrome.tabs.sendMessage(activeTabs[0].id!, message, (response) => {
      sendResponse(response);
      console.log(
        "from bg script this is response after sending to active tab content script",
        response
      );
    });
  } else if (message.action === "elementSelected") {
    chrome.tabs.sendMessage(sender.tab!.id!, message, (response) => {
      sendResponse("it worked!");
      console.log(
        "response recieved from content script on elementSelected - bg",
        response
      );
    });
  } else if (message.action === "getHighestZIndex") {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      console.log("domo", data);
      const storedData = data[STORAGE_KEY] || {};

      if (storedData[message.url] !== undefined) {
        sendResponse({ zIndex: storedData[message.url] });
        console.log("arigato", storedData[message.url]);
      } else {
        chrome.tabs.sendMessage(
          sender.tab!.id!,
          { action: "calculateHighestZIndex" },
          (response) => {
            const highestZ = response?.zIndex ?? 10;
            storedData[message.url] = highestZ;

            chrome.storage.local.set({ [STORAGE_KEY]: storedData }, () => {
              console.log("arigato", highestZ);
              sendResponse({ zIndex: highestZ });
            });
          }
        );
      }
    });
  }

  return true;
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
