function showLoading(container) {
  container.innerHTML = `<div class="card glass">⏳ Cargando...</div>`;
}

function showError(container, msg) {
  container.innerHTML = `<div class="card glass">${msg}</div>`;
}

function renderServer(data, geo) {
  const results = document.getElementById("results");

  results.innerHTML = `
    <div class="card glass">
      <h2>${data.hostname}</h2>
      <p>${data.vars?.sv_projectDesc || ""}</p>
      <p>👥 ${data.clients}/${data.sv_maxclients}</p>
      <p>📍 ${geo.city}, ${geo.country_name} (${geo.org})</p>
      <div id="map" class="map"></div>
      <a href="fivem://connect/${geo.ip}" class="direct-btn">Direct Connect</a>
    </div>
  `;

  const map = L.map("map").setView([geo.latitude, geo.longitude], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.marker([geo.latitude, geo.longitude]).addTo(map);
}
