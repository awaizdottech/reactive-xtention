import {
  elementSelectedResponder,
  enableElementSelectionResponder,
  getHighestZIndexResponder,
} from "./helpers/message-responders.helpers";

console.log("Background script running");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("recevied on BG: ", message, sender);

  if (message.action === "enableElementSelection") {
    enableElementSelectionResponder(message);
  } else if (message.action === "elementSelected") {
    elementSelectedResponder(message, sender);
  } else if (message.action === "getHighestZIndex") {
    getHighestZIndexResponder(message, sender, sendResponse);
  }
});

// // triggers when theres changes inside the tab/page
// chrome.tabs.onUpdated.addListener(
//   (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
//     if (changeInfo.url)
//       updateProductivityTrackerForInBrowserChanges(changeInfo.url);
//   }
// );

// // triggers when there's tab change
// chrome.tabs.onActivated.addListener(async () => {
//   const tabs = await chrome.tabs.query({ active: true });
//   updateProductivityTrackerForInBrowserChanges(tabs[0].url!);
// });

// // triggers when user locks screen
// chrome.idle.onStateChanged.addListener((state) => {
//   if (state == "locked") {
//   }
// });

// chrome.windows.onFocusChanged.addListener((windowId) => {
//   if (windowId == chrome.windows.WINDOW_ID_NONE) {
//   }
// });

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
