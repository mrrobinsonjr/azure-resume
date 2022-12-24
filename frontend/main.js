window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount();
})


const functionApi = '';

const getVisitCount = () => {
    let count = 30;
    fetch(functionApi).them(response => {
        return response.json()
    }).then(response => {
        console.log("Website called function API.")
        count = response.count;
        document.getElementById("counter").innerText = count;
    }).catch(function (erroer) {
        console.log(error);
    });
    return count

}