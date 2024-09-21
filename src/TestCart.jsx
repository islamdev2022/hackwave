import React from 'react';

const TestCart = () => {
  // Handler for the button click to inject the script into the active tab
  const fillForm = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: fillInputsOnPage // Inject the function to fill form inputs
      });
    });
  };

  // Function to be injected into the webpage
  const fillInputsOnPage = () => {
    const data = [
      {
        "carte": "6280580610061011",
        "dateExp": "01/2025",
        "cvv2": "341",
        "mot_de_pass":"123456",
        "fl":"fl"
      },
      {
        "carte": "6280581110006712",
        "dateExp": "01/2025",
        "cvv2": "757",
        "mot_de_pass":"123456",
        "fl":"fl"
      }
      // ... more items
    ];

    // Get the first item in the data array
    const firstItem = data[0];
    const [month, year] = firstItem.dateExp.split('/');

    // Fill the input fields on the webpage (using IDs)
    document.getElementById('iPAN').value = firstItem.carte;
    document.getElementById('month').value = month;
    document.getElementById('year').value = year;
    document.getElementById('iCVC').value = firstItem.cvv2;
    document.getElementById('iTEXT').value = firstItem.fl;
    document.getElementsByTagName('j_idt39').value = firstItem.mot_de_pass;
  };

  return (
    <div>
      <button onClick={fillForm}>Fill Form</button>
    </div>
  );
};

export default TestCart;
