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
    const safeInfo = infoRes || {};
const safeDynamic = dynamicRes || {};

const result = {
  success: true,
  joinCode,
  address,
  timestamp: new Date().toISOString(),

  // 👑 API OFICIAL
  ownerName: apiData.ownerName,
  ownerID: apiData.ownerID,
  ownerAvatar: apiData.ownerAvatar,
  ownerProfile: apiData.ownerProfile,
  lastSeen: apiData.lastSeen,
  upvotePower: apiData.upvotePower,
  connectEndPoints: apiData.connectEndPoints,
  serverVersion: apiData.server,

  // 📊 INFO / DYNAMIC
  hostname: safeInfo.hostname || safeDynamic.hostname || apiData.hostname,
  sv_maxclients: safeInfo.sv_maxclients || safeDynamic.sv_maxclients || apiData.sv_maxclients || 0,

  resources: safeInfo.resources || apiData.resources || [],
  resourcesCount: (safeInfo.resources || apiData.resources || []).length,

  version: safeInfo.version,
  enhancedHostSupport: safeInfo.enhancedHostSupport,
  requestSteamTicket: safeInfo.requestSteamTicket,
  vars: safeInfo.vars || apiData.vars || {},

  // 🕐 LIVE
  liveMap: safeDynamic.mapname || safeDynamic.mapName,
  liveGametype: safeDynamic.gametype,

  // 👥 PLAYERS (ÚNICA FUENTE REAL)
  playersLive: playersRes.length,
  topPlayers: playersRes.slice(0, 20).map(p => ({
    name: p.name,
    id: p.id,
    ping: p.ping,
    endpoint: p.endpoint,
    identifiers: p.identifiers || []
  })),
  avgPing: playersRes.reduce((a, p) => a + p.ping, 0) / (playersRes.length || 1),

  // 📈 EXTRAS
  tags: [...new Set((safeInfo.vars?.tags || apiData.vars?.tags || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean))],

  discord: safeInfo.vars?.Discord || apiData.vars?.Discord,
  instagram: safeInfo.vars?.Instagram,
  tiktok: safeInfo.vars?.TikTok,
  txAdmin: safeInfo.vars?.['txAdmin-version'],
  locale: safeInfo.vars?.locale || 'es-ES',
  onesync: safeInfo.vars?.onesync_enabled === 'true',
  gameBuild: safeInfo.vars?.sv_enforceGameBuild,

  // 🎨 ICON
  iconBase64: safeInfo.icon ? `data:image/png;base64,${safeInfo.icon}` : null,
  bannerConnect: safeInfo.vars?.banner_connecting,
  bannerDetail: safeInfo.vars?.banner_detail
};

    
    // 🗺️ IP OSINT (LEGAL)
    const ip = address.split(':')[0];
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,org,isp,hosting,country,regionName,city`);
    const geo = await geoRes.json();
    
    // 🔍 DNS reverso
    const reverse = await fetch(`https://dns.google/resolve?name=${ip}`);
    const dnsData = await reverse.json();

    res.json({
    ...result,
    osint: {
      ip: ip,
      provider: geo.org || "Unknown",
      isp: geo.isp,
      hosting: geo.hosting,
      location: `${geo.city}, ${geo.regionName}, ${geo.country}`,
      reverseDNS: dnsData.Answer || []
    }
  });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
  
}

