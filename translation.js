(async function() {
  try {
    // 1. Charger le dictionnaire de traduction
    const url = 'https://cdn.jsdelivr.net/gh/joe-jns/translate-ghl@main/translations.json';
    console.log('Tentative de chargement depuis:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const translationDictionary = await response.json();
    console.log('Traductions chargées:', translationDictionary);
    window.translationDictionary = translationDictionary;
    
    // 2. Fonction pour échapper les caractères spéciaux dans les expressions régulières
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    
    // 3. Fonction pour traduire le texte
    function translateText(text) {
      if (!text || typeof text !== 'string') return text;
      
      let translatedText = text;
      for (const [original, translated] of Object.entries(translationDictionary)) {
        // Ignorer les entrées vides
        if (!original || !translated) continue;
        
        const safeOriginal = escapeRegExp(original);
        // Utiliser \b pour correspondre aux limites de mots et 'gi' pour une recherche globale insensible à la casse
        const regex = new RegExp(`\\b${safeOriginal}\\b`, "gi");
        translatedText = translatedText.replace(regex, translated);
      }
      return translatedText;
    }
    
    // 4. Fonction pour parcourir et modifier les nœuds texte
    function translateNode(node) {
      if (!node) return;
      
      // Traiter les nœuds texte
      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim().length > 0) {
        const newText = translateText(node.textContent);
        if (newText !== node.textContent) {
          node.textContent = newText;
        }
      } 
      // Traiter les éléments
      else if (node.nodeType === Node.ELEMENT_NODE) {
        // Ignorer les scripts, styles, inputs, et textareas
        const nodeName = node.nodeName.toLowerCase();
        if (nodeName === 'script' || nodeName === 'style' || 
            nodeName === 'input' || nodeName === 'textarea') {
          return;
        }
        
        // Traduire les attributs spécifiques
        if (node.hasAttribute('placeholder')) {
          node.setAttribute('placeholder', translateText(node.getAttribute('placeholder')));
        }
        if (node.hasAttribute('title')) {
          node.setAttribute('title', translateText(node.getAttribute('title')));
        }
        if (node.hasAttribute('alt')) {
          node.setAttribute('alt', translateText(node.getAttribute('alt')));
        }
        
        // Parcourir récursivement les enfants
        for (const child of node.childNodes) {
          translateNode(child);
        }
      }
    }
    
    // 5. Traduire tout le document
    console.log('Application des traductions à la page...');
    translateNode(document.body);
    
    // 6. Observer les changements futurs sur la page
    const observer = new MutationObserver((mutations) => {
      // Utiliser requestIdleCallback pour ne pas bloquer le thread principal
      requestIdleCallback(() => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => translateNode(node));
          } else if (mutation.type === "characterData") {
            if (mutation.target.parentNode) {
              const newText = translateText(mutation.target.textContent);
              if (newText !== mutation.target.textContent) {
                mutation.target.textContent = newText;
              }
            }
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
    
    // Démarrer l'observation
    observer.observe(document.body, observerConfig);
    
    console.log('Traduction de la page terminée et observateur actif');
  } catch (error) {
    console.error('Erreur lors du chargement/application des traductions:', error);
  }
})();