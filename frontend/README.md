# Frontend

## index.html

## main.json
- The code is using the fetch function to make an HTTP request to the specified functionApiURL and fetches the response object. The .then() function is then used twice to handle the response.

- In the first .then() function, the response.json() method is called to parse the response object and return the data as a JSON object.

- In the second .then() function, the response parameter contains the parsed JSON data returned from the previous step. The code logs a message to the console to indicate that the website called the backend API. Then, the count variable is set to the count property of the response object. Finally, the count value is displayed on the webpage by setting the innerText property of an HTML element with the ID "counter".

- If there is an error in the HTTP request, the .catch() function is called to handle the error. The error object is passed as the error parameter, and the code logs the error message to the console.
