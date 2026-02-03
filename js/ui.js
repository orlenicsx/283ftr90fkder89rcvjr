function renderResults(data, container) {
  const geo = data.osint || {};
  const players = data.topPlayers || [];

  container.innerHTML = `
    <div class="card glass">

      <div class="server-hero">
        <div>
          <div class="server-title">${data.hostname}</div>
          <p class="server-desc">${data.vars?.sv_projectDesc || 'Sin descripción del servidor'}</p>
        </div>

        ${data.iconBase64 ? `<img src="${data.iconBase64}" class="server-icon">` : ''}
      </div>

      <div class="stats-grid">
        <div class="stat-box">👥 Jugadores<span>${data.playersLive}/${data.sv_maxclients}</span></div>
        <div class="stat-box">📦 Resources<span>${data.resourcesCount}</span></div>
        <div class="stat-box">⚡ Ping<span>${Math.round(data.avgPing)} ms</span></div>
        <div class="stat-box">🌍 Ubicación<span>${geo.location || 'N/A'}</span></div>
        <div class="stat-box">🏢 ISP<span>${geo.provider || 'N/A'}</span></div>
        <div class="stat-box">🎮 Build<span>${data.gameBuild || 'Default'}</span></div>
      </div>

      <div class="ip-box">
        <strong>IP:</strong> <code>${data.address}</code>
        <a href="fivem://connect/${data.address}" class="btn-connect">🚀 Conectar</a>
      </div>

      ${geo.ip ? `
        <div>
          <h3 style="margin-top:28px;">🗺️ Localización del servidor</h3>
          <div id="tempMap"></div>
        </div>
      ` : ''}
    </div>

    <details class="card glass">
      <summary>👥 Jugadores (${players.length})</summary>
      <div class="players-list">
        ${players.map(p => `
          <div>${p.name} <span style="float:right;opacity:.6">${p.ping}ms</span></div>
        `).join('')}
      </div>
    </details>

    <details class="card glass">
      <summary>📦 Resources (${data.resourcesCount})</summary>
      <pre class="resources-list">${(data.resources || []).slice(0,150).join(', ')}${data.resources.length > 150 ? '...' : ''}</pre>
    </details>
  `;

  // MAPA
  if (geo.ip && typeof L !== 'undefined') {
    setTimeout(() => {
      const map = L.map("tempMap").setView([40.4168, -3.7038], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([40.4168, -3.7038]).addTo(map)
        .bindPopup(geo.location || 'Server location');
    }, 100);
  }
}

}

