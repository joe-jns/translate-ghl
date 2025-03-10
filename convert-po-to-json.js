const fs = require("fs");
const gettextParser = require("gettext-parser");

// Charger le fichier .po
const po = fs.readFileSync("translations.po", "utf8");

// Parser le fichier .po
const parsed = gettextParser.po.parse(po);

// Extraire les traductions
const translations = {};
for (const [msgid, data] of Object.entries(parsed.translations[""])) {
  if (msgid && data.msgstr[0]) {
    translations[msgid] = data.msgstr[0];
  }
}

// Sauvegarder en JSON
fs.writeFileSync("translations.json", JSON.stringify(translations, null, 2));

console.log("✅ Traductions converties avec succès dans translations.json");
