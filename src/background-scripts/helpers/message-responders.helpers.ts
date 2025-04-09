const SELECTOR_STORAGE_KEY = "selectorsWithURL";
// const ZINDEX_STORAGE_KEY = "highestZIndexMap";

export const enableElementSelectionResponder = async (message: any) => {
  const activeTabs = await chrome.tabs.query({ active: true });
  chrome.tabs.sendMessage(activeTabs[0].id!, message);
};

export const elementSelectedResponder = async (
  message: any,
  sender: chrome.runtime.MessageSender
) => {
  const activeTabs = await chrome.tabs.query({ active: true });
  const activeTabURL = new URL(activeTabs[0].url!);
  const storageData = await chrome.storage.local.get(SELECTOR_STORAGE_KEY);
  const selectorsWithURL = storageData[SELECTOR_STORAGE_KEY] || {};
  console.log("onmessage element selected", message, selectorsWithURL);

  let currentTabSelectors =
    selectorsWithURL[`${activeTabURL.origin}${activeTabURL.pathname}`];
  if (currentTabSelectors) {
    if (!currentTabSelectors.includes(message.selector)) {
      currentTabSelectors = [message.selector, ...currentTabSelectors];
    }
  } else currentTabSelectors = [message.selector];

  chrome.tabs.sendMessage(sender?.tab?.id!, message);

  chrome.storage.local.set({
    [SELECTOR_STORAGE_KEY]: {
      ...selectorsWithURL,
      [`${activeTabURL.origin}${activeTabURL.pathname}`]: currentTabSelectors,
    },
  });
};

// export const getHighestZIndexResponder = async (
//   message: any,
//   sender: chrome.runtime.MessageSender,
//   sendResponse: (response?: any) => void
// ) => {
//   const storedZindex = await chrome.storage.local.get(ZINDEX_STORAGE_KEY);

//   console.log("domo", storedZindex);
//   const storedData = storedZindex[ZINDEX_STORAGE_KEY] || {};

//   if (storedData[message.url] !== undefined) {
//     sendResponse({ zIndex: storedData[message.url] });
//     console.log("arigato", storedData[message.url]);
//     return true;
//   } else {
//     const response = await chrome.tabs.sendMessage(sender.tab!.id!, {
//       action: "calculateHighestZIndex",
//     });

//     const highestZ = response?.zIndex ?? 10;
//     console.log("arigato", highestZ);
//     sendResponse({ zIndex: highestZ });
//     storedData[message.url] = highestZ;
//     chrome.storage.local.set({ [ZINDEX_STORAGE_KEY]: storedData });
//     return true;
//   }
// };
