// Bibliothèque de traduction
let translationDictionary = {};

// Fonction pour charger le dictionnaire de traduction depuis un fichier JSON
async function loadTranslations() {
  try {
    const response = await fetch('translations.json');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    translationDictionary = await response.json();
    console.log('Traductions chargées avec succès');
    
    // Une fois les traductions chargées, commencer la traduction de la page
    translateNode(document.body);
    startObserver();
  } catch (error) {
    console.error('Erreur lors du chargement des traductions:', error);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Échappe les caractères spéciaux
}

// Fonction pour remplacer les mots dans une chaîne de texte
function translateText(text) {
  if (!text || typeof text !== 'string') return text;
  
  let translatedText = text;
  for (const [original, translated] of Object.entries(translationDictionary)) {
    const safeOriginal = escapeRegExp(original); // Échapper les caractères spéciaux
    const regex = new RegExp(`\\b${safeOriginal}\\b`, "gi"); 
    translatedText = translatedText.replace(regex, translated);
  }
  return translatedText;
}

// Fonction pour parcourir et modifier les nœuds texte
function translateNode(node) {
  if (!node) return;
  
  if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim().length > 0) {
    const newText = translateText(node.textContent);
    if (newText !== node.textContent) {
      node.textContent = newText;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Ignorer les scripts, styles, inputs, et textareas
    const nodeName = node.nodeName.toLowerCase();
    if (nodeName === 'script' || nodeName === 'style' || 
        nodeName === 'input' || nodeName === 'textarea') {
      return;
    }
    
    // Traduire les attributs spécifiques (placeholder, title, alt)
    if (node.hasAttribute('placeholder')) {
      node.setAttribute('placeholder', translateText(node.getAttribute('placeholder')));
    }
    if (node.hasAttribute('title')) {
      node.setAttribute('title', translateText(node.getAttribute('title')));
    }
    if (node.hasAttribute('alt')) {
      node.setAttribute('alt', translateText(node.getAttribute('alt')));
    }
    
    // Parcourir les enfants
    for (const child of node.childNodes) {
      translateNode(child);
    }
  }
}

// Observer les changements en direct sur la page sans surcharge excessive
function startObserver() {
  const observer = new MutationObserver((mutations) => {
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

  // Démarrer l'observation du body
  observer.observe(document.body, observerConfig);
}

// Charger les traductions au démarrage
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();
});

// Si le DOM est déjà chargé
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  loadTranslations();
}