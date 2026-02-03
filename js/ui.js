// js/ui.js
function renderServer(info, geo = {}, players = [], ip) {
  const results = document.getElementById("results");

  results.innerHTML = `
    <!-- ===================== HERO ===================== -->
    <div class="card glass">

      <div style="display:flex;gap:20px;align-items:center;">
        ${info.iconBase64 ? `
          <img src="${info.iconBase64}" 
               style="width:90px;height:90px;border-radius:18px;">
        ` : ''}

        <div style="flex:1;">
          <h2 style="font-size:30px;margin:0;">
            ${info.hostname || 'Servidor FiveM'}
          </h2>
          <p style="margin-top:6px;opacity:.75;">
            ${info.vars?.sv_projectDesc || 'Sin descripción'}
          </p>
        </div>
      </div>

      <!-- ===================== STATS ===================== -->
      <div class="stats-grid">
        <div class="stat-box">👥 Jugadores<span>${info.playersLive}/${info.sv_maxclients}</span></div>
        <div class="stat-box">📦 Resources<span>${info.resourcesCount}</span></div>
        <div class="stat-box">⚡ Ping medio<span>${Math.round(info.avgPing || 0)} ms</span></div>
        <div class="stat-box">🗺️ Mapa<span>${info.liveMap || 'N/A'}</span></div>
        <div class="stat-box">🎮 Gamemode<span>${info.liveGametype || 'N/A'}</span></div>
        <div class="stat-box">🔁 OneSync<span>${info.onesync ? 'Sí' : 'No'}</span></div>
        <div class="stat-box">🌍 Locale<span>${info.locale}</span></div>
        <div class="stat-box">🏗️ Build<span>${info.gameBuild || 'Default'}</span></div>
      </div>

      <!-- ===================== CONNECT ===================== -->
      <div class="ip-box">
        <strong>IP:</strong> <code>${ip}</code>
        <a href="fivem://connect/${ip}" class="btn-connect">🚀 Conectar</a>
      </div>

      <!-- ===================== SOCIAL ===================== -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">
        ${info.discord ? `<a href="${info.discord}" target="_blank" class="badge">💬 Discord</a>` : ''}
        ${info.instagram ? `<a href="${info.instagram}" target="_blank" class="badge">📸 Instagram</a>` : ''}
        ${info.tiktok ? `<a href="${info.tiktok}" target="_blank" class="badge">🎵 TikTok</a>` : ''}
        ${info.txAdmin ? `<span class="badge">🛠️ txAdmin</span>` : ''}
      </div>
    </div>

    <!-- ===================== OWNER ===================== -->
    <div class="card glass">
      <h3>👑 Owner</h3>
      <p><strong>Nombre:</strong> ${info.ownerName || 'N/A'}</p>
      <p><strong>ID:</strong> ${info.ownerID || 'N/A'}</p>
      ${info.ownerProfile ? `
        <a href="${info.ownerProfile}" target="_blank" class="badge">Perfil FiveM</a>
      ` : ''}
    </div>

    <!-- ===================== GEO / OSINT ===================== -->
    <div class="card glass">
      <h3>🌍 Información de red</h3>
      <p><strong>IP:</strong> ${geo.ip || 'N/A'}</p>
      <p><strong>Proveedor:</strong> ${geo.provider || 'N/A'}</p>
      <p><strong>ISP:</strong> ${geo.isp || 'N/A'}</p>
      <p><strong>Hosting:</strong> ${geo.hosting ? 'Sí' : 'No'}</p>
      <p><strong>Localización:</strong> ${geo.location || 'N/A'}</p>

      <div id="map" style="height:240px;border-radius:16px;margin-top:16px;"></div>
    </div>

    <!-- ===================== PLAYERS ===================== -->
    <details class="card glass">
      <summary>👥 Players (${players.length})</summary>
      <div style="max-height:320px;overflow:auto;">
        ${players.map(p => `
          <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);">
            ${p.name}
            <span style="float:right;opacity:.6">${p.ping}ms</span>
          </div>
        `).join('')}
      </div>
    </details>

    <!-- ===================== RESOURCES ===================== -->
    <details class="card glass">
      <summary>📦 Resources (${info.resourcesCount})</summary>
      <pre style="font-size:12px;max-height:300px;overflow:auto;">
${(info.resources || []).join('\n')}
      </pre>
    </details>

    <!-- ===================== VARS ===================== -->
    <details class="card glass">
      <summary>⚙️ Server Vars</summary>
      <pre style="font-size:12px;max-height:300px;overflow:auto;">
${JSON.stringify(info.vars || {}, null, 2)}
      </pre>
    </details>

    <!-- ===================== METADATA ===================== -->
    <details class="card glass">
      <summary>🧠 Metadata FiveM</summary>
      <p><strong>Versión servidor:</strong> ${info.serverVersion}</p>
      <p><strong>Última vez visto:</strong> ${info.lastSeen}</p>
      <p><strong>Upvote power:</strong> ${info.upvotePower}</p>
      <p><strong>Endpoints:</strong></p>
      <pre>${(info.connectEndPoints || []).join('\n')}</pre>
    </details>
  `;

  // ===================== MAP =====================
  if (geo.ip && typeof L !== 'undefined') {
    setTimeout(() => {
      const map = L.map("map").setView([40.4168, -3.7038], 9);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([40.4168, -3.7038]).addTo(map)
        .bindPopup(geo.location || 'Server location');
    }, 100);
  }
}
