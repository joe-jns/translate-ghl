// Charger les traductions depuis le fichier .po
async function loadTranslations(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
      const poContent = await response.text();
      return parsePO(poContent);
    } catch (error) {
      console.error("❌ Erreur lors du chargement du fichier .po :", error);
      return {};
    }
  }
  
  // Parser le `.po` et générer la bibliothèque de traduction
  function parsePO(content) {
    const translationDict = {};
    const regex = /msgid\s+"(.*)"\s+msgstr\s+"(.*)"/g;
    let match;
  
    while ((match = regex.exec(content)) !== null) {
      translationDict[match[1].trim()] = match[2].trim();
    }
  
    console.log("📖 Dictionnaire chargé :", translationDict);
    return translationDict;
  }
  
  // Fonction pour remplacer les mots dans une chaîne de texte
  function translateText(text) {
    let translatedText = text;
    for (const [original, translated] of Object.entries(window.translationDictionary)) {
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
          mutation.target.textContent = translateText(mutation.target.textContent);
        }
      });
    });
  });
  
  // Charger et appliquer la traduction
  (async function () {
    const poUrl = "https://raw.githubusercontent.com/joe-jns/translate-ghl/main/translations.po"; // Remplace par ton URL
    window.translationDictionary = await loadTranslations(poUrl);
  
    if (Object.keys(window.translationDictionary).length === 0) {
      console.error("⚠️ Dictionnaire vide ! Vérifie le fichier .po !");
      return;
    }
  
    requestIdleCallback(() => {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      translateNode(document.body); // Traduire le contenu initial
      console.log("✅ Traduction activée avec succès !");
    });
  })();
  