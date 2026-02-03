function renderServer(data) {
  const container = document.getElementById("result");

  container.innerHTML = `
    <div class="card">
      <div class="header">
        ${data.iconBase64 ? `<img src="${data.iconBase64}" class="icon">` : ""}
        <div>
          <h2>${data.hostname}</h2>
          <p>${data.clients}/${data.sv_maxclients} jugadores</p>
        </div>
      </div>

      <div class="grid">
        <div><b>IP:</b> ${data.address}</div>
        <div><b>Owner:</b> ${data.ownerName}</div>
        <div><b>OneSync:</b> ${data.onesync ? "Sí" : "No"}</div>
        <div><b>Build:</b> ${data.gameBuild}</div>
        <div><b>Ping medio:</b> ${Math.round(data.avgPing)} ms</div>
        <div><b>Recursos:</b> ${data.resourcesCount}</div>
      </div>

      ${data.bannerConnect ? `<img class="banner" src="${data.bannerConnect}">` : ""}

      <h3>Top jugadores</h3>
      <ul class="players">
        ${data.topPlayers.map(p => `
          <li>
            <span>${p.name}</span>
            <span>${p.ping} ms</span>
          </li>
        `).join("")}
      </ul>

      <h3>OSINT</h3>
      <div class="grid">
        <div><b>ISP:</b> ${data.osint.isp}</div>
        <div><b>Hosting:</b> ${data.osint.hosting ? "Sí" : "No"}</div>
        <div><b>Ubicación:</b> ${data.osint.location}</div>
      </div>
    </div>
  `;
}
