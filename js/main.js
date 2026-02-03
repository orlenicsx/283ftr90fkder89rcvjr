// js/main.js NUEVO
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("searchBtn").addEventListener("click", search);
  document.getElementById("cfxInput").addEventListener("keypress", e => {
    if (e.key === 'Enter') search();
  });
});

async function search() {
  const input = document.getElementById("cfxInput").value.trim();
  const results = document.getElementById("results");

  // VALIDACIÓN
  if (!input) {
    showError(results, translations[localLang]?.rateLimit || "Introduce un enlace");
    return;
  }

  // EXTRAE joinCode (flexible)
  let joinCode = input.match(/join\/([a-z0-9]{4,8})/i)?.[1];
  if (!joinCode && input.includes('cfx.re')) {
    showError(results, "❌ Formato inválido. Usa: cfx.re/join/CODIGO");
    return;
  }

  showLoading(results, "🔍 Analizando servidor...");

  try {
    console.log('🔗 Fetching:', `/api/resolve?url=${encodeURIComponent(input)}`);
    
    const res = await fetch(`/api/resolve?url=${encodeURIComponent(input)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📡 Response status:', res.status, res.statusText);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    console.log('✅ Data:', data);

    if (!data.success) {
      throw new Error(data.error || 'API error');
    }

    // 🎨 Renderiza
    renderServer(data, data.osint, data.topPlayers, data.address);
    
  } catch (error) {
    console.error('💥 Error:', error);
    showError(results, `❌ Error: ${error.message}`);
  }
}
