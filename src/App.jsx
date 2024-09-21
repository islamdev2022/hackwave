import React, { useState, useEffect } from 'react';
import Amount from './Amount';
import Get from './GET'
import { ResponsePage } from './ResponsePage';
function App() {
    const [sslData, setSSLData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [radioInputs, setRadioInputs] = useState(false);
    const [cloudflareCaptchaFound, setCloudflareCaptchaFound] = useState(false);

    // Fetch SSL data and form data from the content script
    useEffect(() => {
        // Listen for messages from the content script
        chrome.runtime.onMessage.addListener((message) => {
            if (message.success && message.action === 'scrapePage') {
                setFormData(message);   
                
                // Check if "I accept the terms and conditions" is present in the scraped content
                const termsFound = message.termFound;
                setRadioInputs(termsFound);
            }
        });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      const sslCheckUrl = `https://api.ssllabs.com/api/v3/analyze?host=${new URL(currentUrl).hostname}`;
      fetch(sslCheckUrl)
        .then((response) => response.json())
        .then((data) => setSSLData(data))
        .catch((error) => console.error('Error fetching SSL data:', error));
    });

        // Scrape the current page content and check for Cloudflare CAPTCHA iframes
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    func: () => {
                        const radioInputs = Array.from(document.querySelectorAll('input[type="radio"]'));
                        const lastRadioInput = radioInputs[radioInputs.length - 1];

                        const isLastRadioChecked = lastRadioInput ? true : false;

                        // Check for iframes that may contain Cloudflare CAPTCHA
                        const cloudflareCaptchaFound = Array.from(document.querySelectorAll('iframe'));
                        const isCloudflareCaptcha = cloudflareCaptchaFound ? true : false;
                        const totalPriceElement = Array.from(document.querySelectorAll('*')).find(el => {
                            const style = window.getComputedStyle(el);
                            return style.fontWeight === 'bold' && (el.innerText.toLowerCase().includes('total') || el.innerText.toLowerCase().includes('montant'));
                        });
                        const totalPrice = totalPriceElement ? true : false;
                        return { isLastRadioChecked, isCloudflareCaptcha, totalPrice };
                    },
                },
                (results) => {
                    if (results && results[0] && results[0].result) {
                        const { isLastRadioChecked, isCloudflareCaptcha } = results[0].result;
                        console.log('Radio Data:', isLastRadioChecked);
                        setRadioInputs(isLastRadioChecked);
                        console.log('radios:', isLastRadioChecked);
                        setCloudflareCaptchaFound(isCloudflareCaptcha);
                    }
                }
            );
        });
    }, []);

    return (
        <div className="w-72 mx-auto p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">SSL and Page Content Scraper</h1>

            {/* SSL Data */}
            {sslData ? (
                <div className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-600">SSL Information</h2>
                    <p className="mb-2"><span className="font-bold">Host:</span> {sslData.host}</p>
                    <p className="mb-2"><span className="font-bold">Grade:</span> {sslData.endpoints[0].grade} <span className={sslData.endpoints[0].grade === "A" || sslData.endpoints[0].grade === "A+" ? "font-bold" : "font-bold text-red-500"}>
                        {sslData.endpoints[0].grade === "A" || sslData.endpoints[0].grade === "A+" ? ": 'Certified' " : ": 'Not Certified' "}
                    </span></p>
                </div>
            ) : (
                <p className="text-center text-lg text-gray-500">Loading SSL data...</p>
            )}

            {/* Terms and Conditions */}
            <p className="mb-4">Terms accepted: {radioInputs ? 'true' : 'false'}</p>

            {/* Cloudflare CAPTCHA Check */}
            <p className="mb-4">CAPTCHA: {cloudflareCaptchaFound ? 'true' : 'false'}</p>

           
            <Amount/>
            <Get/>
            <ResponsePage/>
        </div>
    );
}

export default App;
