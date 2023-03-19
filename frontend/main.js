window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount();
})

const functionApiURL = "https://azure-resume-challenge.azurewebsites.net/api/GetResumeCounter?code=dUGHtOoYjbPSD6DRWviG4EIEFx581mGK_Pp8cojI5xiZAzFurJHZVQ=="
const localfunctionApi = 'http://localhost:8080/api/mrrGetResumeCounter';



const getVisitCount = () => {
    let count = 30;
    fetch(localfunctionApi).then(response => {
        return response.json()
    }).then(response =>{
        console.log("Website called function API.");
        count =  response.count;
        document.getElementById("counter").innerText = count;
    }).catch(function(error){
        console.log(error);
    });
    return count;

}