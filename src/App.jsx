import React, { useState, useEffect } from 'react';

function App() {
    const [sslData, setSSLData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [cloudflareCaptchaFound, setCloudflareCaptchaFound] = useState(false);

    // Fetch SSL data and form data from the content script
    useEffect(() => {
        // Listen for messages from the content script
        chrome.runtime.onMessage.addListener((message) => {
            if (message.success && message.action === 'scrapePage') {
                setFormData(message.pageContent);   
                
                // Check if "I accept the terms and conditions" is present in the scraped content
                const termsFound = message.termFound;
                setTermsAccepted(termsFound);
            }
        });

        // Get the current tab's URL for SSL data
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
                        const pageContent = document.body.innerText || document.body.textContent;
                        const termsFound = pageContent.includes("I accept the terms and conditions");
                        
                        // Check for iframes that may contain Cloudflare CAPTCHA
                        const cloudflareCaptchaFound = Array.from(document.querySelectorAll('iframe')).some(iframe => {
                            const src = iframe.src || '';
                            return src.includes('cloudflare') || src.includes('captcha'); // Adjust as necessary
                        });
                        
                        return { pageContent, termsFound, cloudflareCaptchaFound };
                    },
                },
                (results) => {
                    if (results && results[0] && results[0].result) {
                        const { pageContent, termsFound, cloudflareCaptchaFound } = results[0].result;
                        setFormData(pageContent);
                        setTermsAccepted(termsFound);
                        setCloudflareCaptchaFound(cloudflareCaptchaFound);
                    }
                }
            );
        });
    }, []);

    return (
        <div className="w-72 mx-auto p-6 bg-gray-100 ">
    <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">SSL and Page Content Scraper</h1>

    {/* SSL Data */}
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

    {/* Terms and Conditions */}
    <p className="mb-4">Condition accepted: {termsAccepted ? 'true' : 'false'}</p>

    {/* Cloudflare CAPTCHA Check */}
    <p className="mb-4">Cloudflare CAPTCHA iframe found: {cloudflareCaptchaFound ? 'true' : 'false'}</p>

    {/* Page Content */}
    {formData ? (
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-indigo-600">Page Content</h2>
            <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded">{JSON.stringify(formData, null, 2)}</pre>
        </div>
    ) : (
        <p className="text-center text-lg text-gray-500">Scraping page content...</p>
    )}
</div>

    );
}

export default App;
