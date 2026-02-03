const form = document.getElementById("searchForm");
const input = document.getElementById("cfxInput");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = input.value.trim();
  if (!url) return;

  status.textContent = "Analizando servidor...";
  status.className = "loading";

  try {
    const res = await fetch(`/api/resolve?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!data.success) {
      status.textContent = data.error || "Error desconocido";
      status.className = "error";
      return;
    }

    status.textContent = "Servidor analizado correctamente";
    status.className = "success";

    renderServer(data); // 🔥 ui.js
  } catch (err) {
    status.textContent = "Error de conexión";
    status.className = "error";
  }
});
