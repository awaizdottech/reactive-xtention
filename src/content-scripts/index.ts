console.log("Content script injected");
// chrome.runtime.sendMessage({ greeting: "Hello from content!" }, (response) => {
//   console.log(response.reply);
// });

let lasthighlightedElement: HTMLElement;
document.addEventListener("mouseover", (e) => {
  if (e.target && e.target instanceof HTMLElement) {
    // if (e.target.tageName == "IFRAME")
    e.target.style.outline = "2px solid cyan";

    if (lasthighlightedElement) lasthighlightedElement.style.outline = "";
    lasthighlightedElement = e.target;
  }
});

document.addEventListener("click", (e) => {
  console.log(e.target, e.target);
});
