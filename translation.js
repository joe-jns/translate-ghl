// Fonction pour charger le fichier .po
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
  
  // Fonction pour parser un fichier .po et créer un dictionnaire
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
  function translateText(text, dictionary) {
    let translatedText = text;
    for (const [original, translated] of Object.entries(dictionary)) {
      const regex = new RegExp(`\\b${original}\\b`, "gi"); // Recherche du mot entier (insensible à la casse)
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
  const observer = new MutationObserver((mutations) => {
    requestIdleCallback(() => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => translateNode(node, window.translationDict));
        if (mutation.type === "characterData") {
          mutation.target.textContent = translateText(mutation.target.textContent, window.translationDict);
        }
      });
    });
  });
  
  // Charger et appliquer la traduction
  (async function () {
    const poUrl = "https://raw.githubusercontent.com/joe-jns/translate-ghl/main/translations.po"; // Remplace par ton URL
    window.translationDict = await loadTranslations(poUrl);
  
    if (Object.keys(window.translationDict).length === 0) {
      console.error("⚠️ Dictionnaire vide ! Vérifie le fichier .po !");
      return;
    }
  
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    translateNode(document.body, window.translationDict);
    console.log("✅ Traduction activée avec succès !");
  })();
  