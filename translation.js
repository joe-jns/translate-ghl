// Fonction pour charger le fichier .po
async function loadTranslations(url) {
    const response = await fetch(url);
    const poContent = await response.text();
    return parsePO(poContent);
}

// Fonction pour parser un fichier .po et créer un dictionnaire
function parsePO(content) {
    const translationDict = {};
    const lines = content.split("\n");
    let msgid = null, msgstr = null;

    for (const line of lines) {
        if (line.startsWith("msgid")) {
            msgid = line.match(/msgid "(.*)"/)[1];
        } else if (line.startsWith("msgstr")) {
            msgstr = line.match(/msgstr "(.*)"/)[1];
            if (msgid && msgstr) {
                translationDict[msgid] = msgstr;
                msgid = null;
                msgstr = null;
            }
        }
    }
    return translationDict;
}

// Fonction pour traduire le texte sur la page
function translateText(text, dictionary) {
    return dictionary[text] || text; // Retourne la traduction si elle existe, sinon garde le texte original
}

// Fonction pour modifier les textes dans le DOM
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

// Charger les traductions et appliquer les changements
(async function () {
    const poUrl = "https://raw.githubusercontent.com/user/repo/main/translations.po"; // Remplace par ton URL
    window.translationDict = await loadTranslations(poUrl);
    translateNode(document.body, window.translationDict);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
