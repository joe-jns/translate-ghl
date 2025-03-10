// Fonction pour charger le fichier .po
async function loadTranslations(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        const poContent = await response.text();
        console.log("📄 Contenu du fichier .po chargé :", poContent);
        return parsePO(poContent);
    } catch (error) {
        console.error("⚠️ Erreur lors du chargement du fichier .po :", error);
        return {};
    }
}

// Fonction pour parser un fichier .po
function parsePO(content) {
    const translationDict = {};
    const matches = content.match(/msgid\s+"(.*)"\s+msgstr\s+"(.*)"/g);

    if (!matches) {
        console.error("⚠️ Aucune traduction trouvée dans le .po !");
        return {};
    }

    matches.forEach(match => {
        const parts = match.match(/msgid\s+"(.*)"\s+msgstr\s+"(.*)"/);
        if (parts && parts[1] && parts[2]) {
            translationDict[parts[1].trim()] = parts[2].trim();
        }
    });

    console.log("📖 Dictionnaire chargé :", translationDict);
    return translationDict;
}

// Fonction pour traduire un texte
function translateText(text, dictionary) {
    return dictionary[text.trim()] || text;
}

// Fonction pour modifier les textes du DOM
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
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => translateNode(node, window.translationDict));
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

    translateNode(document.body, window.translationDict);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    console.log("✅ Traduction activée avec succès !");
})();
