export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // 1️⃣ Fetch sin seguir redirección
    const response = await fetch(url, {
      redirect: "manual"
    });

    // 2️⃣ Leer header REAL de FiveM
    const citizenUrl =
      response.headers.get("x-citizenfx-url") ||
      response.headers.get("X-CitizenFX-Url");

    if (!citizenUrl) {
      return res.status(400).json({ error: "Invalid cfx link" });
    }

    // 3️⃣ Extraer IP:PUERTO
    const match = citizenUrl.match(/connect\/(.+)/);
    if (!match) {
      return res.status(400).json({ error: "Could not extract server address" });
    }

    const address = match[1]; // ip:puerto

    // 4️⃣ API oficial FiveM
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${address}`;
    const serverRes = await fetch(apiUrl);
    const serverJson = await serverRes.json();

    if (!serverJson.Data) {
      return res.status(404).json({ error: "Server not found" });
    }

    // 5️⃣ Respuesta limpia
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
