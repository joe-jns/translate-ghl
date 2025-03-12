# 🏆 Translate GHL

> **Un script JavaScript pour traduire dynamiquement l'interface de Go High Level (GHL) en français.**  

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/joe-jns/translate-ghl)](https://github.com/joe-jns/translate-ghl/releases)

---

## 🚀 Fonctionnalités

✔️ **Traduction automatique** de l'interface GHL.  
✔️ **Surveillance en temps réel** pour traduire les nouveaux éléments chargés dynamiquement.  
✔️ **Performant & léger** : impact minimal sur la page.  
✔️ **Facile à intégrer** : un simple script à ajouter.  

---

## 📥 Installation & Utilisation

Ajoutez le script suivant dans votre page pour charger la traduction dynamiquement via **JSDelivr** :

```html
<script>
  (function() {
      let script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/joe-jns/translate-ghl@main/translation.js"; 
      script.type = "text/javascript";
      script.async = true;
      document.head.appendChild(script);
  })();
</script>
```

**🔹 Ce script est chargé de manière asynchrone pour éviter toute latence sur la page.**

---

## 🛠️ Comment ça marche ?

### 📌 1. Dictionnaire de traduction intégré  
Le script contient une liste de termes anglais/français qui sont automatiquement remplacés sur la page.

### 🔍 2. Surveillance continue  
Grâce à `MutationObserver`, tout nouvel élément ajouté à la page sera automatiquement traduit.

### ⚡ 3. Performance optimisée  
Utilisation de `requestIdleCallback()` pour minimiser l'impact sur les performances.

---

## 📅 Roadmap

- ✅ Ajout de nouvelles traductions  
- 🔜 Option pour **personnaliser les traductions**  
- 🔜 Compatibilité avec d'autres langues  

**Vous avez une idée ?** 👉 [Proposez une amélioration](https://github.com/joe-jns/translate-ghl/issues)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! 🚀  
1. **Fork** ce dépôt 🍴  
2. **Clone** votre fork sur votre machine 🖥️  
   ```sh
   git clone https://github.com/votre-utilisateur/translate-ghl.git
   ```
3. **Créez une branche** pour votre fonctionnalité 📌  
   ```sh
   git checkout -b ma-nouvelle-fonctionnalite
   ```
4. **Faites vos modifications** et **committez** 🚀  
   ```sh
   git commit -m "Ajout d'une nouvelle traduction"
   ```
5. **Poussez** votre branche et **ouvrez une Pull Request**  

---

## 📜 Licence

Ce projet est sous **licence MIT**. Vous êtes libre de l'utiliser, le modifier et le partager.  
[📄 Lire la licence](LICENSE)

---

## 🔗 Liens utiles

🔹 [Go High Level](https://www.gohighlevel.com/)  
🔹 [CDN JSDelivr](https://www.jsdelivr.com/)  
🔹 [Rapporter un bug](https://github.com/joe-jns/translate-ghl/issues)  

🔥 **Merci d'utiliser Translate GHL !** 😃