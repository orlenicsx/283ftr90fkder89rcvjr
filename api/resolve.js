export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // 1️⃣ Seguir la redirección de cfx.re
    const response = await fetch(url, {
      redirect: "follow"
    });

    const finalUrl = response.url;

    // 2️⃣ Extraer IP:PUERTO
    const match = finalUrl.match(/connect=([^&]+)/);
    if (!match) {
      return res.status(400).json({ error: "Invalid cfx link" });
    }

    const address = match[1]; // ip:puerto

    // 3️⃣ Consultar API oficial de FiveM
    const apiUrl = `https://servers-frontend.fivem.net/api/servers/single/${address}`;
    const serverRes = await fetch(apiUrl);
    const serverData = await serverRes.json();

    if (!serverData.Data) {
      return res.status(404).json({ error: "Server not found" });
    }

    // 4️⃣ Devolver datos limpios
    res.json({
      name: serverData.Data.hostname,
      players: serverData.Data.clients,
      maxPlayers: serverData.Data.sv_maxclients,
      map: serverData.Data.mapname,
      gametype: serverData.Data.gametype,
      address
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze server" });
  }
}

