(async function () {
  // Variables globales
  let translationDictionary = {};
  let observer = null;
  let originalTextMap = new Map(); // Pour stocker le texte original

  // 2. Fonction pour échapper les caractères spéciaux dans les expressions régulières
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // 3. Fonction pour traduire le texte
  function translateText(text) {
    if (!text || typeof text !== "string") return text;

    let translatedText = text;
    for (const [original, translated] of Object.entries(
      translationDictionary
    )) {
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
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent &&
      node.textContent.trim().length > 0
    ) {
      // Sauvegarder le texte original si ce n'est pas déjà fait
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.textContent);
      }

      const newText = translateText(node.textContent);
      if (newText !== node.textContent) {
        node.textContent = newText;
      }
    }
    // Traiter les éléments
    else if (node.nodeType === Node.ELEMENT_NODE) {
      // Ignorer les scripts, styles, inputs, et textareas
      const nodeName = node.nodeName.toLowerCase();
      if (
        nodeName === "script" ||
        nodeName === "style" ||
        nodeName === "input" ||
        nodeName === "textarea"
      ) {
        return;
      }

      // Traduire les attributs spécifiques
      if (node.hasAttribute("placeholder")) {
        // Sauvegarder l'attribut original
        const attrKey = `placeholder-${node.outerHTML.slice(0, 50)}`;
        if (!originalTextMap.has(attrKey)) {
          originalTextMap.set(attrKey, node.getAttribute("placeholder"));
        }
        node.setAttribute(
          "placeholder",
          translateText(node.getAttribute("placeholder"))
        );
      }

      if (node.hasAttribute("title")) {
        // Sauvegarder l'attribut original
        const attrKey = `title-${node.outerHTML.slice(0, 50)}`;
        if (!originalTextMap.has(attrKey)) {
          originalTextMap.set(attrKey, node.getAttribute("title"));
        }
        node.setAttribute("title", translateText(node.getAttribute("title")));
      }

      if (node.hasAttribute("alt")) {
        // Sauvegarder l'attribut original
        const attrKey = `alt-${node.outerHTML.slice(0, 50)}`;
        if (!originalTextMap.has(attrKey)) {
          originalTextMap.set(attrKey, node.getAttribute("alt"));
        }
        node.setAttribute("alt", translateText(node.getAttribute("alt")));
      }

      // Parcourir récursivement les enfants
      for (const child of node.childNodes) {
        translateNode(child);
      }
    }
  }

  // 5. Démarrer la traduction et l'observation
  function startTranslation() {
    // Traduire tout le document
    console.log("Application des traductions à la page...");
    translateNode(document.body);

    // Observer les changements futurs sur la page
    observer = new MutationObserver((mutations) => {
      // Utiliser requestIdleCallback pour ne pas bloquer le thread principal
      requestIdleCallback(() => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => translateNode(node));
          } else if (mutation.type === "characterData") {
            if (mutation.target.parentNode) {
              const newText = translateText(mutation.target.textContent);
              if (newText !== mutation.target.textContent) {
                // Sauvegarder le texte original si ce n'est pas déjà fait
                if (!originalTextMap.has(mutation.target)) {
                  originalTextMap.set(
                    mutation.target,
                    mutation.target.textContent
                  );
                }
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

    console.log("Traduction de la page terminée et observateur actif");
  }

  // 6. Arrêter la traduction et l'observation
  function stopTranslation() {
    if (observer) {
      observer.disconnect();
      observer = null;
      console.log("Traduction désactivée");
    }
  }

  // Fonction pour restaurer le texte original
  function restoreOriginalText() {
    console.log("Restauration du texte original...");

    // Parcourir la page et restaurer le texte d'origine
    const allNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let currentNode;
    while ((currentNode = allNodes.nextNode())) {
      // Restaurer les nœuds texte
      if (currentNode.nodeType === Node.TEXT_NODE) {
        if (originalTextMap.has(currentNode)) {
          currentNode.textContent = originalTextMap.get(currentNode);
        }
      }
      // Restaurer les attributs des éléments
      else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        // Ignorer les scripts, styles, inputs, et textareas
        const nodeName = currentNode.nodeName.toLowerCase();
        if (
          nodeName === "script" ||
          nodeName === "style" ||
          nodeName === "input" ||
          nodeName === "textarea"
        ) {
          continue;
        }

        // Restaurer les attributs
        if (currentNode.hasAttribute("placeholder")) {
          const attrKey = `placeholder-${currentNode.outerHTML.slice(0, 50)}`;
          if (originalTextMap.has(attrKey)) {
            currentNode.setAttribute(
              "placeholder",
              originalTextMap.get(attrKey)
            );
          }
        }

        if (currentNode.hasAttribute("title")) {
          const attrKey = `title-${currentNode.outerHTML.slice(0, 50)}`;
          if (originalTextMap.has(attrKey)) {
            currentNode.setAttribute("title", originalTextMap.get(attrKey));
          }
        }

        if (currentNode.hasAttribute("alt")) {
          const attrKey = `alt-${currentNode.outerHTML.slice(0, 50)}`;
          if (originalTextMap.has(attrKey)) {
            currentNode.setAttribute("alt", originalTextMap.get(attrKey));
          }
        }
      }
    }

    console.log("Texte original restauré");
  }

  // Fonction pour créer le bouton de toggle de traduction avec menu déroulant
  function createToggleButton() {
    // Créer les éléments
    const toggleContainer = document.createElement("div");
    const mainButton = document.createElement("button");
    const dropdownMenu = document.createElement("div");
    const frenchOption = document.createElement("div");
    const englishOption = document.createElement("div");

    // Définir les styles pour le conteneur
    Object.assign(toggleContainer.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "10000",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    });

    // Définir les styles pour le bouton principal
    Object.assign(mainButton.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 15px",
      borderRadius: "8px",
      backgroundColor: "#3B82F6", // Bleu
      color: "white",
      border: "none",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.2)",
      cursor: "pointer",
      transition: "all 0.25s ease",
      fontFamily: "Arial, sans-serif",
      fontWeight: "bold",
      fontSize: "14px",
      marginBottom: "5px",
    });

    // Définir les styles pour le menu déroulant
    Object.assign(dropdownMenu.style, {
      display: "none",
      flexDirection: "column",
      backgroundColor: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      width: "100%",
      transition: "all 0.3s ease",
      opacity: "0",
      transform: "translateY(10px)",
    });

    // Styles communs pour les options
    const optionStyles = {
      padding: "10px 15px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
    };

    // Appliquer les styles aux options
    Object.assign(frenchOption.style, { ...optionStyles, color: "#3B82F6" });
    Object.assign(englishOption.style, { ...optionStyles, color: "#EF4444" });

    // Définir le contenu initial du bouton
    mainButton.innerHTML = '🇫🇷 <span style="margin-left: 8px;">Français</span>';

    // Définir le contenu des options
    frenchOption.innerHTML =
      '🇫🇷 <span style="margin-left: 8px;">Français</span>';
    englishOption.innerHTML =
      '🇬🇧 <span style="margin-left: 8px;">English</span>';

    // Ajouter les éléments au DOM
    dropdownMenu.appendChild(frenchOption);
    dropdownMenu.appendChild(englishOption);
    toggleContainer.appendChild(mainButton);
    toggleContainer.appendChild(dropdownMenu);
    document.body.appendChild(toggleContainer);

    // Variable pour stocker l'état de la traduction
    let translationEnabled = true;

    // Gérer l'affichage du menu déroulant
    toggleContainer.addEventListener("mouseenter", () => {
      dropdownMenu.style.display = "flex";
      setTimeout(() => {
        dropdownMenu.style.opacity = "1";
        dropdownMenu.style.transform = "translateY(0)";
      }, 10);
    });

    toggleContainer.addEventListener("mouseleave", () => {
      dropdownMenu.style.opacity = "0";
      dropdownMenu.style.transform = "translateY(10px)";
      setTimeout(() => {
        dropdownMenu.style.display = "none";
      }, 300);
    });

    // Événements de survol pour les options
    frenchOption.addEventListener("mouseenter", () => {
      frenchOption.style.backgroundColor = "#F3F4F6";
    });

    frenchOption.addEventListener("mouseleave", () => {
      frenchOption.style.backgroundColor = "white";
    });

    englishOption.addEventListener("mouseenter", () => {
      englishOption.style.backgroundColor = "#F3F4F6";
    });

    englishOption.addEventListener("mouseleave", () => {
      englishOption.style.backgroundColor = "white";
    });

    // Événements pour le bouton principal
    mainButton.addEventListener("mouseenter", () => {
      if (translationEnabled) {
        mainButton.style.backgroundColor = "#2563EB"; // Bleu plus foncé au survol
      } else {
        mainButton.style.backgroundColor = "#DC2626"; // Rouge plus foncé au survol
      }
      mainButton.style.transform = "translateY(-2px)";
      mainButton.style.boxShadow =
        "0 6px 15px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2)";
    });

    mainButton.addEventListener("mouseleave", () => {
      if (translationEnabled) {
        mainButton.style.backgroundColor = "#3B82F6"; // Retour au bleu normal
      } else {
        mainButton.style.backgroundColor = "#EF4444"; // Retour au rouge normal
      }
      mainButton.style.transform = "translateY(0)";
      mainButton.style.boxShadow =
        "0 4px 10px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.2)";
    });

    // Activer le français
    frenchOption.addEventListener("click", () => {
      if (!translationEnabled) {
        translationEnabled = true;
        mainButton.innerHTML =
          '🇫🇷 <span style="margin-left: 8px;">Français</span>';
        mainButton.style.backgroundColor = "#3B82F6"; // Bleu
        mainButton.style.boxShadow =
          "0 4px 10px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.2)";
        startTranslation();
      }
    });

    // Activer l'anglais
    englishOption.addEventListener("click", () => {
      if (translationEnabled) {
        translationEnabled = false;
        mainButton.innerHTML =
          '🇬🇧 <span style="margin-left: 8px;">English</span>';
        mainButton.style.backgroundColor = "#EF4444"; // Rouge
        mainButton.style.boxShadow =
          "0 4px 10px rgba(239, 68, 68, 0.2), 0 1px 2px rgba(239, 68, 68, 0.3)";
        stopTranslation();
        restoreOriginalText();
      }
    });

    return toggleContainer;
  }

  try {
    // 1. Charger le dictionnaire de traduction
    const url =
      "https://cdn.jsdelivr.net/gh/joe-jns/translate-ghl@main/translations.json";
    console.log("Tentative de chargement depuis:", url);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    translationDictionary = await response.json();
    console.log(
      "Traductions chargées:",
      Object.keys(translationDictionary).length,
      "entrées"
    );
    window.translationDictionary = translationDictionary;

    // Créer le bouton toggle avec menu déroulant
    const toggleButton = createToggleButton();

    // Démarrer la traduction automatiquement
    startTranslation();
  } catch (error) {
    console.error(
      "Erreur lors du chargement/application des traductions:",
      error
    );
  }
})();
