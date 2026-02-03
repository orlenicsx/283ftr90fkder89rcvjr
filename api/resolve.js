export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const citizenUrl =
      response.headers.get("x-citizenfx-url") ||
      response.headers.get("X-CitizenFX-Url");

    if (!citizenUrl) {
      return res.status(400).json({ error: "Invalid cfx link" });
    }

    const address = citizenUrl
      .replace("http://", "")
      .replace("https://", "")
      .replace(/\/$/, "");

    if (!address.includes(":")) {
      return res.status(400).json({ error: "Could not extract server address" });
    }

    // 🔥 PRIMERO INFO DIRECTA DEL SERVIDOR (fallback principal)
    const infoUrl = `http://${address}/info.json`;
    const infoRes = await fetch(infoUrl, { timeout: 5000 });
    
    let serverData = {};
    if (infoRes.ok) {
      serverData = await infoRes.json();
    } else {
      // 🔄 SI NO, API OFICIAL
      const encodedAddress = encodeURIComponent(address);
      const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${encodedAddress}`;
      const apiRes = await fetch(apiUrl);
      const apiJson = await apiRes.json();
      
      if (apiJson.Data) {
        serverData = apiJson.Data;
      } else {
        return res.status(404).json({ error: "Server not found or offline" });
      }
    }

    // ✅ RESPUESTA UNIFICADA
    res.json({
      address,
      name: serverData.hostname || serverData.name || "Unknown",
      players: serverData.clients || serverData.clients || 0,
      maxPlayers: serverData.sv_maxclients || serverData.maxClients || 0,
      map: serverData.mapname || serverData.map || "Unknown",
      gametype: serverData.gametype || "Unknown",
      resources: serverData.resources ? serverData.resources.length : 0,
      tags: serverData.vars?.tags || serverData.tags || "",
      online: infoRes?.ok || !!serverData.hostname
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze server" });
  }
}
