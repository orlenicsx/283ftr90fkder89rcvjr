// js/ui.js NUEVO
function renderServer(info, geo, players, ip) {
  const results = document.getElementById("results");

  results.innerHTML = `
    <div class="card glass server-info">
      <div style="display:flex; gap:15px; align-items:center;">
        ${info.iconBase64 ? `<img src="${info.iconBase64}" style="width:64px;height:64px;border-radius:12px;">` : ''}
        <div>
          <h2>${info.hostname || info.name}</h2>
          <p>${info.vars?.sv_projectDesc || 'Sin descripción'}</p>
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin:20px 0;">
        <div class="stat"><strong>👥 Jugadores</strong><br>${info.playersLive}/${info.sv_maxclients}</div>
        <div class="stat"><strong>📦 Resources</strong><br>${info.resourcesCount}</div>
        <div class="stat"><strong>⚡ Ping medio</strong><br>${Math.round(info.avgPing)}ms</div>
        ${geo ? `<div class="stat"><strong>🌍 Ubicación</strong><br>${geo.city || 'N/A'}</div>` : ''}
        ${geo ? `<div class="stat"><strong>🏢 Proveedor</strong><br>${geo.provider || geo.org || 'N/A'}</div>` : ''}
      </div>

      <div style="margin:20px 0;">
        <strong>IP:</strong> <code>${ip}</code>
        <a class="btn-direct" href="fivem://connect/${ip}" style="margin-left:10px;">🚀 Direct Connect</a>
      </div>

      ${geo ? `
        <div id="map" style="height:250px; border-radius:12px; margin:20px 0;"></div>
      ` : ''}

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        ${info.discord ? `<a href="${info.discord}" target="_blank" class="btn-social">💬 Discord</a>` : ''}
        ${info.instagram ? `<a href="${info.instagram}" target="_blank" class="btn-social">📸 Instagram</a>` : ''}
        ${info.tiktok ? `<a href="${info.tiktok}" target="_blank" class="btn-social">🎵 TikTok</a>` : ''}
        <a href="${info.ownerProfile}" target="_blank" class="btn-social">👑 Owner</a>
      </div>
    </div>

    <details class="card glass">
      <summary>📋 Players (${players?.length || 0})</summary>
      <div style="max-height:300px;overflow:auto;">
        ${players?.map(p => `<div style="padding:8px;border-bottom:1px solid #333;">${p.name} <span style="color:#888;">(${p.ping}ms)</span></div>`).join('') || 'No disponibles'}
      </div>
    </details>

    <details class="card glass">
      <summary>📦 Resources (${info.resourcesCount || 0})</summary>
      <pre style="max-height:200px;overflow:auto;font-size:12px;">${(info.fullResources || []).slice(0,100).join(', ')}${(info.fullResources || []).length > 100 ? '...' : ''}</pre>
    </details>
  `;

  // 🗺️ Mapa si hay geo
  if (geo && typeof L !== 'undefined') {
    const map = L.map("map").setView([geo.latitude || 40.4168, geo.longitude || -3.7038], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker([geo.latitude || 40.4168, geo.longitude || -3.7038]).addTo(map)
      .bindPopup(`${geo.city || 'Madrid'}<br>${geo.provider || 'OVH'}`);
  }
}
