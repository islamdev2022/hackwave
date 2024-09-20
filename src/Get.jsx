import React, { useState, useEffect } from 'react';

const Get = () => {
const [mdOrder,setMdOrder] = useState("")
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    console.log('Current URL:', currentUrl);
    // Extract the mdOrder from the URL
const params = new URLSearchParams(new URL(currentUrl).search);
setMdOrder(params.get('mdOrder'));

console.log('mdOrder:', mdOrder);
})
  


  const [depositAmount, setDepositAmount] = useState(0);
  
  const Url = `https://test.satim.dz/payment/rest/confirmOrder.do?language=EN&orderId=${mdOrder}&password=satim120&userName=SAT2408280995`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(Url); // Fetch the data
        const data = await response.json();
        setDepositAmount(data.Amount); // Extract and set depositAmount
        console.log(data.Amount)
        console.log(data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (mdOrder) {
      fetchData();
    }
  }, [mdOrder, Url]);

  return (
    <div>
      <p>Amount: {depositAmount !== null ? depositAmount : 'No amount found'}</p>
    </div>
  );
};

export default Get;
