console.log("Content script injected");
chrome.runtime.sendMessage({ greeting: "Hello from content!" }, (response) => {
  console.log(response.reply);
});
