console.log("Content script injected", window.location.origin);
// chrome.runtime.sendMessage({ greeting: "Hello from content!" }, (response) => {
//   console.log(response.reply);
// });

let lasthighlightedElement: HTMLElement;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(
    "message listener called from content script by ",
    sender,
    "with message ",
    message
  );

  if (message.action == "enableElementSelection") {
    addEventListeners();
    sendResponse("enabled");
  } else if (message.action == "disableElementSelection") {
    removeEventListeners();
    sendResponse("disabled");
  }
});

const addEventListeners = () => {
  document.addEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.addEventListener("click", clickListenerCallback);
};

const removeEventListeners = () => {
  document.removeEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.removeEventListener("click", clickListenerCallback);
};

const mouseMoveListenerCalback = (e: MouseEvent) => {
  const target = e.composedPath()[0] || e.target;

  if (target instanceof HTMLElement) {
    target.style.outline = "2px solid cyan";

    if (lasthighlightedElement && lasthighlightedElement !== target)
      lasthighlightedElement.style.outline = "none";
    lasthighlightedElement = target;
  }
};

const clickListenerCallback = (e: MouseEvent) => {
  console.log(e.target);
  removeEventListeners();
};

window.addEventListener("message", (e) => {
  // console.log("message received: ", e);
  if (e.data.action === "mouseEnteredIframe") {
    lasthighlightedElement.style.outline = "none";
  }
});

if (window.top !== window.self) {
  // window.document.addEventListener("mouseenter", () => {
  //   window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
  // });
  // window.document.addEventListener("mouseleave", () => {
  //   lasthighlightedElement.style.outline = "none";
  // });
}
