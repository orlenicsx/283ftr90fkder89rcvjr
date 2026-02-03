// js/main.js - VERSIÓN AUTO-CONTENIDA
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById("searchBtn");
  const cfxInput = document.getElementById("cfxInput");
  
  if (searchBtn) searchBtn.addEventListener("click", search);
  if (cfxInput) cfxInput.addEventListener("keypress", e => e.key === 'Enter' && search());

  window.search = search; // Global para debug
});

async function search() {
  const input = document.getElementById("cfxInput").value.trim();
  const results = document.getElementById("results");
  
  if (!input) {
    showMessage(results, "Introduce un enlace cfx.re/join", "error");
    return;
  }

  showMessage(results, "🔍 Analizando servidor...", "loading");

  try {
    // Extrae código flexible
    let joinCode = input.match(/join\/([a-z0-9]{4,8})/i)?.[1];
    if (!joinCode) {
      if (input.match(/^[a-z0-9]{4,8}$/i)) joinCode = input;
      else throw new Error("Formato inválido");
    }

    console.log('🔗 Buscando:', joinCode);
    
    const res = await fetch(`/api/resolve?url=https://cfx.re/join/${joinCode}`);
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText.slice(0,100)}`);
    }
    
    const data = await res.json();
    console.log('✅ Datos:', data);
    
    if (data.success) {
      renderResults(data, results);
    } else {
      throw new Error(data.error || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('💥', error);
    showMessage(results, `❌ ${error.message}`, "error");
  }
}

function showMessage(container, msg, type = "info") {
  const icons = {
    loading: "⏳",
    error: "❌",
    success: "✅"
  };
  container.innerHTML = `
    <div class="card glass" style="text-align:center;padding:40px;">
      <div style="font-size:24px;margin-bottom:10px;">${icons[type] || 'ℹ️'}</div>
      <div>${msg}</div>
    </div>
  `;
}

function renderResults(data, container) {
  const geo = data.osint || {};
  const players = data.topPlayers || [];
  
  container.innerHTML = `
    <div class="card glass" style="max-width:1000px;margin:0 auto;">
      <div style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start;">
        <div>
          <h2 style="margin:0;font-size:28px;">${data.hostname || data.name}</h2>
          <p style="color:#a1a8c3;margin:5px 0;">${data.vars?.sv_projectDesc?.slice(0,150) || ''}${data.vars?.sv_projectDesc?.length > 150 ? '...' : ''}</p>
          
          <div style="display:flex;flex-wrap:wrap;gap:15px;margin:20px 0;">
            <span class="badge">${data.playersLive}/${data.sv_maxclients} jugadores</span>
            <span class="badge">${data.resourcesCount} resources</span>
            <span class="badge">${Math.round(data.avgPing || 0)}ms ping</span>
            ${data.discord ? `<a href="${data.discord}" target="_blank" class="badge discord" style="background:#5865f2;">Discord</a>` : ''}
          </div>
          
          <div style="background:#1a1a1a;padding:15px;border-radius:8px;margin:15px 0;">
            <strong>IP: </strong><code>${data.address}</code>
            <a href="fivem://connect/${data.address}" class="btn-connect" style="margin-left:10px;">🚀 Conectar</a>
          </div>
        </div>
        
        ${data.iconBase64 ? `<img src="${data.iconBase64}" style="width:80px;height:80px;border-radius:12px;flex-shrink:0;">` : ''}
      </div>
      
      ${Object.keys(geo).length ? `
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #333;">
          <h3>📍 Ubicación</h3>
          <p><strong>Proveedor:</strong> ${geo.provider || geo.org || 'N/A'}</p>
          <p><strong>ISP:</strong> ${geo.isp || 'N/A'}</p>
          <p><strong>País:</strong> ${geo.country || 'N/A'}</p>
          <div id="tempMap" style="height:200px;border-radius:8px;margin-top:10px;"></div>
        </div>
      ` : ''}
      
      <details style="margin-top:20px;">
        <summary>Jugadores (${players.length})</summary>
        <div style="max-height:200px;overflow:auto;">
          ${players.map(p => `
            <div style="padding:8px 0;border-bottom:1px solid #333;">
              ${p.name} <span style="color:#888;float:right;">${p.ping}ms</span>
            </div>
          `).join('')}
        </div>
      </details>
    </div>
    
    <details class="card glass" style="max-width:1000px;margin:20px auto;">
      <summary>Resources (${data.resourcesCount || 0})</summary>
      <pre style="font-size:11px;max-height:300px;overflow:auto;">${(data.fullResources || []).slice(0,100).join(', ')}</pre>
    </details>
  `;

  // Mapa temporal
  if (geo.latitude && typeof L !== 'undefined') {
    setTimeout(() => {
      const map = L.map("tempMap").setView([geo.latitude, geo.longitude], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([geo.latitude, geo.longitude]).addTo(map)
        .bindPopup(`${geo.city}<br>${geo.provider}`);
    }, 100);
  }
}
