// En vez de sacar x-citizenfx-url y convertir a IP, usa directamente el join code que te llega
export default async function handler(req, res) {
  try {
    const { joinCode } = req.query; // p.ej: 6jd6o6

    if (!joinCode) {
      return res.status(400).json({ error: "No joinCode provided" });
    }

    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(joinCode)}`;
    const serverRes = await fetch(apiUrl);
    const serverJson = await serverRes.json();

    if (!serverJson.Data) {
      return res.status(404).json({ error: "Server not found", raw: serverJson });
    }

    const data = serverJson.Data;

    res.json({
      address: data.connectEndPoints?.[0] || null,
      name: data.hostname,
      players: data.clients,
      maxPlayers: data.sv_maxclients,
      map: data.mapname,
      gametype: data.gametype,
      resources: data.resources?.length || 0,
      tags: data.vars?.tags || "",
      playersList: data.players || []
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed", debug: err.message });
  }
}
