// Bibliothèque de traduction
const translationDictionary = {
  "Welcome to ": "Bienvenue dans ",
  "View all Groups": "Voir tous les groupes",
  "You don’t have any": "Vous n’en avez pas",
  "Invoices": "Factures",
  "Join a Group": "Rejoindre un groupe",
  "Take a course": "Suivre un cours",
  "Check Affiliate Earnings": "Vérifier les gains d'affiliation",
  "Manage Subscriptions": "Gérer les abonnements",
  "Recently opened": "Ouvert récemment",
  "Contracts": "Contrats",
  "Hi": "Salut",

  // Groupe
  "What's on your mind": "À quoi penses-tu",
  "Learning": "Apprentissage",
  "Members": "Membres",
  "Events": "Événements",
  "Leaderboard": "Classement",
  "About": "À propos",
  "Home": "Accueil",
  "Annoucements": "Annonces",
  "Search": "Rechercher",
  "Private Group": "Groupe privé",
  "Posts": "Publications",
  "Admin": "Admin",
  "Invite Members": "Inviter des membres",
  "30-days": "30 jours",
  "All time": "Depuis toujours",
  "7-days": "7 jours",
  "No activity to show": "Aucune activité à afficher",
  "See all leaderboards": "Voir tous les classements",
  "Posting in": "Publication dans",
  "What is your title?": "Quel est ton titre ?",
  "Cancel": "Annuler",
  "Publish Post": "Publier la publication",
  "Search Member": "Rechercher un membre",
  "Switch to other groups": "Passer à d'autres groupes",
  "Switch to dark mode": "Passer en mode sombre",
  "Communities": "Communautés",
  "Courses": "Formations",
  "Affiliates": "Affiliation",
  "Unread": "Non lu",
  "Welcome to Your request to join the group has been approved.":
    "Bienvenue, votre demande pour rejoindre le groupe a été approuvée.",
  "No conversations found": "Aucune conversation trouvée",
  "Looks like you haven't chatted with anyone yet. Search a contact and take the first step":
    "On dirait que tu n'as encore discuté avec personne. Recherchez un contact et fais le premier pas !",
  "Start Chatting": "Commencer à discuter",
  "Level 1": "Niveau 1",
  "Level 2": "Niveau 2",
  "Level 3": "Niveau 3",
  "Level 4": "Niveau 4",
  "Level 5": "Niveau 5",
  "Level 6": "Niveau 6",
  "Level 7": "Niveau 7",
  "Level 8": "Niveau 8",
  "Level 9": "Niveau 9",
  "of": "de",
  "points to level up": "points pour monter de niveau",
  "Free": "Gratuit",
  "Contributors": "Contributeurs",
  "Active hours ago": "Actif il y a heures",
  "Joined": "A rejoint",
  "No Publications found": "Aucune publication trouvée",
  "Open": "Ouvrir",
  "Add Gif": "Ajouter un Gif",
  "Add Image": "Ajouter une image",
  "Add video": "Ajouter une vidéo",
  "Add link": "Ajouter un lien",
  "Add Attachment": "Ajouter une pièce jointe",
  "Add Emoji": "Ajouter un emoji",
  "Add Channel": "Ajouter un canal",
  "SETTINGS": "Paramètres",
  "Public Group": "Groupe public",
  "ago in ": " dans ",
  "No notifications yet": "Aucune notification pour le moment",
  "When you get notifications, they’ll show up here": "Lorsque vous recevrez des notifications, elles s'afficheront ici",
  "Title A-Z": "Titre A-Z",
  "Title Z-A": "Titre Z-A",
  "Library Order (Low to High)": "Ordre de la bibliothèque (du plus bas au plus haut)",
  "Library Order (High to Low)": "Ordre de la bibliothèque (du plus haut au plus bas)",
  "Most Lessons": "Le plus de leçons",
  "Least Lessons": "Le moins de leçons",
  "Most Complete": "Le plus complet",
  "Least Complete": "Le moins complet",
  "Recently Enrolled": "Inscrit récemment",
  "Oldest Enrolled": "Le plus ancien inscrit",
  "Recently Accessed": "Accédé récemment",
  "Oldest Accessed": "Accédé le plus anciennement",
  "categories and lessons": "Catégories et leçons",
  "Manage Your Account": "Gérer votre compte",
  "Log out": "Se déconnecter",
  "All": "Tout les",
  "My": "Mes"

};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Échappe les caractères spéciaux
}

// Fonction pour remplacer les mots dans une chaîne de texte
function translateText(text) {
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
        mutation.target.textContent = translateText(
          mutation.target.textContent
        );
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

// Démarrer l'observation du body sans bloquer la page
requestIdleCallback(() => {
  observer.observe(document.body, observerConfig);
  translateNode(document.body); // Traduire le contenu initial
});
