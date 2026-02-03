function showLoading(container) {
  container.innerHTML = `<div class="card glass">⏳ Cargando...</div>`;
}

function showError(container, msg) {
  container.innerHTML = `<div class="card glass">${msg}</div>`;
}

function renderServer(info, geo, players, ip) {
  const results = document.getElementById("results");

  results.innerHTML = `
    <div class="card glass">
      <h2>${info.hostname}</h2>
      <p>${info.vars?.sv_projectDesc || ""}</p>

      <p>👥 ${info.clients}/${info.sv_maxclients}</p>
      <p>🌍 ${geo.city}, ${geo.country_name}</p>
      <p>📡 ${geo.org}</p>

      <p><strong>IP:</strong> ${ip}</p>

      <div id="map" class="map"></div>

      <a class="btn-outline" href="fivem://connect/${ip}">
        Direct Connect
      </a>
    </div>
  `;

  const map = L.map("map").setView(
    [geo.latitude, geo.longitude],
    10
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.marker([geo.latitude, geo.longitude]).addTo(map);
}

