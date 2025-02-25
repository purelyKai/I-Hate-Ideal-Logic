document.getElementById("start").addEventListener("click", () => {
  const selectedOption = document.getElementById("optionSelect").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // Try sending a message first
    chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        console.log("Content script not found, injecting...");

        // Inject content.js manually
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ["content.js"],
          },
          () => {
            console.log("Injected content script, now sending message...");
            sendMessageToContent(tabId, selectedOption);
          }
        );
      } else {
        // Content script is already running
        sendMessageToContent(tabId, selectedOption);
      }
    });
  });
});

// Function to send the autofill message
function sendMessageToContent(tabId, selectedOption) {
  chrome.tabs.sendMessage(tabId, {
    action: "fillForm",
    option: selectedOption,
  });
}
