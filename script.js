const list = document.querySelector("#starred");
const status = document.querySelector("#status");

if (!list) {
  throw new Error("The #starred list element was not found.");
}

const setStatus = (message) => {
  if (status) {
    status.textContent = message;
  }
};

const setBusy = (isBusy) => {
  list.setAttribute("aria-busy", String(isBusy));
};

const renderError = (message) => {
  list.innerHTML = "";

  const errorItem = document.createElement("li");
  errorItem.textContent = message;
  list.appendChild(errorItem);

  setStatus(message);
};

if (window.location.protocol === "file:") {
  setBusy(false);
  renderError("This page must be served over HTTP to load the stargazer log.");
} else if (!window.fetch) {
  setBusy(false);
  renderError("This browser does not support loading the stargazer log.");
} else {
  setBusy(true);
  setStatus("Loading starred repositories...");

  fetch("events.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load events: ${response.status} ${response.statusText}`);
      }

      return response.json();
    })
    .then((events) => {
      if (!Array.isArray(events)) {
        throw new TypeError("The events data is not an array.");
      }

      list.innerHTML = "";

      const validEvents = events.filter(
        (event) => event && typeof event.name === "string" && typeof event.starred === "string"
      );

      if (validEvents.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No starred repositories found.";
        list.appendChild(emptyMessage);
        setStatus("No starred repositories found.");
        setBusy(false);
        return;
      }

      validEvents.forEach((event) => {
        const item = document.createElement("li");
        item.textContent = `${event.name} — starred ${event.starred}`;
        list.appendChild(item);
      });

      setStatus(`Loaded ${validEvents.length} starred repositories.`);
      setBusy(false);
    })
    .catch((error) => {
      console.error("Failed to load stargazers log:", error);
      renderError("Unable to load the stargazer log right now.");
      setBusy(false);
    });
}
