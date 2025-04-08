import { ProductivityTracker } from "../../types/chrome";

const getproductivityTrackerData = async () =>
  (await chrome.storage.local.get("productivityTracker")).productivityTracker ||
  {};

const setproductivityTrackerData = (productivityTracker: ProductivityTracker) =>
  chrome.storage.local.set({ productivityTracker });

export const updateProductivityTrackerForInBrowserChanges = async (
  url: string
) => {
  let productivityTracker: ProductivityTracker =
    await getproductivityTrackerData();

  const currentActiveWebsite = new URL(url).hostname;

  // were u on any website
  if (productivityTracker.activeWebsite) {
    if (productivityTracker.activeWebsite != currentActiveWebsite) {
      let lastActiveWebsite = productivityTracker.activeWebsite;
      productivityTracker.allWebsites[lastActiveWebsite].duration +=
        Date.now() -
        productivityTracker.allWebsites[lastActiveWebsite].visitTimestamp;
      productivityTracker.activeWebsite = currentActiveWebsite;

      // did we previously visit the website we're on
      if (productivityTracker.allWebsites[currentActiveWebsite]) {
        productivityTracker.allWebsites[currentActiveWebsite].visitTimestamp =
          Date.now();
      } else {
        productivityTracker.allWebsites[currentActiveWebsite] = {
          visitTimestamp: Date.now(),
          duration: 0,
        };
      }
      setproductivityTrackerData(productivityTracker);
    }
  } else {
    productivityTracker = {
      activeWebsite: currentActiveWebsite,
      allWebsites: {
        [currentActiveWebsite]: { visitTimestamp: Date.now(), duration: 0 },
      },
    };
    setproductivityTrackerData(productivityTracker);
  }

  // console.log("productivityTracker", productivityTracker);
};
