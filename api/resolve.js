export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url || !url.includes("cfx.re/join")) {
      return res.status(400).json({ error: "Invalid cfx link" });
    }

    const response = await fetch(url, {
      redirect: "manual"
    });

    const citizenfx = response.headers.get("x-citizenfx-url");

    if (!citizenfx) {
      return res.status(404).json({ error: "IP not found" });
    }

    const ip = citizenfx.replace("http://", "").replace("https://", "");

    const [info, players, geo] = await Promise.all([
      fetch(`http://${ip}/info.json`).then(r => r.json()),
      fetch(`http://${ip}/players.json`).then(r => r.json()).catch(() => []),
      fetch(`https://ipapi.co/${ip.split(":")[0]}/json/`).then(r => r.json())
    ]);

    res.json({
      ip,
      info,
      players,
      geo
    });

  } catch (e) {
    res.status(500).json({ error: "Server lookup failed" });
  }
}
