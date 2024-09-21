import React, { useState, useEffect } from 'react';
import Amount from './Amount';
import TestCart from './TestCart';
import Get from './GET';
import { ResponsePage } from './ResponsePage';

function App() {
    const [sslData, setSSLData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [radioInputs, setRadioInputs] = useState(false);
    const [cloudflareCaptchaFound, setCloudflareCaptchaFound] = useState(false);
    const [isDataVisible, setIsDataVisible] = useState(true);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = tabs[0].url;

            // Hide data if URL starts with the specified patterns
            if (currentUrl.startsWith("https://dev.satim.dz/") || currentUrl.startsWith("https://test.satim.dz/")) {
                setIsDataVisible(false);
            } else {
                setIsDataVisible(true);
            }

            const sslCheckUrl = `https://api.ssllabs.com/api/v3/analyze?host=${new URL(currentUrl).hostname}`;
            fetch(sslCheckUrl)
                .then((response) => response.json())
                .then((data) => setSSLData(data))
                .catch((error) => console.error('Error fetching SSL data:', error));
        });

        chrome.runtime.onMessage.addListener((message) => {
            if (message.success && message.action === 'scrapePage') {
                setFormData(message);
                const termsFound = message.termFound;
                setRadioInputs(termsFound);
            }
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    func: () => {
                        const radioInputs = Array.from(document.querySelectorAll('input[type="radio"]'));
                        const lastRadioInput = radioInputs[radioInputs.length - 1];
                        const isLastRadioChecked = lastRadioInput ? true : false;
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
                        setRadioInputs(isLastRadioChecked);
                        setCloudflareCaptchaFound(isCloudflareCaptcha);
                    }
                }
            );
        });
    }, []);

    return (
        <div className="w-72 mx-auto h-96 overflow-scroll p-6 bg-gray-100 rounded-3xl shadow-xl border-none">
            {isDataVisible ? (
                <>
                    <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">SSL and Page Content Scraper</h1>

                    {/* SSL Data */}
                    {sslData ? (
                        <div className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
                            <h2 className="text-2xl text-center font-semibold mb-4 text-indigo-600">SSL Information</h2>
                            <p className="mb-2"><span className="font-bold">Host:</span> {sslData.host}</p>
                            <p className="mb-2"><span className="font-bold">Grade:</span> {sslData.endpoints[0].grade} <span className={sslData.endpoints[0].grade === "A" || sslData.endpoints[0].grade === "A+" ? "font-bold" : "font-bold text-red-500"}>
                                {sslData.endpoints[0].grade === "A" || sslData.endpoints[0].grade === "A+" ? ": 'Certified' " : ": 'Not Certified' "}
                            </span></p>
                        </div>
                    ) : (
                        <p className="text-center text-lg text-gray-500">Loading SSL data...</p>
                    )}

                    {/* Terms and Conditions */}
                    <p className="mb-4 font-semibold">Terms accepted: {radioInputs ? 'true' : 'false'}</p>

                    {/* Cloudflare CAPTCHA Check */}
                    <p className="mb-4 font-semibold">CAPTCHA: {cloudflareCaptchaFound ? 'true' : 'false'}</p>

                    {/* <Amount/> */}
                    <Get/>
                    
                    <ResponsePage/>
                </>
            ) : (
            <>
            <TestCart/>
                <p className="text-center text-lg text-semibold text-red-500">Data not available on this page.</p>
                </>
            )}
        </div>
    );
}

export default App;
