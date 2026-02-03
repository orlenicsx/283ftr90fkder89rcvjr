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

    // 🧠 LIMPIEZA TOTAL
    const clean = citizenUrl
      .replace("fivem://", "")
      .replace("connect/", "")
      .split("?")[0]
      .replace(/\/$/, "");

    if (!clean.includes(":")) {
      return res.status(400).json({
        error: "Could not extract server address",
        debug: citizenUrl
      });
    }

    const address = clean; // IP:PUERTO

    // API oficial FiveM
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${address}`;
    const serverRes = await fetch(apiUrl);
    const serverJson = await serverRes.json();

    if (!serverJson.Data) {
      return res.status(404).json({ error: "Server not found" });
    }

    res.json({
      address,
      name: serverJson.Data.hostname,
      players: serverJson.Data.clients,
      maxPlayers: serverJson.Data.sv_maxclients,
      map: serverJson.Data.mapname,
      gametype: serverJson.Data.gametype,
      tags: serverJson.Data.vars?.tags || ""
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze server" });
  }
}
