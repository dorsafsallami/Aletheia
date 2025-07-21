chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.contentScriptQuery == "queryFakeNewsStatus") {
        chrome.action.setBadgeText({text: request.fakeNewsDetected ? "Fake" : "Real"});
    }
});
