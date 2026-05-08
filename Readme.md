# 📝 To-Do App

Une application web moderne et progressive de gestion des tâches avec synchronisation locale et modes de personnalisation avancés.

## ✨ Fonctionnalités

### Gestion des Tâches
- ✅ Ajouter, modifier et supprimer des tâches
- 📅 Assigner une date et une heure à chaque tâche
- 🏷️ Catégoriser les tâches (Shopping, Work, Personal, Health, etc.)
- 🎯 Définir des priorités pour les tâches
- 📋 Créer des sous-tâches
- 📝 Ajouter des notes aux tâches
- 🔔 Définir des rappels

### Interface Utilisateur
- 🌓 Mode sombre/clair basculable
- 🎨 5 thèmes de couleurs (Bleu, Orange, Teal, Violet, Rouge)
- 📊 Tableau de bord statistique avec :
  - Nombre total de tâches
  - Nombre de tâches complétées
  - Barre de progression
- 🔍 Recherche instantanée de tâches
- 📱 Conception responsive et optimisée mobile

### Filtrage et Organisation
- Afficher toutes les tâches
- Afficher les tâches actives
- Afficher les tâches complétées
- Filtrer par catégorie
- Trier par date, priorité ou état

### Données et Stockage
- 💾 Sauvegarde automatique dans le localStorage
- 📤 Export des tâches (JSON)
- 📥 Import des tâches (JSON)
- 📜 Historique des modifications (50 derniers états)
- 🔄 Récurrences des tâches (optionnel)

### Fonctionnalités Avancées
- 📦 Progressive Web App (PWA) - Fonctionne hors ligne
- ⚡ Service Worker pour la mise en cache
- ⏰ Affichage en temps réel de la date et l'heure
- ♿ Accessibilité (ARIA labels, semantic HTML)

## 🚀 Installation et Utilisation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)

### Démarrage Rapide
1. Clonez le repository
```bash
git clone <repository-url>
cd to_do_app
```

2. Ouvrez le fichier `index.html` dans votre navigateur
```bash
open index.html
# ou
firefox index.html
```

3. L'application se chargera automatiquement avec les données locales

## 📁 Structure du Projet

```
to_do_app/
├── index.html          # Page principale HTML
├── style.css           # Styles CSS et thèmes
├── script.js           # Logique principale de l'application
├── service-worker.js   # Service Worker pour PWA
├── manifest.json       # Configuration PWA
├── Readme.md          # Ce fichier
├── assets/            # Ressources (images, icônes)
└── README.md          # Documentation
```

## 🎯 Utilisation

### Ajouter une Tâche
1. Tapez le texte de la tâche dans le champ "Post a new task..."
2. Sélectionnez optionnellement une date et une heure
3. Cliquez sur le bouton "Add" ou appuyez sur Entrée

### Marquer une Tâche comme Complétée
- Cliquez sur la case à cocher à côté de la tâche

### Supprimer une Tâche
- Cliquez sur l'icône de suppression (corbeille) de la tâche

### Rechercher des Tâches
- Utilisez la barre de recherche pour filtrer les tâches en temps réel

### Changer d'Apparence
- Cliquez sur l'icône de lune/soleil pour basculer le mode sombre/clair
- Cliquez sur les carrés de couleur pour changer le thème de couleur

### Gérer les Catégories
- Entrez une nouvelle catégorie dans le champ "Add category..."
- Cliquez sur le bouton "+" pour ajouter la catégorie
- Les catégories s'affichent sous forme de boutons cliquables

## 💾 Données

### Stockage Local
- Les tâches sont automatiquement sauvegardées dans le localStorage du navigateur
- Les données persistent entre les sessions du navigateur

### Export/Import
- Utilisez les boutons "Export" et "Import" pour sauvegarder/restaurer vos tâches
- Format: JSON

## 🌐 Mode Hors Ligne (PWA)

Cette application fonctionne comme une Progressive Web App:
- Installez l'application sur votre écran d'accueil
- Fonctionne complètement hors ligne
- Synchronisation des données à la reconnexion

## 🎨 Personnalisation

### Modifier les Couleurs de Thème
Vous pouvez personnaliser les variables CSS dans `style.css`:
- Modifier les palettes de couleurs
- Ajuster l'espacement et les tailles
- Modifier les polices

## 🐛 Dépannage

### Les données ne se sauvegardent pas
- Vérifiez que le localStorage n'est pas désactivé dans votre navigateur
- Assurez-vous que vous n'êtes pas en mode navigation privée

### L'application ne se charge pas hors ligne
- Assurez-vous que le Service Worker est correctement enregistré
- Videz le cache et rechargez la page

## 📱 Compatibilité

- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Navigateurs mobiles modernes

## 📄 License

Libre d'utilisation

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à:
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Créer des pull requests

## 📧 Contact

Pour toute question ou suggestion, contactez l'auteur du projet.

---

**Version:** 1.0.0  
**Dernière mise à jour:** Mai 2026
