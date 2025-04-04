console.log("Content script injected", window.location.origin);

const getHighestZIndexFromTab = (): number => {
  let maxZ = 10;
  document.querySelectorAll("*").forEach((el) => {
    const z = window.getComputedStyle(el).zIndex;
    if (!isNaN(parseInt(z))) {
      maxZ = Math.max(maxZ, parseInt(z));
    }
  });

  return maxZ;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "calculateHighestZIndex") {
    const highestZ = getHighestZIndexFromTab();
    sendResponse({ zIndex: highestZ });
  } else if (message.action == "enableElementSelection") {
    addEventListeners();
    sendResponse("enabled");
  } else if (message.action == "elementSelected") {
    removeEventListeners();
    sendResponse("elementSelected");
  }
  return true;
});

chrome.runtime.sendMessage(
  { action: "getHighestZIndex", url: window.location.href },
  (response) => {
    if (response?.zIndex !== undefined) {
      const highestZIndex = response.zIndex + 10;
      console.log("highestZIndex", highestZIndex);

      highlightBox.style.zIndex = highestZIndex.toString();
      iconBox.style.zIndex = highestZIndex.toString();
      tooltipBox.style.zIndex = highestZIndex.toString();
    }
  }
);

const highlightBox = document.createElement("div");
highlightBox.style.border = "2px solid cyan";
highlightBox.style.position = "absolute";
highlightBox.style.display = "none";
highlightBox.style.pointerEvents = "none";

const tooltipBox = document.createElement("div");
tooltipBox.style.position = "absolute";
tooltipBox.style.background = "black";
tooltipBox.style.color = "white";
tooltipBox.style.padding = "4px 8px";
tooltipBox.style.borderRadius = "4px";
tooltipBox.style.fontSize = "12px";
tooltipBox.style.whiteSpace = "nowrap";
tooltipBox.style.display = "none";
tooltipBox.textContent = "I am tooltip";

const iconBox = document.createElement("div");
iconBox.innerHTML = "⭐";
iconBox.style.position = "absolute";
iconBox.style.cursor = "pointer";
iconBox.style.display = "none";
iconBox.style.background = "white";
iconBox.style.padding = "4px";
iconBox.style.borderRadius = "50%";
iconBox.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

document.body.appendChild(iconBox);
document.body.appendChild(tooltipBox);
document.body.appendChild(highlightBox);

const addEventListeners = () => {
  document.addEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.addEventListener("click", clickListenerCallback, { capture: true });
};

const removeEventListeners = () => {
  document.removeEventListener("mousemove", mouseMoveListenerCalback, {
    capture: true,
  });
  document.removeEventListener("click", clickListenerCallback, {
    capture: true,
  });
};

