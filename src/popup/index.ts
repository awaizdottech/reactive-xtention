import type { ChromeTabInfo } from "../types/chrome";

const CHROME_DOC_URLS = [
  "https://developer.chrome.com/docs/webstore/*",
  "https://developer.chrome.com/docs/extensions/*",
];

export const getTabsList = async (): Promise<ChromeTabInfo[]> => {
  try {
    const tabs = await chrome.tabs.query({ url: CHROME_DOC_URLS });
    console.log("tabs", tabs);

    return tabs.map((tab) => ({
      id: tab.id!,
      title: tab.title?.split("-")[0].trim() ?? "Untitled",
      pathname: tab.url ? new URL(tab.url).pathname.slice("/docs".length) : "",
      url: tab.url ?? "",
      windowId: tab.windowId,
    }));
  } catch (error) {
    console.error("Failed to get tabs list:", error);
    throw error;
  }
};

export const goToTab = async (
  tabId: number,
  windowId: number
): Promise<void> => {
  try {
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(windowId, { focused: true });
  } catch (error) {
    console.error("Failed to navigate to tab:", error);
    throw error;
  }
};

export const groupTabs = async (): Promise<void> => {
  try {
    const tabs = await getTabsList();
    const tabIds = tabs.map((tab) => tab.id);

    if (tabIds.length) {
      const group = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(group, {
        title: "DOCS",
        color: "blue",
      });
    }
  } catch (error) {
    console.error("Failed to group tabs:", error);
    throw error;
  }
};
