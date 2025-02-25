// Configuration object for form options
const FORM_CONFIG = {
  option1: {
    id: "QTCN-HY428",
    name: "RSO Payment Authorization",
    fillNextPageFn: fillNextPageForRSOPaymentAuthorization,
  },
  option2: {
    id: "NSS5-PR8ZJ",
    name: "RSO Credit Card Request",
    fillNextPageFn: fillNextPageForRSOCreditCardRequest,
  },
};

// Let the extension know the content script is loaded
console.log("✅ Ideal Logic Form Filler content script loaded");

// Main function to handle form filling based on selected option
function fillFormBasedOnOption(selectedOption) {
  const config = FORM_CONFIG[selectedOption];

  if (!config) {
    console.log(`❌ Invalid option selected: ${selectedOption}`);
    return;
  }

  console.log(`🚀 Starting to fill form for: ${config.name}`);

  // Select the radio button
  const radioButton = document.querySelector(
    `input[type="radio"][value="${config.id}"]`
  );

  if (!radioButton) {
    console.log(`❌ Radio button not found for: ${config.name}`);
    return;
  }

  // Click the radio button
  radioButton.click();
  console.log(`✅ Radio button selected: ${config.id}`);

  // Wait for Next button and click it
  waitForElement(
    `button[id^="action_"][id$="_next_button"]:not([disabled])`,
    30000,
    (nextButton) => {
      console.log("✅ Next button found, clicking...");
      nextButton.focus();
      nextButton.dispatchEvent(new Event("click", { bubbles: true }));

      // Wait for next page to load and fill it based on the original option
      waitForElement(
        "form",
        30000,
        () => {
          console.log(`✅ New page detected for ${config.name}!`);
          config.fillNextPageFn();
        },
        () => console.log("❌ Timeout waiting for next page")
      );
    },
    () => console.log("❌ Timeout waiting for Next button")
  );
}

// Reusable function to wait for an element to appear in the DOM
function waitForElement(selector, timeout, successCallback, timeoutCallback) {
  const startTime = Date.now();

  // First check if element already exists
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ Element found immediately: ${selector}`);
    successCallback(element);
    return;
  }

  // If not, set up observer
  console.log(`🔍 Waiting for element: ${selector}`);

  const observer = new MutationObserver(() => {
    const element = document.querySelector(selector);

    if (element) {
      observer.disconnect();
      successCallback(element);
    } else if (timeout && Date.now() - startTime > timeout) {
      observer.disconnect();
      if (timeoutCallback) timeoutCallback();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also set a timeout as a fallback
  if (timeout) {
    setTimeout(() => {
      // Check one more time before giving up
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        successCallback(element);
      } else if (timeoutCallback) {
        observer.disconnect();
        timeoutCallback();
      }
    }, timeout);
  }
}

// Empty placeholder functions for the second page form filling
// These should be implemented with the specific form field interactions
function fillNextPageForRSOPaymentAuthorization() {
  console.log("✅ Filling the second page for RSO Payment Authorization...");
  // Example implementation (customize as needed):
  // fillFormField("vendor_name", "Example Vendor");
  // selectDropdownOption("payment_type", "Check");
}

function fillNextPageForRSOCreditCardRequest() {
  console.log("✅ Filling the second page for RSO Credit Card Request...");
  // Example implementation (customize as needed):
  // fillFormField("card_holder", "John Doe");
  // fillFormField("purpose", "Conference expenses");
}

// Helper functions for form filling on the second page
function fillFormField(fieldId, value) {
  const field =
    document.getElementById(fieldId) ||
    document.querySelector(`[id$="${fieldId}"]`) ||
    document.querySelector(`[name="${fieldId}"]`);

  if (field) {
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    console.log(`✅ Field ${fieldId} filled with: ${value}`);
    return true;
  } else {
    console.log(`❌ Field not found: ${fieldId}`);
    return false;
  }
}

function selectDropdownOption(selectId, optionText) {
  const select =
    document.getElementById(selectId) ||
    document.querySelector(`[id$="${selectId}"]`) ||
    document.querySelector(`[name="${selectId}"]`);

  if (!select) {
    console.log(`❌ Dropdown not found: ${selectId}`);
    return false;
  }

  for (const option of select.options) {
    if (option.text === optionText) {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      console.log(`✅ Selected "${optionText}" in dropdown ${selectId}`);
      return true;
    }
  }

  console.log(`❌ Option "${optionText}" not found in dropdown ${selectId}`);
  return false;
}

function clickButton(buttonText) {
  // Try multiple selectors to find the button
  const button = Array.from(document.querySelectorAll("button")).find(
    (b) =>
      b.textContent.trim() === buttonText ||
      b.innerText.trim() === buttonText ||
      b.value === buttonText
  );

  if (button) {
    button.click();
    console.log(`✅ Clicked button: ${buttonText}`);
    return true;
  } else {
    console.log(`❌ Button not found: ${buttonText}`);
    return false;
  }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`📨 Message received in content script: ${message.action}`);

  if (message.action === "ping") {
    console.log("🏓 Ping received, sending pong");
    sendResponse({ status: "ready" });
    return true; // Keep the message channel open for async response
  }

  if (message.action === "fillForm") {
    console.log(`🏁 Starting form fill for option: ${message.option}`);
    fillFormBasedOnOption(message.option);
    sendResponse({ status: "filling" });
  }

  return true; // Keep the message channel open
});

// Announce when content script is loaded
console.log("✅ Content script fully initialized");
