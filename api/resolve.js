export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "No URL" });

    const joinMatch = url.match(/\/join\/([a-z0-9]{4,8})(?:\?|$)/i);
    if (!joinMatch) return res.status(400).json({ error: "Invalid cfx link" });
    
    const joinCode = joinMatch[1];
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(joinCode)}`;
    const apiRes = await fetch(apiUrl);
    const apiJson = await apiRes.json();

    if (!apiJson.Data) {
      return res.status(404).json({ error: "Server not found", code: joinCode });
    }

    const data = apiJson.Data;
    const address = data.connectEndPoints?.[0];

    // 🔥 DATOS EXTRA DIRECTOS DEL SERVER
    const [infoRes, playersRes, dynamicRes] = await Promise.all([
      fetch(`http://${address}/info.json`).catch(()=>null),
      fetch(`http://${address}/players.json`).catch(()=>null),
      fetch(`http://${address}/dynamic.json`).catch(()=>null)
    ]);

    const fullInfo = infoRes?.ok ? await infoRes.json() : {};
    const fullPlayers = playersRes?.ok ? await playersRes.json() : [];
    const dynamic = dynamicRes?.ok ? await dynamicRes.json() : {};

    res.json({
      success: true,
      joinCode,
      address,
      basic: {
        name: data.hostname,
        players: data.clients,
        maxPlayers: data.sv_maxclients,
        map: data.mapname || dynamic.mapName,
        gametype: data.gametype || dynamic.gametype,
        resources: data.resources?.length || fullInfo.resources?.length || 0,
        tags: data.vars?.tags || "",
        discord: data.vars?.Discord
      },
      playersList: data.players?.slice(0, 20) || fullPlayers.slice(0, 20),
      fullResources: fullInfo.resources || data.resources || [],
      version: fullInfo.version || data.server,
      owner: data.ownerName,
      txAdmin: data.vars?.['txAdmin-version']
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
