import React, { useState } from 'react';

const TestCart = () => {
  const [selectedItem, setSelectedItem] = useState(1); // Default to 1

  // Handler for the select option change
  const handleSelectChange = (e) => {
    setSelectedItem(Number(e.target.value)); // Update the selected item number
  };

  // Handler for the button click to inject the script into the active tab
  const fillForm = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: fillInputsOnPage, // Inject the function to fill form inputs
        args: [selectedItem] // Pass the selected item number as an argument
      });
    });
  };

  // Function to be injected into the webpage
  const fillInputsOnPage = (selectedItem) => {
    const data =[
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
  
      },
      {
        "carte": "6280581110006316",
        "dateExp": "01/2025",
        "cvv2": "902",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110006415",
        "dateExp": "01/2025",
        "cvv2": "296",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110006613",
        "dateExp": "08/2025",
        "cvv2": "649",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110003927",
        "dateExp": "01/2025",
        "cvv2": "834",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280580610061219",
        "dateExp": "01/2025",
        "cvv2": "760",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280580610061110",
        "dateExp": "01/2025",
        "cvv2": "410",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110006514",
        "dateExp": "01/2025",
        "cvv2": "526",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280580610061318",
        "dateExp": "01/2025",
        "cvv2": "406",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110007017",
        "dateExp": "01/2025",
        "cvv2": "517",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110007116",
        "dateExp": "01/2025",
        "cvv2": "790",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110007215",
        "dateExp": "01/2025",
        "cvv2": "776",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6280581110007314",
        "dateExp": "01/2025",
        "cvv2": "541",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      },
      {
        "carte": "6394131100000417",
        "dateExp": "06/20",
        "cvv2": "214",
        "mot_de_pass":"123456",
        "fl":"fl"
  
      }
    ]

    const item = data[selectedItem - 1]; // Get the selected item (1-based index)
    const [month, year] = item.dateExp.split('/');

    // Fill the input fields on the webpage (using IDs)
    document.getElementById('iPAN').value = item.carte;
    document.getElementById('month').value = month;
    document.getElementById('year').value = year;
    document.getElementById('iCVC').value = item.cvv2;
    document.getElementById('iTEXT').value = item.fl;
    document.getElementsByTagName('j_idt39').value = item.mot_de_pass;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg shadow-lg max-w-sm mx-auto">
  <h2 className="text-xl font-semibold text-gray-800">Select Cart Number to Fill Form</h2>

  <select
    value={selectedItem}
    onChange={handleSelectChange}
    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  >
    {[...Array(15).keys()].map((i) => (
      <option key={i + 1} value={i + 1}>
        Cart N{i + 1}
      </option>
    ))}
  </select>

  <button
    onClick={fillForm}
    className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
  >
    Fill Form
  </button>
</div>

  );
};

export default TestCart;
