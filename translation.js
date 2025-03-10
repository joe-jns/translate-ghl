// Charger le fichier JSON des traductions
async function loadTranslations() {
  const response = await fetch("translations.json");
  const translations = await response.json();
  return translations;
}

// Fonction pour remplacer les textes sur la page
function translateText(text, dictionary) {
  let translatedText = text;
  for (const [original, translated] of Object.entries(dictionary)) {
    const regex = new RegExp(`\\b${original}\\b`, "gi"); // Recherche mot entier insensible à la casse
    translatedText = translatedText.replace(regex, translated);
  }
  return translatedText;
}

// Fonction pour parcourir et modifier les nœuds texte
function translateNode(node, dictionary) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
    const newText = translateText(node.textContent, dictionary);
    if (newText !== node.textContent) {
      node.textContent = newText;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const child of node.childNodes) {
      translateNode(child, dictionary);
    }
  }
}

// Observer les changements en direct sur la page
const observer = new MutationObserver((mutations, observer) => {
  requestIdleCallback(() => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => translateNode(node, window.translationDictionary));
      } else if (mutation.type === "characterData") {
        mutation.target.textContent = translateText(mutation.target.textContent, window.translationDictionary);
      }
    });
  });
});

// Charger les traductions et observer les changements sur la page
loadTranslations().then((translations) => {
  window.translationDictionary = translations;
  translateNode(document.body, translations);

  // Démarrer l'observation du body
  requestIdleCallback(() => {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
});
