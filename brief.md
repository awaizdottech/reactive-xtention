# **Types of Scripts in Chrome Extensions (Manifest V3)**

## **1. Content Scripts**

**What they are**: JavaScript files that run in the context of web pages but in a separate, isolated world.

**Where they run**: Inside the DOM of the page (can read/write the DOM) but cannot directly touch the page’s JavaScript environment.

**Functionalities**:

- Read and modify the page’s HTML and CSS.
- Listen to page events (clicks, inputs, DOM changes).
- Inject additional scripts or styles into the page.
- Extract data from the page.
- Communicate with the background service worker for data storage or API calls.

**Limitations**:

- Cannot directly call page JS variables/functions (only via injected `<script>` tags).
- Cannot access most Chrome APIs (`chrome.tabs`, `chrome.bookmarks`, etc.).
- Can use only specific APIs: `chrome.runtime`, `chrome.storage`, `chrome.i18n`, etc.
- Cannot access cross-origin iframes unless declared in `manifest.json` (`host_permissions` + `"all_frames": true`).
- Reloads when the page reloads.

**Communication**:

- **To Background**: `chrome.runtime.sendMessage()`
- **From Background**: `chrome.runtime.onMessage.addListener()`
- **To Popup / Side Panel**: Must go through background service worker.

---

## **2. Background Service Workers**

**What they are**: Event-driven scripts that handle extension-wide logic in the background.
In MV3, they replace MV2’s persistent background pages.

**Where they run**: In a separate worker thread with no DOM.

**Functionalities**:

- Listen to browser events (tabs, bookmarks, alarms, network events).
- Maintain extension-wide state (via `chrome.storage` or IndexedDB).
- Coordinate communication between content scripts, popup, and side panel.
- Perform network requests, manage declarative rules, intercept web requests.
- Act as the **central message hub** for all contexts.

**Limitations**:

- No access to `document` or `window`.
- Unloaded when idle — no persistent in-memory state.
- Must use async storage (like `chrome.storage`) to persist data.
- Cannot directly manipulate a web page’s DOM.

**Communication**:

- **To Content Scripts**: `chrome.tabs.sendMessage(tabId, message)`
- **From Content Scripts**: `chrome.runtime.onMessage.addListener()`
- **To Popup / Side Panel**: `chrome.runtime.sendMessage()` or `chrome.runtime.connect()`

---

## **3. Popup Scripts**

**What they are**: Scripts tied to the extension’s popup HTML page (shown when the toolbar icon is clicked).

**Where they run**: In the popup’s DOM context.

**Functionalities**:

- Render UI for quick user interactions.
- Fetch and display data from background or storage.
- Allow users to change settings or trigger extension actions.
- Use Chrome APIs (`chrome.runtime`, `chrome.storage`, etc.).

**Limitations**:

- Runs only when popup is open.
- Automatically unloaded when popup closes.
- Cannot directly access the web page DOM.
- Cannot directly access content scripts — must go through background.

**Communication**:

- **To Background**: `chrome.runtime.sendMessage()` or `chrome.runtime.connect()`
- **From Background**: `chrome.runtime.onMessage.addListener()`
- **To Content Scripts**: Indirect via background.

---

## **4. Side Panel Scripts**

**What they are**: Scripts tied to the extension’s side panel (persistent panel shown alongside a tab).

**Where they run**: In the side panel’s DOM context.

**Functionalities**:

- Provide a persistent UI alongside browsing.
- Show tools, dashboards, or live data.
- Access extension storage and APIs.
- Communicate with background service worker.

**Limitations**:

- Only active when the side panel is open.
- Cannot directly access web page DOM.
- Must communicate with content scripts via background.

**Communication**:

- **To Background**: `chrome.runtime.sendMessage()` or `chrome.runtime.connect()`
- **From Background**: `chrome.runtime.onMessage.addListener()`
- **To Content Scripts**: Indirect via background.

---

## **Communication Flow (MV3)**

```
           ┌──────────────────────────┐
           │         Web Page         │
           └───────────▲──────────────┘
                       │
            (DOM Access / CSS Inject)
                       │
           ┌───────────▼─────────────┐
           │     Content Script      │
           └───────────▲─────────────┘
                       │ Message Passing
                       │
           ┌───────────▼──────────────┐
           │ Background Service Worker│
           └───────▲─────────▲────────┘
                   │         │
                   │         │
      Message Passing   Message Passing
                   │         │
      ┌────────────▼───┐ ┌───▼──────────────┐
      │ Popup Script   │ │ Side Panel Script│
      └────────────────┘ └──────────────────┘
```

---

## **Communication Patterns**

### **1. Content Script ↔ Background**

```js
// Content Script → Background
chrome.runtime.sendMessage({ action: "saveData", data: pageData });

// Background → Content Script
chrome.tabs.sendMessage(tabId, { action: "updateUI", data: newData });
```

---

### **2. Popup / Side Panel ↔ Background**

```js
// Popup → Background
chrome.runtime.sendMessage({ action: "getData" }, (response) => {
  console.log(response);
});

// Background → Popup
chrome.runtime.sendMessage({ action: "dataUpdated", data: newData });
```

---

### **3. Content Script ↔ Popup / Side Panel**

```js
// Indirect via Background
// Content Script → Background → Popup
chrome.runtime.sendMessage({ action: "notifyPopup", data: pageData });
```

---

## **Real-World Example: Element Picker Extension**

```js
// Content Script detects element click
document.addEventListener("click", (e) => {
  chrome.runtime.sendMessage({
    action: "elementClicked",
    element: e.target.outerHTML,
  });
});

// Background stores the element
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "elementClicked") {
    chrome.storage.local.set({ lastElement: message.element });
  }
});

// Popup displays stored element
chrome.storage.local.get("lastElement").then((result) => {
  document.getElementById("element-display").textContent = result.lastElement;
});
```

---

## **Key Limitations & Considerations**

1. **Context Isolation**

   - Content scripts run in a separate JS environment from the page.
   - Must inject scripts to interact with page variables.

2. **Messaging is Asynchronous**

   - Messages may fail if the recipient context is unloaded.
   - Always handle `chrome.runtime.lastError`.

3. **Lifecycle Management**

   - Background service workers unload when idle.
   - Content scripts reload with their page.
   - Popups/side panels unload when closed.

4. **Security Restrictions**

   - Limited API access from content scripts.
   - Cross-origin access must be declared in `manifest.json`.
   - Must follow MV3 CSP rules (no inline JS unless via `unsafe-inline` in HTML).

---

## **Best Practices**

1. **Use Background Service Worker as the Communication Hub**.
2. **Store Persistent Data in `chrome.storage` or IndexedDB** — never rely on in-memory background variables.
3. **Always Handle Errors in Messaging**:

   ```js
   chrome.runtime.sendMessage(msg, (response) => {
     if (chrome.runtime.lastError) {
       console.warn("Message failed:", chrome.runtime.lastError.message);
     }
   });
   ```

4. **Minimize Message Frequency** — batch updates where possible.
5. **Lazy Inject Content Scripts** only into pages where they’re needed.
6. **Use `chrome.runtime.connect()` for Persistent Channels** when streaming data.
