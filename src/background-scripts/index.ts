import {
  elementSelectedHandler,
  enableElementSelectionHandler,
  // getHighestZIndexHandler,
} from "./helpers/message-responders.helpers";

// console.log("Background script running");

chrome.runtime.onMessage.addListener(async (message, sender) => {
  //   console.log("recevied on BG: ", message, sender);
  if (message.action === "enableElementSelection") {
    enableElementSelectionHandler(message);
  } else if (message.action === "elementSelected") {
    elementSelectedHandler(message, sender);
  }
  // else if (message.action === "getHighestZIndex") {
  //     getHighestZIndexHandler(message, sender, sendResponse);
  //   }
});
