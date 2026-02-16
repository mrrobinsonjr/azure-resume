// This event listener triggers when the webpage has finished loading
window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount(); // Call the getVisitCount function
})

// URL for the production backend API
const functionApiURL = window.COUNTER_API_URL || "https://mrrgetresumecounter-func.azurewebsites.net/api/mrrGetResumeCounter";

// URL for the local backend API (for testing)
const localfunctionApi = 'http://localhost:8080/api/mrrGetResumeCounter';

// This function fetches the visit count from the backend API and displays it on the webpage
const getVisitCount = async () => {
    // Use null so failures are visible instead of showing a stale hardcoded number.
    let count = null;

    // Helper to apply a response object that might use different casing
    const applyCount = (obj) => {
        if (!obj) return;
        if (typeof obj.count === 'number') count = obj.count;
        else if (typeof obj.Count === 'number') count = obj.Count;
    };

    try {
        // Try production first
        let resp = await fetch(functionApiURL);
        if (!resp.ok) throw new Error(`prod fetch status ${resp.status}`);
        const body = await resp.json();
        console.log('Website called production function API.');
        applyCount(body);
    } catch (prodErr) {
        console.warn('Production function fetch failed:', prodErr);
        try {
            // Fallback to local endpoint for testing
            let resp2 = await fetch(localfunctionApi);
            if (!resp2.ok) throw new Error(`local fetch status ${resp2.status}`);
            const body2 = await resp2.json();
            console.log('Website called local function API.');
            applyCount(body2);
        } catch (localErr) {
            console.warn('Local function fetch failed:', localErr);
        }
    }

    // Ensure the counter element is always updated.
    const el = document.getElementById('counter');
    if (el) el.innerText = Number.isInteger(count) ? count : 'unavailable';
    return count;
}
