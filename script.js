const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const languageSelect = document.querySelector(".language-select");
const translations = window.VAZCRAFT_TRANSLATIONS;

if (!translations) {
  throw new Error("VAZcraft translations were not loaded.");
}

function applyLanguage(language) {
  const dictionary = translations[language];
  if (!dictionary) {
    throw new Error(`Missing VAZcraft translations for language "${language}".`);
  }

  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (!(key in dictionary)) {
      throw new Error(`Missing translation "${key}" for language "${language}".`);
    }
    element.textContent = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (!(key in dictionary)) {
      throw new Error(`Missing translation "${key}" for language "${language}".`);
    }
    element.innerHTML = dictionary[key];
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(/\s+/).forEach((mapping) => {
      const [attribute, key] = mapping.split(":");
      if (!(key in dictionary)) {
        throw new Error(`Missing translation "${key}" for language "${language}".`);
      }
      element.setAttribute(attribute, dictionary[key]);
    });
  });

  if (menuToggle) {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-label", dictionary[isOpen ? "menuClose" : "menuOpen"]);
  }

  if (languageSelect) {
    languageSelect.value = language;
  }
}

let currentLanguage = "ru";
try {
  const savedLanguage = window.localStorage.getItem("vazcraft-language");
  if (savedLanguage && savedLanguage in translations) {
    currentLanguage = savedLanguage;
  }
} catch (error) {
  console.warn("Could not read the saved VAZcraft language preference.", error);
}

applyLanguage(currentLanguage);

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    const nextIsOpen = !isOpen;
    menuToggle.setAttribute("aria-expanded", String(nextIsOpen));
    menuToggle.setAttribute("aria-label", translations[currentLanguage][nextIsOpen ? "menuClose" : "menuOpen"]);
    mainNav.classList.toggle("is-open", nextIsOpen);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", translations[currentLanguage].menuOpen);
      mainNav.classList.remove("is-open");
    }
  });
}

if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    currentLanguage = languageSelect.value;
    applyLanguage(currentLanguage);
    if (menuToggle && mainNav) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", translations[currentLanguage].menuOpen);
      mainNav.classList.remove("is-open");
    }
    try {
      window.localStorage.setItem("vazcraft-language", currentLanguage);
    } catch (error) {
      console.warn("Could not save the VAZcraft language preference.", error);
    }
  });
}
