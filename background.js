// Listen for messages from popup.js to ensure content script is loaded
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ensureContentScriptLoaded") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "No active tab" });
        return;
      }

      const tab = tabs[0];

      try {
        // Try to ping the content script first
        chrome.tabs.sendMessage(tab.id, { action: "ping" }, (response) => {
          // If there's an error or no response, the content script isn't loaded
          if (chrome.runtime.lastError || !response) {
            // Inject content script
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["content.js"],
              },
              () => {
                if (chrome.runtime.lastError) {
                  sendResponse({
                    success: false,
                    error:
                      "Failed to inject content script: " +
                      chrome.runtime.lastError.message,
                  });
                } else {
                  sendResponse({ success: true });
                }
              }
            );
          } else {
            // Content script is already loaded
            sendResponse({ success: true });
          }
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });

    return true; // Keep the message channel open for async response
  }
});