const mouseMoveListenerCalback = async (e: MouseEvent) => {
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

const clickListenerCallback = async (e: MouseEvent) => {
  console.log("click listener attached", window.document);

  highlightBox.style.display = "none";
  console.log(e.target);
  const target = e.composedPath()[0] || e.target;

  if (target instanceof HTMLElement) {
    const { top, left, width, height } = target.getBoundingClientRect();

    iconBox.style.top = `${top + window.scrollY + height / 2 - 10}px`;
    iconBox.style.left = `${left + window.scrollX + width + 5}px`;
    iconBox.style.display = "block";

    tooltipBox.style.top = `${top + window.scrollY + height / 2 - 30}px`;
    tooltipBox.style.left = `${left + window.scrollX + width + 20}px`;

    iconBox.onmouseenter = () => {
      tooltipBox.style.display = "block";
    };
    iconBox.onmouseleave = () => {
      tooltipBox.style.display = "none";
    };
  }

  removeEventListeners();
  console.log("Content script: send message to background");
  chrome.runtime.sendMessage({ action: "elementSelected" }, (response) => {
    console.log(
      "response recieved from bg script on elementSelected - content script",
      response
    );
  });
};

window.addEventListener("message", (e) => {
  if (e.data.action === "mouseEnteredIframe") {
    highlightBox.style.display = "none";
  }
});

if (window.top !== window.self) {
  window.document.addEventListener("mouseenter", (e) => {
    window.parent.postMessage({ action: "mouseEnteredIframe" }, "*");
    e.stopPropagation();
  });
  window.document.addEventListener("mouseleave", () => {
    highlightBox.style.display = "none";
  });
}

const findUniqueSelector = () => {
  // This function is a wrapper for all the functions to handle errors
  const makeSafe = function (fn: any) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (error) {
        console.error("DOM Analysis error: ", error);
      }
    };
  };

  // This function will return all the elements found in given root
  const getAllElements = makeSafe((root: any) => {
    return root.querySelectorAll("*");
  });

  let crossOriginCount = 1;
  // This function will return URL location of the given element/root
  const getIFrameOrigin = (element: any) => {
    let origin = "";
    try {
      origin = element.contentWindow && element.contentWindow.location.href;
    } catch (e) {
      origin = `Cross Origin ${crossOriginCount}`;
      crossOriginCount++;
    }
    return origin;
  };

  // This function will return if the element is cross origin element or not
  const isCrossOriginFrame = makeSafe((element: any) => {
    let isCrossOrigin = false;
    try {
      const origin =
        element.contentWindow && element.contentWindow.location.origin;
      isCrossOrigin = window.top!.location.origin !== origin;
    } catch (e) {
      isCrossOrigin = true;
    }
    return isCrossOrigin;
  });

  // This function will find iframe and elements inside it
  const findIFrame = makeSafe((tag: any, element: any, elementsOutput: any) => {
    if (tag === "iframe") {
      const origin = getIFrameOrigin(element);
      if (!elementsOutput.iframes) {
        elementsOutput.iframes = {};
      }
      if (!elementsOutput.iframes[origin]) {
        elementsOutput.iframes[origin] = {
          isCrossOrigin: isCrossOriginFrame(element),
        };
        const frameElements = getAllElements(
          element.contentDocument && element.contentDocument
        );
        if (frameElements && frameElements.length) {
          startDomAnalysis(frameElements, elementsOutput.iframes[origin]);
        }
      }
    }
  });

  // This function will find all the attributes of a given element
  const findAttributes = makeSafe((element: any, elementsOutput: any) => {
    for (const j = 0; j < (element.attributes || []).length; j++) {
      const attribute = element.attributes[j];
      if (!elementsOutput.attributes) {
        elementsOutput.attributes = {};
      }
      if (!elementsOutput.attributes[attribute.name]) {
        elementsOutput.attributes[attribute.name] = {};
      }
      if (!elementsOutput.attributes[attribute.name][attribute.value]) {
        elementsOutput.attributes[attribute.name][attribute.value] = 0;
      }
      elementsOutput.attributes[attribute.name][attribute.value]++;
    }
  });

  // This function will find shadow roots and it's elements ofr given element
  const findShadowRoots = makeSafe(
    (tag: any, element: any, elementsOutput: any) => {
      if (element && element.shadowRoot instanceof DocumentFragment) {
        if (!elementsOutput.shadowRoots) {
          elementsOutput.shadowRoots = {};
        }
        if (!elementsOutput.shadowRoots[tag]) {
          elementsOutput.shadowRoots[tag] = {};
          const shadowRootElements = getAllElements(element.shadowRoot);
          if (shadowRootElements && shadowRootElements.length) {
            startDomAnalysis(
              shadowRootElements,
              elementsOutput.shadowRoots[tag]
            );
          }
        }
      }
    }
  );

  // This function will find and set max z-index
  const findMaxZIndex = makeSafe((element: any, elementsOutput: any) => {
    const styles = window.getComputedStyle(element);
    const zIndex = +(styles && styles.zIndex) || 0;
    if (zIndex) {
      if (!elementsOutput.maxZIndex) {
        elementsOutput.maxZIndex = 0;
      }
      if (zIndex > elementsOutput.maxZIndex) {
        elementsOutput.maxZIndex = zIndex;
      }
    }
  });

  // This function is the main function which will do the DOM analysis
  const startDomAnalysis = makeSafe((elements: any, elementsOutput: any) => {
    if (!elementsOutput) {
      elementsOutput = {};
    }
    for (const i = 0; i < (elements || []).length; i++) {
      const element = elements[i];
      if (!element) {
        continue;
      }

      // Checking for tag name
      const tag = (element.tagName || "").toLowerCase();
      if (!elementsOutput.tags) {
        elementsOutput.tags = {};
      }
      if (!elementsOutput.tags[tag]) {
        elementsOutput.tags[tag] = 0;
      }
      elementsOutput.tags[tag]++;

      // Checking for attributes like class, id, etc.,
      findAttributes(element, elementsOutput);

      // Checking for max z-index
      findMaxZIndex(element, elementsOutput);

      // Checking for iFrames
      findIFrame(tag, element, elementsOutput);

      // Checking for shadow roots
      findShadowRoots(tag, element, elementsOutput);
    }
    return elementsOutput;
  });

  const allElements = getAllElements(document);
  const domAnalysis = startDomAnalysis(allElements);

  console.log("String", JSON.stringify(domAnalysis));
};
