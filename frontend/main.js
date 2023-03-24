// This event listener triggers when the webpage has finished loading
window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount(); // Call the getVisitCount function
})

// URL for the production backend API
const functionApiURL = "https://azure-resume-challenge.azurewebsites.net/api/GetResumeCounter?code=dUGHtOoYjbPSD6DRWviG4EIEFx581mGK_Pp8cojI5xiZAzFurJHZVQ==";

// URL for the local backend API (for testing)
const localfunctionApi = 'http://localhost:8080/api/mrrGetResumeCounter';

// This function fetches the visit count from the backend API and displays it on the webpage
const getVisitCount = () => {
    // Set a default count value
    let count = 30;
    
    // Fetch the visit count from the API
    fetch(localfunctionApi) // Makes an HTTP request to the specified URL
    .then(response => { // Handles the response object
        return response.json() // Parses the response as JSON
    })
    .then(response => { // Handles the parsed JSON data
        console.log("Website called function API."); // Logs a message to the console
        count = response.count; // Extracts the count value from the JSON data
        document.getElementById("counter").innerText = count; // Displays the count value on the webpage
    })
    .catch(error => { // Handles any errors that occurred during the request
        console.log(error); // Logs the error message to the console
    });

    // Return the visit count
    return count;
}