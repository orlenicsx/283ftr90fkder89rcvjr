document.getElementById("searchBtn").addEventListener("click", async () => {
  const input = document.getElementById("cfxInput").value.trim();
  const results = document.getElementById("results");

  if (!input.includes("cfx.re/join")) {
    showError(results, "❌ Enlace cfx.re inválido");
    return;
  }

  showLoading(results);

  try {
    const res = await fetch(
      `/api/resolve?url=${encodeURIComponent(input)}`
    );

    if (!res.ok) throw new Error();

    const data = await res.json();
    if (!data.success) throw new Error();

    // FIX: pasa datos correctos
    renderServer(
      data,           // ← info completa
      data.osint,     // ← geo
      data.topPlayers,// ← players  
      data.address    // ← ip
    );

  } catch (e) {
    showError(results, "❌ No se pudo analizar el servidor");
  }
});
