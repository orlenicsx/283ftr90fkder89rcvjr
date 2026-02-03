export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const citizenUrl =
      response.headers.get("x-citizenfx-url") ||
      response.headers.get("X-CitizenFX-Url");

    if (!citizenUrl) {
      return res.status(400).json({ error: "Invalid cfx link" });
    }

    // 🧠 EXTRAER IP:PUERTO DESDE URL HTTP
    const address = citizenUrl
      .replace("http://", "")
      .replace("https://", "")
      .replace(/\/$/, "");

    if (!address.includes(":")) {
      return res.status(400).json({ error: "Could not extract server address" });
    }

    // 🔥 API oficial FiveM
    const encodedAddress = encodeURIComponent(address);
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${encodedAddress}`;

    const serverRes = await fetch(apiUrl);
    const serverJson = await serverRes.json();

    if (!serverJson.Data) {
      return res.status(404).json({ error: "Server not found" });
    }

    // ✅ RESPUESTA LIMPIA
    res.json({
      address,
      name: serverJson.Data.hostname,
      players: serverJson.Data.clients,
      maxPlayers: serverJson.Data.sv_maxclients,
      map: serverJson.Data.mapname,
      gametype: serverJson.Data.gametype,
      resources: serverJson.Data.resources?.length || 0,
      tags: serverJson.Data.vars?.tags || ""
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze server" });
  }
}

