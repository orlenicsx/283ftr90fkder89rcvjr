const translations = {
  es: {
    title: "FiveM IP Finder",
    tagline: "Encuentra la IP real de cualquier servidor FiveM",
    placeholder: "Pega aquí tu enlace cfx.re/join...",
    search: "Buscar",
    rateLimit: "Demasiadas búsquedas, espera un momento"
  },
  en: {
    title: "FiveM IP Finder",
    tagline: "Find the real IP of any FiveM server",
    placeholder: "Paste your cfx.re/join link here...",
    search: "Search",
    rateLimit: "Too many requests, slow down"
  },
  fr: {
    title: "FiveM IP Finder",
    tagline: "Trouvez l'IP réelle d'un serveur FiveM",
    placeholder: "Collez votre lien cfx.re/join ici...",
    search: "Rechercher",
    rateLimit: "Trop de requêtes"
  },
  de: {
    title: "FiveM IP Finder",
    tagline: "Finde die echte IP eines FiveM-Servers",
    placeholder: "Füge deinen cfx.re/join Link ein...",
    search: "Suchen",
    rateLimit: "Zu viele Anfragen"
  }
};

function applyLanguage(lang) {
  localStorage.setItem("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = translations[lang][el.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = translations[lang][el.dataset.i18nPlaceholder];
  });
}

document.getElementById("languageSelect").addEventListener("change", e => {
  applyLanguage(e.target.value);
});

applyLanguage(localStorage.getItem("lang") || navigator.language.slice(0,2) || "en");
