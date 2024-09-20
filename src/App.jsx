import React, { useState, useEffect } from 'react';

function App() {
    const [sslData, setSSLData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [hasCaptcha, setHasCaptcha] = useState(null);

    useEffect(() => {
        const messageListener = (message) => {
            console.log("Received message:", message); // Debug log
            if (message.action === 'scrapeData') {
                setFormData(message.data);
            } else if (message.action === 'captchaDetected') {
                setHasCaptcha(message.data);
                console.log("CAPTCHA detected:", message.data); // Debug log
            }
        };

        // Listen for messages from the content script
        chrome.runtime.onMessage.addListener(messageListener);

        // Get the current tab's URL and inject content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = tabs[0].url;
            const sslCheckUrl = `https://api.ssllabs.com/api/v3/analyze?host=${new URL(currentUrl).hostname}`;
            
            fetch(sslCheckUrl)
                .then((response) => response.json())
                .then((data) => {
                    console.log("SSL data:", data); // Debug log
                    setSSLData(data);
                })
                .catch((error) => console.error('Error fetching SSL data:', error));

            // Trigger content script to check for CAPTCHA
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js'],
            }, () => {
                console.log("Content script executed."); // Debug log
            });
        });

        // Clean up the message listener
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    return (
        <div className="w-72 mx-auto p-6 bg-gray-100 ">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">SSL & Form Data Scraper</h1>

            {sslData ? (
                <div className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-600">SSL Information</h2>
                    <p className="mb-2"><span className="font-bold">Host:</span> {sslData.host}</p>
                    <p className="mb-2"><span className="font-bold">Status:</span> {sslData.status}</p>
                    <p className="mb-2"><span className="font-bold">Grade:</span> {sslData.endpoints[0].grade}</p>
                </div>
            ) : (
                <p className="text-center text-lg text-gray-500">Loading SSL data...</p>
            )}

            {formData ? (
                <div className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Form Data</h2>
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{JSON.stringify(formData, null, 2)}</pre>
                </div>
            ) : (
                <p className="text-center text-lg text-gray-500">Scraping form data...</p>
            )}

            {hasCaptcha === null ? (
                <p className="text-center text-lg text-gray-500">Checking for CAPTCHA...</p>
            ) : hasCaptcha ? (
                <p className="mt-6 text-center text-xl text-red-500 font-semibold">CAPTCHA detected on this page.</p>
            ) : (
                <p className="mt-6 text-center text-xl text-green-500 font-semibold">No CAPTCHA found on this page.</p>
            )}
        </div>
    );
}

export default App;
