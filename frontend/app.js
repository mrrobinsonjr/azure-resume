(function () {
  var target = document.getElementById("visitor-count");
  if (!target) {
    return;
  }

  var isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  var apiBase = isLocalHost ? "http://localhost:7071/api" : "/api";
  var sessionKey = "counter_incremented";

  function setCount(value) {
    target.textContent = String(value);
  }

  function fetchCount() {
    return fetch(apiBase + "/counter", { cache: "no-store" }).then(function (response) {
      if (!response.ok) {
        throw new Error("status " + response.status);
      }
      return response.json();
    });
  }

  function incrementCount() {
    return fetch(apiBase + "/counter/increment", { method: "POST" }).then(function (response) {
      if (!response.ok) {
        throw new Error("status " + response.status);
      }
      return response.json();
    });
  }

  fetchCount()
    .then(function (data) {
      if (!data || typeof data.count !== "number") {
        throw new Error("invalid payload");
      }
      setCount(data.count);

      if (window.sessionStorage.getItem(sessionKey) === "1") {
        return;
      }

      return incrementCount().then(function (incremented) {
        if (!incremented || typeof incremented.count !== "number") {
          throw new Error("invalid payload");
        }
        setCount(incremented.count);
        window.sessionStorage.setItem(sessionKey, "1");
      });
    })
    .catch(function (error) {
      setCount("—");
      console.error("counter fetch failed:", error.message);
    });
})();
