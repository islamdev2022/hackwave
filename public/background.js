chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapeData') {
        console.log('Scraped Data:', message.data);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && /^https?:\/\//.test(tab.url)) {
        // Check SSL certificate using an external API (SSL Labs example)
        const sslCheckUrl = `https://api.ssllabs.com/api/v3/analyze?host=${new URL(tab.url).hostname}`;
        fetch(sslCheckUrl)
            .then(response => response.json())
            .then(data => {
                console.log('SSL Certificate Data:', data);
                // You can add further logic to store or display the certificate data
            })
            .catch(error => console.error('Error fetching SSL data:', error));
    }
});
