import type { ChromeTabInfo } from "../types/chrome";

export const enableElementSelection = () => {
  chrome.runtime.sendMessage({ action: "enableElementSelection" }, (response) =>
    console.log(response)
  );
};

export const disableElementSelection = () =>
  chrome.runtime.sendMessage(
    { action: "disableElementSelection" },
    (response) => response
  );

const CHROME_DOC_URLS = [
  "https://developer.chrome.com/docs/webstore/*",
  "https://developer.chrome.com/docs/extensions/*",
];

export const getTabsList = async (): Promise<ChromeTabInfo[]> => {
  const tabs = await chrome.tabs.query({ url: CHROME_DOC_URLS });
  console.log("tabs", tabs);

  return tabs.map((tab) => ({
    id: tab.id!,
    title: tab.title?.split("-")[0].trim() ?? "Untitled",
    pathname: tab.url ? new URL(tab.url).pathname.slice("/docs".length) : "",
    url: tab.url ?? "",
    windowId: tab.windowId,
  }));
};

export const goToTab = (tabId: number, windowId: number) => {
  chrome.tabs.update(tabId, { active: true });
  chrome.windows.update(windowId, { focused: true });
  window.close();
};

export const groupTabs = async (): Promise<void> => {
  const tabs = await getTabsList();
  const tabIds = tabs.map((tab) => tab.id);

  if (tabIds.length) {
    const group = await chrome.tabs.group({ tabIds });
    chrome.tabGroups.update(group, {
      title: "DOCS",
      color: "blue",
    });
  }
};
