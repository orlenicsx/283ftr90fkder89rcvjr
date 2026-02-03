export default async function handler(req, res) {
  try {
    const { url } = req.query;
    console.log('🔍 Input URL:', url); // LOG 1

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const citizenUrl = response.headers.get("x-citizenfx-url") || response.headers.get("X-CitizenFX-Url");
    console.log('🌐 CitizenFX URL:', citizenUrl); // LOG 2

    if (!citizenUrl) {
      return res.status(400).json({ error: "Invalid cfx link - no citizenfx header" });
    }

    let address = citizenUrl
      .replace("http://", "")
      .replace("https://", "")
      .replace(/\/$/, "");
    console.log('📍 Extracted address:', address); // LOG 3

    if (!address.includes(":")) {
      return res.status(400).json({ error: "Could not extract server address: " + address });
    }

    // 🔥 INFO DIRECTA PRIMERO (más fiable)
    const infoUrl = `http://${address}/info.json`;
    console.log('🔗 Trying info.json:', infoUrl); // LOG 4
    const infoController = new AbortController();
    setTimeout(() => infoController.abort(), 8000); // 8s timeout

    let serverData = null;
    try {
      const infoRes = await fetch(infoUrl, { 
        signal: infoController.signal,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (infoRes.ok) {
        serverData = await infoRes.json();
        console.log('✅ Got info.json:', serverData.hostname); // LOG 5
      }
    } catch (infoErr) {
      console.log('❌ info.json failed:', infoErr.message);
    }

    // 🔄 FALLBACK API OFICIAL
    if (!serverData || !serverData.hostname) {
      const encodedAddress = encodeURIComponent(address);
      const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${encodedAddress}`;
      console.log('🔄 Trying official API:', apiUrl); // LOG 6
      
      const apiRes = await fetch(apiUrl);
      const apiJson = await apiRes.json();
      console.log('📊 Official API response:', apiJson); // LOG 7 CRUCIAL
      
      if (apiJson.Data && apiJson.Data.hostname) {
        serverData = apiJson.Data;
      } else {
        return res.status(404).json({ error: "Server not found or offline", debug: { address, apiResponse: apiJson } });
      }
    }

    // ✅ RESPUESTA
    res.json({
      success: true,
      address,
      name: serverData.hostname || "Unknown",
      players: serverData.clients ?? 0,
      maxPlayers: serverData.sv_maxclients ?? 0,
      map: serverData.mapname ?? "Unknown",
      gametype: serverData.gametype ?? "Unknown",
      resources: Array.isArray(serverData.resources) ? serverData.resources.length : 0,
      tags: serverData.vars?.tags ?? "",
      online: !!serverData.hostname
    });

  } catch (err) {
    console.error('💥 Full error:', err);
    res.status(500).json({ error: "Failed", debug: err.message });
  }
}
