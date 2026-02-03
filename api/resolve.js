export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes("cfx.re/join")) {
    return res.status(400).json({ error: "Invalid cfx link" });
  }

  try {
    // 1️⃣ Resolver cfx.re
    const cfxRes = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "FiveM-IP-Finder" }
    });

    const citizenfx = cfxRes.headers.get("x-citizenfx-url");
    if (!citizenfx) {
      return res.status(404).json({ error: "Server IP not found" });
    }

    const ip = citizenfx.replace(/^https?:\/\//, "");

    // 2️⃣ Fetch servidor FiveM
    const infoPromise = fetch(`http://${ip}/info.json`).then(r => r.json());
    const playersPromise = fetch(`http://${ip}/players.json`)
      .then(r => r.json())
      .catch(() => []);

    // 3️⃣ Geo IP
    const geoPromise = fetch(
      `https://ipapi.co/${ip.split(":")[0]}/json/`
    ).then(r => r.json());

    const [info, players, geo] = await Promise.all([
      infoPromise,
      playersPromise,
      geoPromise
    ]);

    res.setHeader("Cache-Control", "s-maxage=60");
    res.json({ ip, info, players, geo });

  } catch (err) {
    res.status(500).json({ error: "Failed to analyze server" });
  }
}
