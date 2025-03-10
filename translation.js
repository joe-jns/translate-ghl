// Bibliothèque de traduction
const translationDictionary = {
  "Invoices": "Factures",
  "Join a Group": "Rejoindre un groupe",
  "Take a course": "Suivre un cours",
  "Check Affiliate Earnings": "Vérifier les gains d'affiliation",
  "Manage Subscriptions": "Gérer les abonnements"
};

// Fonction pour remplacer les mots dans une chaîne de texte
function translateText(text) {
  let translatedText = text;
  for (const [original, translated] of Object.entries(translationDictionary)) {
    const regex = new RegExp(`\\b${original}\\b`, "gi"); // Recherche du mot entier (insensible à la casse)
    translatedText = translatedText.replace(regex, translated);
  }
  return translatedText;
}

// Fonction pour parcourir et modifier les nœuds texte
function translateNode(node) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
    const newText = translateText(node.textContent);
    if (newText !== node.textContent) {
      node.textContent = newText;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const child of node.childNodes) {
      translateNode(child);
    }
  }
}

// Observer les changements en direct sur la page sans surcharge excessive
const observer = new MutationObserver((mutations) => {
  requestIdleCallback(() => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => translateNode(node));
      } else if (mutation.type === "characterData") {
        mutation.target.textContent = translateText(
          mutation.target.textContent
        );
      }
    });
  });
});

// Options pour l'observateur
const observerConfig = {
  childList: true,
  subtree: true,
  characterData: true,
};

// Démarrer l'observation du body sans bloquer la page
requestIdleCallback(() => {
  observer.observe(document.body, observerConfig);
  translateNode(document.body); // Traduire le contenu initial
});
