let searches = [];

document.getElementById("searchBtn").addEventListener("click", async () => {
  const input = document.getElementById("cfxInput").value.trim();
  const results = document.getElementById("results");
  const rateMsg = document.getElementById("rateLimitMsg");

  const now = Date.now();
  searches = searches.filter(t => now - t < 60000);

  if (searches.length >= 3) {
    rateMsg.textContent = translations[localStorage.lang].rateLimit;
    rateMsg.classList.remove("hidden");
    return;
  }

  rateMsg.classList.add("hidden");
  searches.push(now);
  showLoading(results);

  try {
    // Fetch CFX via proxy
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(input)}`;
    const res = await fetch(proxy);
    const citizenfx = res.headers.get("X-Citizenfx-Url");

    if (!citizenfx) throw "No se pudo obtener la IP";

    const ip = citizenfx.replace("http://", "").replace("https://", "");

    const info = await fetch(`https://${ip}/info.json`).then(r => r.json());
    const geo = await fetch(`https://ipapi.co/${ip.split(":")[0]}/json/`).then(r => r.json());

    renderServer(info, geo);

  } catch (e) {
    showError(results, "❌ Error obteniendo datos del servidor");
  }
});
