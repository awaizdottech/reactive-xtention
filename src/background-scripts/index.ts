console.log("Background script running");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender);

  console.log("Message received:", message);
  sendResponse({ reply: "Hi from background!" });
});

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
