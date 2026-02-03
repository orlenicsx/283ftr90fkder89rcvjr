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

    // 🔍 Capturamos TODOS los headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // ⛔ RESPONDEMOS AQUÍ A PROPÓSITO
    return res.json({
      status: "DEBUG",
      responseStatus: response.status,
      headers
    });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to analyze server",
      message: err.message,
      stack: err.stack
    });
  }
}
