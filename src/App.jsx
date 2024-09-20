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
        <div className="w-full">
            <h1>SSL and Page Content Scraper</h1>
            
            {/* SSL Data */}
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

            {/* Terms and Conditions */}
            <p>Condition accepted: {termsAccepted ? 'true' : 'false'}</p>

            {/* Cloudflare CAPTCHA Check */}
            <p>Cloudflare CAPTCHA iframe found: {cloudflareCaptchaFound ? 'true' : 'false'}</p>

            {/* Page Content */}
            {formData ? (
                <div>
                    <h2>Page Content</h2>
                    {/* <pre>{formData}</pre> */}
                </div>
            ) : (
                <p>Scraping page content...</p>
            )}
        </div>
    );
}

export default App;
