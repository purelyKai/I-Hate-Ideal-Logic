// Map options to their corresponding values
const optionValues = {
  option1: "QTCN-HY428", // RSO Payment Authorization
  option2: "NSS5-PR8ZJ", // RSO Credit Card Request
};

export default function fillFormBasedOnOption(selectedOption) {
  // Get the corresponding value for the selected option
  const selectedValue = optionValues[selectedOption];

  if (!selectedValue) {
    console.log("❌ Invalid option selected");
    return;
  }

  // Select the radio button
  const radioButton = document.querySelector(
    `input[type="radio"][value="${selectedValue}"]`
  );
  if (radioButton) {
    radioButton.click();
    console.log("✅ Radio button selected:", selectedValue);
  } else {
    console.log("❌ Radio button not found!");
    return;
  }

  // Wait for the "Next" button to become available
  const observer = new MutationObserver((mutations, observer) => {
    console.log("🔍 Detecting page update...");

    // Try to find the Next button using wildcard ID
    const nextButton = document.querySelector(
      `button[id^="action_"][id$="_next_button"]`
    );

    if (nextButton && !nextButton.disabled) {
      console.log("✅ Next button found, clicking...");

      // Ensure button is visible and interactable
      nextButton.focus();

      // Simulate a user click event
      nextButton.dispatchEvent(new Event("click", { bubbles: true }));

      // Stop observing after clicking
      observer.disconnect();

      // Detect when the next page loads
      waitForNextPage(selectedOption);
    } else {
      console.log("⏳ Next button not ready yet...");
    }
  });
}

function waitForNextPage(selectedOption) {
  const observer = new MutationObserver((mutations, observer) => {
    console.log("🔍 Detecting new page load...");

    if (document.querySelector("form")) {
      // Adjust this selector to detect page change
      observer.disconnect();
      console.log("✅ New page detected!");

      // Now branch based on the original selection
      if (selectedOption === "option1") {
        fillNextPageForRSOPaymentAuthorization();
      } else if (selectedOption === "option2") {
        fillNextPageForRSOCreditCardRequest();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function fillNextPageForRSOPaymentAuthorization() {
  console.log("✅ Filling the second page for RSO Payment Authorization...");
  // Add form-filling logic here for RSO Payment Authorization
}

function fillNextPageForRSOCreditCardRequest() {
  console.log("✅ Filling the second page for RSO Credit Card Request...");
  // Add form-filling logic for RSO Credit Card Request
}
