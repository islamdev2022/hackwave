import { useState, useEffect } from 'react';

const useFetchOrderData = () => {
  const [mdOrder, setMdOrder] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const baseUrl = 'https://test.satim.dz/payment/rest/confirmOrder.do?language=EN&password=satim120&userName=SAT2408280995';

  const EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Save mdOrder and timestamp in localStorage
  const saveMdOrderWithExpiry = (orderId) => {
    const expiryTimestamp = new Date().getTime() + EXPIRATION_TIME; // Current time + 10 minutes
    const data = { orderId, expiryTimestamp };
    localStorage.setItem('mdOrderData', JSON.stringify(data));
  };

  // Retrieve mdOrder if not expired
  const getMdOrderFromLocalStorage = () => {
    const storedData = localStorage.getItem('mdOrderData');
    if (storedData) {
      const { orderId, expiryTimestamp } = JSON.parse(storedData);
      const currentTime = new Date().getTime();
      
      if (currentTime < expiryTimestamp) {
        return orderId;
      } else {
        // If expired, remove from localStorage
        localStorage.removeItem('mdOrderData');
      }
    }
    return null;
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      console.log('Current URL:', currentUrl);

      // Extract the mdOrder from the URL
      const params = new URLSearchParams(new URL(currentUrl).search);
      const orderId = params.get('mdOrder');

      if (orderId) {
        setMdOrder(orderId);
        saveMdOrderWithExpiry(orderId);
      } else {
        // Try to get from localStorage if not in URL
        const storedOrderId = getMdOrderFromLocalStorage();
        if (storedOrderId) {
          setMdOrder(storedOrderId);
        }
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mdOrder) {
          const url = `${baseUrl}&orderId=${mdOrder}`;
          const response = await fetch(url);
          setData(await response.json());
        }
      } catch (err) {
        setError('Error fetching data');
        console.error('Error fetching data:', err);
      }
    };

    if (mdOrder) {
      fetchData();
    }
  }, [mdOrder]);

  return { data, error, mdOrder };
};

export default useFetchOrderData;
