import React, { useState, useEffect } from 'react';

function App() {
    const [sslData, setSSLData] = useState(null);
    const [formData, setFormData] = useState(null);

    // Fetch SSL data and form data from the background/content script
    useEffect(() => {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'scrapeData') {
                setFormData(message.data);
            }
        });

        // Get the current tab's URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = tabs[0].url;
            const sslCheckUrl = `https://api.ssllabs.com/api/v3/analyze?host=${new URL(currentUrl).hostname}`;
            fetch(sslCheckUrl)
                .then((response) => response.json())
                .then((data) => setSSLData(data))
                .catch((error) => console.error('Error fetching SSL data:', error));
        });
    }, []);

    return (
        <div className="w-full">
            <h1>SSL and Form Data Scraper</h1>
            {sslData ? (
                <div>
                    <h2>SSL Information</h2>
                    <p>Host: {sslData.host}</p>
                    <p>Status: {sslData.status}</p>
                    <p>Grade: {sslData.endpoints[0].grade}</p>
                </div>
            ) : (
                <p>Loading SSL data...</p>
            )}

            {formData ? (
                <div>
                    <h2>Form Data</h2>
                    <pre>{JSON.stringify(formData, null, 2)}</pre>
                </div>
            ) : (
                <p>Scraping form data...</p>
            )}
        </div>
    );
}

export default App;
