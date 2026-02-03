// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById("searchBtn");
  const cfxInput = document.getElementById("cfxInput");

  if (searchBtn) searchBtn.addEventListener("click", search);
  if (cfxInput) cfxInput.addEventListener("keypress", e => {
    if (e.key === "Enter") search();
  });

  window.search = search; // debug
});

async function search() {
  const input = document.getElementById("cfxInput").value.trim();
  const results = document.getElementById("results");

  if (!input) {
    showMessage(results, "Introduce un enlace cfx.re/join o un join code", "error");
    return;
  }

  showMessage(results, "🔍 Analizando servidor...", "loading");

  try {
    // Extraer join code (link o código)
    let joinCode = input.match(/join\/([a-z0-9]{4,8})/i)?.[1];
    if (!joinCode) {
      if (/^[a-z0-9]{4,8}$/i.test(input)) {
        joinCode = input;
      } else {
        throw new Error("Formato inválido");
      }
    }

    console.log("🔗 Join code:", joinCode);

    const res = await fetch(`/api/resolve?url=https://cfx.re/join/${joinCode}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const data = await res.json();
    console.log("✅ Datos:", data);

    if (!data.success) {
      throw new Error(data.error || "No se pudo resolver el servidor");
    }

    // 🔥 RENDER ÚNICO (ui.js)
    renderServer(
      data,              // info
      data.osint || {},  // geo
      data.topPlayers || [],
      data.address       // ip
    );

  } catch (err) {
    console.error("💥", err);
    showMessage(results, `❌ ${err.message}`, "error");
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
      <div style="font-size:26px;margin-bottom:12px;">
        ${icons[type] || "ℹ️"}
      </div>
      <div>${msg}</div>
    </div>
  `;
}
