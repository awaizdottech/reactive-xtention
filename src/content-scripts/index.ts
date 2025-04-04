console.log("Content script injected", window.location.origin);

const highlightBox = document.createElement("div");
highlightBox.style.border = "2px solid cyan";
highlightBox.style.position = "absolute";
highlightBox.style.display = "none";
highlightBox.style.pointerEvents = "none"; // Prevent interference

document.querySelector("body")?.appendChild(highlightBox);

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

  return true;
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
    const { top, left, width, height } = target.getBoundingClientRect();

    highlightBox.style.top = `${top + window.scrollY}px`;
    highlightBox.style.left = `${left + window.scrollX}px`;
    highlightBox.style.width = `${width}px`;
    highlightBox.style.height = `${height}px`;
    highlightBox.style.display = "block";
  }
};

const clickListenerCallback = (e: MouseEvent) => {
  console.log(e.target);
  removeEventListeners();
};

window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    highlightBox.style.display = "none";
  }
});

if (window.top !== window.self) {
  window.document.addEventListener("mouseenter", () => {
    window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
  });
  window.document.addEventListener("mouseleave", () => {
    highlightBox.style.display = "none";
  });
}
