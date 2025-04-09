import {
  // elementSelectedResponder,
  enableElementSelectionResponder,
  // getHighestZIndexResponder,
} from "./helpers/message-responders.helpers";

// console.log("Background script running");

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  //   console.log("recevied on BG: ", message, sender);
  if (message.action === "enableElementSelection") {
    enableElementSelectionResponder(message);
  }
  // else if (message.action === "elementSelected") {
  //     elementSelectedResponder(message, sender);
  //   } else if (message.action === "getHighestZIndex") {
  //     getHighestZIndexResponder(message, sender, sendResponse);
  //   }
});
