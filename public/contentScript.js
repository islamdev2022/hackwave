// contentScript.js
window.addEventListener('DOMContentLoaded', () => {
    // Check for common CAPTCHA elements
    console.log("'éé'ezzdez")
    const captchaIframe = document.querySelector('iframe[src*="challenges.cloudflare.com"]');

    chrome.runtime.sendMessage({ action: 'captchaDetected', data: !!captchaExists });
    if (captchaIframe) {
        // Send message to the React component that CAPTCHA is detected
        chrome.runtime.sendMessage({ action: 'captchaDetected', data: !!captchaIframe });
        console.log("CAPTCHA iframe found:", captchaIframe);  // Logging for debugging
    } else {
        // Send message that no CAPTCHA was detected
        chrome.runtime.sendMessage({ action: 'captchaDetected', data: false });
        console.log("No CAPTCHA iframe found");
    }
});
