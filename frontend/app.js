(function () {
  var target = document.getElementById("visitor-count");
  if (!target) {
    return;
  }

  fetch("/api/counter")
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
