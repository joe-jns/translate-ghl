// Fonction pour charger et analyser le fichier .po
async function loadTranslations(url) {
    const response = await fetch(url);
    const poContent = await response.text();
    return parsePO(poContent);
}

// Fonction améliorée pour parser le fichier .po
function parsePO(content) {
    const translationDict = {};
    const lines = content.split("\n");
    let msgid = null, msgstr = null;

    lines.forEach(line => {
        if (line.startsWith("msgid")) {
            msgid = line.match(/msgid "(.*)"/)[1].trim();
        } else if (line.startsWith("msgstr")) {
            msgstr = line.match(/msgstr "(.*)"/)[1].trim();
            if (msgid && msgstr) {
                translationDict[msgid] = msgstr;
                msgid = null;
                msgstr = null;
            }
        }
    });

    return translationDict;
}

// Fonction pour traduire un texte en utilisant le dictionnaire
function translateText(text, dictionary) {
    return dictionary[text.trim()] || text; // Garde l'original si non traduit
}

// Fonction pour appliquer la traduction sur la page
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
    const poUrl = "https://raw.githubusercontent.com/joe-jns/translate-ghl/main/translations.po"; // Remplace par ton URL GitHub
    window.translationDict = await loadTranslations(poUrl);

    // Vérifie si le fichier `.po` a bien été chargé
    if (Object.keys(window.translationDict).length === 0) {
        console.error("⚠️ Échec du chargement des traductions. Vérifie l'URL du fichier .po !");
        return;
    }

    // Appliquer la traduction initiale
    translateNode(document.body, window.translationDict);

    // Activer l'observateur pour les changements dynamiques
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    console.log("✅ Traduction activée avec succès !");
})();
