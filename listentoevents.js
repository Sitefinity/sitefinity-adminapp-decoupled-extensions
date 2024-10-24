(function () {
    // Function to create a postMessage proxy for a given window
    const createPostMessageProxy = (targetWindow, windowName = 'unknown') => {
        const originalPostMessage = targetWindow.postMessage;

        targetWindow.postMessage = function (message, targetOrigin, transfer) {
            var isAngular1 = (message && message.source && message.source.startsWith('angular-devtools'));
            var isAngular2 = message && (message.isIvy || message.isAngular);
            var isTargetOrigin = targetOrigin === "*";
            if (!isAngular1 && !isAngular2 && !isTargetOrigin) {
                console.log(`[${windowName}] postMessage called with:`, { message, targetOrigin, transfer });
            }
            originalPostMessage.call(targetWindow, message, targetOrigin, transfer);
        };
    };

    createPostMessageProxy(window, 'mainWindow');

    // Apply proxy to iframes or other windows as needed
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
        try {
            const iframeWindow = iframe.contentWindow;
            createPostMessageProxy(iframeWindow, `iframe_${index}`);
        } catch (e) {
            console.warn('Cannot access iframe contentWindow:', e);
        }
    });
})();
