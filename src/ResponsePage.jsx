import { useState, useEffect } from "react";

export const ResponsePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [response, setResponse] = useState(false);
  
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

  const respCode_desc = data ? data.params.respCode_desc : null;
  const orderNumber = data ? data.OrderNumber : null;
  const approvalCode = data ? data.approvalCode : "Doesn't Exist";
  const amount = data ? data.Amount : null;
  const CIB = "Carte CIB/EDAHABIA";

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      console.log('Current URL:', currentUrl);
      const params = new URLSearchParams(new URL(currentUrl).search);
      if (params.get('orderId') === orderId) {
        setShow(true);
      }
    });
  }, [orderId]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const responseB = Array.from(document.querySelectorAll("*")).find((el) => {
              return el.innerText.toLowerCase().includes(respCode_desc.toLowerCase());
            });
            console.log("response.......; ", responseB)
            return { responseB};
          },
        },
        
        (results) => {
          if (results && results[0] && results[0].result) {
            const { responseB } = results[0].result;
            setResponse(responseB);
          }
        }
      );
    });
  }, []);
  

  return (
    <>
  {data ? (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-2">
      {error ? (
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      ) : (
        <div className="bg-white p-3 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Order Details</h2>
          <p className="text-gray-600  mb-2">
            <span className="font-semibold">Response:</span> {respCode_desc}
          </p>
          <p className="text-gray-600  mb-2">
            <span className="font-semibold">OrderId:</span> {orderId}
          </p>
          <p className="text-gray-600  mb-2">
            <span className="font-semibold">Order Number:</span> {orderNumber}
          </p>
          <p className="text-gray-600  mb-2">
            <span className="font-semibold">Approval Code:</span> {approvalCode}
          </p>
          <p className="text-gray-600  mb-2">
            <span className="font-semibold">Amount:</span> {amount}
          </p>
        </div>
      )}
    </div>
  ) : (
    <p className="text-gray-500 text-center text-lg">Waiting for response...</p>
  )}
</>

  );
};
