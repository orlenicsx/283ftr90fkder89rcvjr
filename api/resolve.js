export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url?.includes('cfx.re/join')) return res.status(400).json({error:'CFX URL required'});

    const joinCode = url.match(/\/join\/([a-z0-9]{4,8})/i)?.[1];
    if (!joinCode) return res.status(400).json({error:'No join code found'});

    // 1️⃣ API OFICIAL (metadata + owner)
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${joinCode}`;
    const apiRes = await fetch(apiUrl);
    const api = await apiRes.json();
    if (!api.Data) return res.status(404).json({error:'Server not listed'});

    const apiData = api.Data;
    const address = apiData.connectEndPoints?.[0];

    // 2️⃣ 3 ENDPOINTS DIRECTOS (live data)
    const [infoRes, playersRes, dynamicRes] = await Promise.all([
      fetch(`http://${address}/info.json`).then(r=>r.ok?r.json():{}).catch(()=>({})),
      fetch(`http://${address}/players.json`).then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch(`http://${address}/dynamic.json`).then(r=>r.ok?r.json():{}).catch(()=>{})
    ]);

    // 🎯 EXTRAE TODO (de tus archivos)
    const result = {
      success: true,
      joinCode,
      address,
      timestamp: new Date().toISOString(),

      // 👑 API OFICIAL (único aquí)
      ownerName: apiData.ownerName,
      ownerID: apiData.ownerID,
      ownerAvatar: apiData.ownerAvatar,
      ownerProfile: apiData.ownerProfile,
      lastSeen: apiData.lastSeen,
      upvotePower: apiData.upvotePower,
      connectEndPoints: apiData.connectEndPoints,
      serverVersion: apiData.server,

      // 📊 INFO.JSON (22k chars → TODO parseado)
      hostname: infoRes.hostname || apiData.hostname || dynamicRes.hostname,
      clients: infoRes.clients || dynamicRes.clients || apiData.clients,
      sv_maxclients: infoRes.sv_maxclients || dynamicRes.sv_maxclients || apiData.sv_maxclients,
      resources: infoRes.resources || apiData.resources || [],
      resourcesCount: (infoRes.resources || apiData.resources || []).length,
      version: infoRes.version,
      enhancedHostSupport: infoRes.enhancedHostSupport,
      requestSteamTicket: infoRes.requestSteamTicket,
      vars: infoRes.vars || apiData.vars || {},

      // 🕐 DYNAMIC.JSON (live)
      liveMap: dynamicRes.mapname || dynamicRes.mapName,
      liveGametype: dynamicRes.gametype,
      liveHostname: dynamicRes.hostname,

      // 👥 PLAYERS.JSON (completo)
      playersLive: playersRes.length,
      playersOfficial: apiData.players?.length || 0,
      topPlayers: playersRes.slice(0, 20).map(p => ({
        name: p.name,
        id: p.id,
        ping: p.ping,
        endpoint: p.endpoint,
        identifiers: p.identifiers || []
      })),
      avgPing: playersRes.reduce((a, p) => a + p.ping, 0) / playersRes.length || 0,

      // 📈 STATS
      tags: [...new Set((infoRes.vars?.tags || apiData.vars?.tags || '').split(',').map(t=>t.trim()).filter(Boolean))],
      discord: infoRes.vars?.Discord || apiData.vars?.Discord,
      instagram: infoRes.vars?.Instagram,
      tiktok: infoRes.vars?.TikTok,
      txAdmin: infoRes.vars?.['txAdmin-version'],
      locale: infoRes.vars?.locale || 'es-ES',
      onesync: infoRes.vars?.onesync_enabled === 'true',
      gameBuild: infoRes.vars?.sv_enforceGameBuild,

      // 🎨 ICON/BANNERS (base64)
      iconBase64: infoRes.icon ? `data:image/png;base64,${infoRes.icon}` : null,
      bannerConnect: infoRes.vars?.banner_connecting,
      bannerDetail: infoRes.vars?.banner_detail
    };

    res.json(result);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
