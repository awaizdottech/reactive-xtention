export const enableElementSelection = () => {
  chrome.runtime.sendMessage({ action: "enableElementSelection" });
  window.close();
};
