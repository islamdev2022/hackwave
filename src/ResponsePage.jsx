import { useState, useEffect } from "react";

export const ResponsePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null); // State to store comparison result

  const baseUrl = 'https://test.satim.dz/payment/rest/confirmOrder.do?language=EN&password=satim120&userName=SAT2408280995';

  // Retrieve orderId (mdOrder) from localStorage
  const getMdOrderFromLocalStorage = () => {
    const storedData = localStorage.getItem('mdOrderData');
    if (storedData) {
      const { orderId, expiryTimestamp } = JSON.parse(storedData);
      const currentTime = new Date().getTime();
      
      if (currentTime < expiryTimestamp) {
        return orderId;
      } else {
        localStorage.removeItem('mdOrderData'); // Remove expired orderId
      }
    }
    return null;
  };

  const orderId = getMdOrderFromLocalStorage(); // Get the stored mdOrder

  // Fetch order data based on orderId
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (orderId) {
          const url = `${baseUrl}&orderId=${orderId}`;
          const response = await fetch(url);
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        setError('Error fetching data');
        console.error('Error fetching data:', err);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const respCode_desc = data ? data.params?.respCode_desc : null; // Get respCode_desc

  // // Fetch data from the current tab and compare
  // useEffect(() => {
  //   if (!respCode_desc) return; // Avoid executing if respCode_desc is null
  
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     chrome.scripting.executeScript(
  //       {
  //         target: { tabId: tabs[0].id },
  //         func: () => {
  //           const h1Element = document.querySelector("h1"); // Select the <h1> element
  //           return h1Element ? h1Element.innerText : null;  // Return the inner text of <h1> if it exists
  //         }
  //       },
  //       (results) => {
  //         if (chrome.runtime.lastError) {
  //           console.error("Script execution error:", chrome.runtime.lastError);
  //           setError('Error executing script');
  //           return;
  //         }
  
  //         if (results && results[0] && results[0].result) {
  //           const h1Text = results[0].result;
  
  //           console.log("Fetched respCode_desc:", respCode_desc);
  //           console.log("Found <h1> text:", h1Text);
            
  //           // Compare trimmed and lowercase versions to ensure accurate matching
  //           const cleanedRespCodeDesc = respCode_desc.trim().toLowerCase();
  //           const cleanedH1Text = h1Text.trim().toLowerCase();
  
  //           // Compare cleanedRespCodeDesc with <h1> text
  //           const isMatching = cleanedH1Text === cleanedRespCodeDesc;
  //           setComparisonResult(isMatching);
  
  //           // Log comparison details for debugging
  //           console.log("Comparison Details:");
  //           console.log("Cleaned respCode_desc:", cleanedRespCodeDesc);
  //           console.log("Cleaned <h1> text:", cleanedH1Text);
  //           console.log("Comparison result:", isMatching);
  //         } else {
  //           console.log("No <h1> element found.");
  //           setComparisonResult(false);
  //         }
  //       }
  //     );
  //   });
  // }, [respCode_desc]);
  

  return (
    <>
      {data ? (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-2">
          {error ? (
            <p className="text-red-600 text-lg font-semibold">{error}</p>
          ) : (
            <div className="bg-white p-3 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Order Details</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Response:</span> {respCode_desc}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">OrderId:</span> {orderId}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Order Number:</span> {data?.OrderNumber}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Approval Code:</span> {data?.approvalCode || "Doesn't Exist"}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Amount:</span> {data?.Amount}
              </p>
              {/* Display the comparison result */}
              {/* {comparisonResult !== null && (
                <p className={`text-lg font-semibold ${comparisonResult ? 'text-green-600' : 'text-red-600'}`}>
                  Comparison Result: {comparisonResult ? 'True' : 'False'}
                </p>
              )} */}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center text-lg">Waiting for response...</p>
      )}
    </>
  );
};
