console.log("Background script running");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(sender);

  console.log("Message received:", message);
  sendResponse({ reply: "Hi from background!" });
});
