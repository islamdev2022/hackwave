import React, { useEffect, useState } from 'react';

const Amount = () => {
  const [biggestAmount, setBiggestAmount] = useState('');
  const [hostname, setHostname] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the current tab's URL and extract hostname
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      const currentHostname = new URL(currentUrl).hostname;
      setHostname(currentHostname);

      // Once we have the URL, proceed with scraping numbers
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: scrapeBiggestBoldNumberWithDZD, // Inject this function into the page to scrape numbers
        },
        (result) => {
          if (result[0].result) {
            setBiggestAmount(result[0].result); // Set the biggest scraped number
          } else {
            setError('No bold numbers ending with DZD found with the biggest font size.');
          }
        }
      );
    });
  }, []);

  // Function to scrape bold numbers ending with "DZD" and with the biggest font size (injected into the active tab)
  function scrapeBiggestBoldNumberWithDZD() {
    const elements = Array.from(document.querySelectorAll('p, span, div')); // More specific elements
    let biggestFontSize = 0;
    let biggestNumber = '';

    elements.forEach(el => {
      const textContent = el.innerText.trim();
      const pattern = /\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?\s*DZD\b/g; // Pattern to match numbers ending with "DZD"
      const matches = textContent.match(pattern);

      if (matches) {
        const fontSize = parseFloat(window.getComputedStyle(el).fontSize); // Get the font size of the element
        const fontWeight = window.getComputedStyle(el).fontWeight; // Get the font weight of the element

        // Check if the element is bold (font-weight >= 700 is generally considered bold)
        const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;

        // If it's bold and has the biggest font size so far, capture it
        if (isBold && fontSize > biggestFontSize) {
          biggestFontSize = fontSize;
          biggestNumber = matches[0]; // Capture the number with the biggest font size and bold style
        }
      }
    });

    return biggestNumber ? biggestNumber : null; // Return the number with the biggest font size and bold style
  }

  return (
    <div>
      
      {biggestAmount ? (
        <p className="text-lg text-green-600">{biggestAmount}</p>
      ) : (
        <p className="text-lg text-red-600">No numbers found</p>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default Amount;
