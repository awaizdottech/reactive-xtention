import { useState, useEffect } from "react";
import type { ChromeTabInfo } from "../types/chrome";
import { getTabsList, goToTab, groupTabs } from ".";

export default function Popup() {
  const [tabs, setTabs] = useState<ChromeTabInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    try {
      setLoading(true);
      setError(null);
      const tabsList = await getTabsList();
      setTabs(tabsList);
    } catch (err) {
      setError("Failed to load tabs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = async (tab: ChromeTabInfo) => {
    try {
      await goToTab(tab.id, tab.windowId);
      window.close(); // Close popup after navigation
    } catch (err) {
      console.error("Failed to navigate to tab:", err);
    }
  };

  const handleGroupTabs = async () => {
    try {
      await groupTabs();
      await loadTabs(); // Refresh tabs list
    } catch (err) {
      console.error("Failed to group tabs:", err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={loadTabs}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>Chrome Docs Manager</h1>
        <button onClick={handleGroupTabs}>Group Tabs</button>
      </div>

      {tabs.length === 0 ? (
        <div>
          <p>No Chrome documentation tabs found.</p>
          <p>Open some docs to see them here!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button onClick={() => handleTabClick(tab)}>
                <h3>{tab.title}</h3>
                <p>{tab.pathname}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
