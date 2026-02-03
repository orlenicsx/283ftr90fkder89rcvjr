export default async function handler(req, res) {
  try {
    const { url } = req.query;
    console.log('🔍 URL:', url);

    if (!url) return res.status(400).json({ error: "No URL provided" });

    const response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });

    const citizenUrl = response.headers.get("x-citizenfx-url") || response.headers.get("X-CitizenFX-Url");
    if (!citizenUrl) return res.status(400).json({ error: "Invalid cfx link" });

    const address = citizenUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    console.log('📍 Address:', address);

    if (!address.includes(':')) return res.status(400).json({ error: "Bad address: " + address });

    // 🔥 INFO.JSON (FUNCIONA EN TU CASO)
    const infoUrl = `http://${address}/info.json`;
    const infoRes = await fetch(infoUrl, { 
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0" }
    }).catch(() => null);

    let data = infoRes?.ok ? await infoRes.json() : {};

    // 💾 PLAYERS.JSON (lista jugadores)
    const playersUrl = `http://${address}/players.json`;
    const playersRes = await fetch(playersUrl, { 
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0" }
    }).catch(() => null);
    const players = playersRes?.ok ? await playersRes.json() : [];

    // ⚡ DYNAMIC.JSON (vars extras)
    const dynamicUrl = `http://${address}/dynamic.json`;
    const dynamicRes = await fetch(dynamicUrl, { 
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0" }
    }).catch(() => null);
    const dynamic = dynamicRes?.ok ? await dynamicRes.json() : {};

    // ✅ RESPUESTA COMPLETA (incluso sin lista oficial)
    res.json({
      success: true,
      address,
      status: {
        online: !!data.hostname,
        infoAvailable: !!data.hostname,
        playersAvailable: players.length > 0
      },
      server: {
        name: data.hostname || 'Unknown',
        players: data.clients ?? players.length ?? 0,
        maxPlayers: data.sv_maxclients ?? data.maxClients ?? 0,
        map: data.mapname ?? dynamic.mapName ?? 'Unknown',
        gametype: data.gametype ?? dynamic.gametype ?? 'Unknown',
        resources: data.resources?.length ?? 0,
        tags: data.vars?.tags ?? dynamic.tags ?? '',
        version: data.version ?? dynamic.version ?? 'Unknown'
      },
      players: players.slice(0, 10), // Primeros 10
      resources: data.resources?.slice(0, 20) ?? [] // Primeros 20
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
