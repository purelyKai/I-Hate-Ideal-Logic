document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start");
  const optionSelect = document.getElementById("optionSelect");
  const statusElement = document.createElement("div");

  // Add status element to the popup
  statusElement.id = "status";
  statusElement.className = "status-message";
  document.body.appendChild(statusElement);

  // Check if we're on the right page and content script is available
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs.length === 0) {
      statusElement.textContent = "No active tab found";
      startButton.disabled = true;
      return;
    }

    const tab = tabs[0];

    // Check if we're on the right website
    if (!tab.url.includes("apps.ideal-logic.com")) {
      statusElement.textContent =
        "Please navigate to the Ideal Logic website first";
      startButton.disabled = true;
      return;
    }

    // Ensure the content script is loaded
    ensureContentScriptLoaded(tab.id);
  });

  // Function to ensure content script is loaded
  function ensureContentScriptLoaded(tabId) {
    statusElement.textContent = "Preparing...";

    // Send message to background script to ensure content script is loaded
    chrome.runtime.sendMessage(
      {
        action: "ensureContentScriptLoaded",
      },
      (response) => {
        if (chrome.runtime.lastError) {
          statusElement.textContent =
            "Error: " + chrome.runtime.lastError.message;
          return;
        }

        if (!response || !response.success) {
          statusElement.textContent =
            response?.error || "Failed to load content script";
          return;
        }

        // Try to contact the content script directly to confirm it's loaded
        chrome.tabs.sendMessage(tabId, { action: "ping" }, (pingResponse) => {
          if (chrome.runtime.lastError || !pingResponse) {
            statusElement.textContent =
              "Content script not ready. Please refresh the page.";
            return;
          }

          statusElement.textContent =
            "Ready! Select an option and click Start.";
        });
      }
    );
  }

  // Start button click handler
  startButton.addEventListener("click", () => {
    const selectedOption = optionSelect.value;

    // Update UI
    statusElement.textContent = "Working...";
    startButton.disabled = true;

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        statusElement.textContent = "No active tab found";
        startButton.disabled = false;
        return;
      }

      const tab = tabs[0];

      // Check that we're on the right website
      if (!tab.url.includes("apps.ideal-logic.com")) {
        statusElement.textContent =
          "Please navigate to the Ideal Logic website first";
        startButton.disabled = false;
        return;
      }

      // Send the fill form message
      chrome.tabs.sendMessage(
        tab.id,
        { action: "fillForm", option: selectedOption },
        (response) => {
          if (chrome.runtime.lastError) {
            statusElement.textContent =
              "Error: Content script not responding. Try refreshing the page.";
            console.error(chrome.runtime.lastError);
          } else if (response && response.status === "filling") {
            statusElement.textContent = "Form filling in progress!";
          } else {
            statusElement.textContent = "Unknown response from content script";
          }

          // Re-enable button after a short delay
          setTimeout(() => {
            startButton.disabled = false;
          }, 1000);
        }
      );
    });
  });
});
