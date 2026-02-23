(function () {
  var target = document.getElementById("visitor-count");
  if (!target) {
    return;
  }

  var isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  var counterUrl = isLocalHost
    ? "http://localhost:7071/api/counter"
    : "/api/counter";

  fetch(counterUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("status " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!data || typeof data.count !== "number") {
        throw new Error("invalid payload");
      }
      target.textContent = String(data.count);
    })
    .catch(function (error) {
      target.textContent = "—";
      console.error("counter fetch failed:", error.message);
    });
})();
