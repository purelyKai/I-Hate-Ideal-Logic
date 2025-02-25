document.getElementById("start").addEventListener("click", () => {
  const selectedOption = document.getElementById("optionSelect").value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: fillFormBasedOnOption,
      args: [selectedOption],
    });
  });
});
