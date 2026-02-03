export default async function handler(req, res) {
  try {
    const { url } = req.query;  // ← Esto lo pillas
    console.log('Input:', url);

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // 🔍 Extrae joinCode de cfx.re/join/XXXXXX
    const joinMatch = url.match(/\/join\/([a-z0-9]{4,8})(?:\?|$)/i);
    if (!joinMatch) {
      return res.status(400).json({ error: "No valid cfx.re/join code found" });
    }
    const joinCode = joinMatch[1];
    console.log('Join code:', joinCode);

    // 🔥 API oficial con joinCode
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(joinCode)}`;
    const apiRes = await fetch(apiUrl);
    const apiJson = await apiRes.json();

    console.log('API response:', apiJson);

    if (!apiJson.Data) {
      return res.status(404).json({ 
        error: "Server not found", 
        debug: { joinCode, apiResponse: apiJson } 
      });
    }

    const data = apiJson.Data;
    res.json({
      success: true,
      joinCode,
      address: data.connectEndPoints?.[0],
      name: data.hostname,
      players: data.clients,
      maxPlayers: data.sv_maxclients,
      map: data.mapname,
      gametype: data.gametype,
      resources: data.resources?.length || 0,
      tags: data.vars?.tags || "",
      playersList: data.players?.slice(0, 10) || [],
      discord: data.vars?.Discord
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
