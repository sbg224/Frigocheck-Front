# 🧊 FrigoCheck

FrigoCheck est une application pensée pour aider les ménages, les couples ou les personnes vivant seules à mieux gérer leur stock alimentaire et leurs courses.  
Elle permet d’avoir une **vue claire et en temps réel sur les produits disponibles à la maison**, de générer automatiquement des listes de courses, et ainsi de limiter le gaspillage et les achats inutiles.

## 🎯 Objectif

- Réduire le gaspillage alimentaire
- Éviter le surstockage et les doublons
- Faciliter la planification des courses
- Inciter les utilisateurs à s’impliquer dans la gestion de leur consommation

---

## 🚀 Fonctionnalités

- 🧾 Création de listes de courses
- ✅ Validation et transfert automatique dans le stock
- 📦 Suivi du stock avec catégories (alimentaire / non-alimentaire)
- 👤 Authentification sécurisée (compte obligatoire)
- 📊 Aperçu graphique des produits stockés
- 🏷️ Fonctionnalité à venir : suggestions de promotions via scraping (Carrefour, Leclerc, Auchan...)

---

## 🛠️ Technologies utilisées

### Frontend
- React (avec TypeScript)

### Backend
- Node.js + Express

### Base de données
- MySQL

### Autres
- Authentification avec Bcrypt
- Web scraping (prévu, en cours d’intégration)
- Hébergement futur avec Docker

---

## 📷 Aperçu de l’application

### 🔐 Page d’accueil & Connexion
![Page d'accueil](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.32.21.png)  
Page d’accueil de FrigoCheck, avec appel à l’action pour se connecter ou s’inscrire.

![Connexion](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.33.15.png)  
Interface de connexion sécurisée.

### 🧭 Tableau de bord & Ajout de produit

![Dashboard et stock](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.33.38.png)  
Vue du tableau de bord avec liste de courses et stock.

![Ajout de produit](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.34.02.png)  
Fenêtre modale pour ajouter un produit dans la liste.

### 🧭 apreçu de la page stock et A propos (Frigo, A propos)

![ page Frigo](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.34.19.png)  
Vue du tableau de bord du stock.


![ page A propos](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.34.32.png)  
Vue la page A propos.


### 🧭 apreçu de la page profil

![ page A propos](./src/assets/imagesReadme/Capture%20d’écran%202025-04-23%20à%2017.35.03.png)  
Vue la page gestion du profil.

> 📍 À la connexion, l'utilisateur arrive sur un dashboard avec deux options principales :
> - **Frigo** : voir le stock alimentaire
> - **À propos** : info sur l’application

À partir du dashboard :
- ➕ Ajout de produits dans la liste de courses
- ✔️ Une fois validée, la liste devient un stock réel
- 📊 Aperçus disponibles : répartition des produits par type

---

## 🔐 Accès

L’utilisation de FrigoCheck nécessite la création d’un compte utilisateur.  
Chaque utilisateur a accès **uniquement à ses propres données**, garantissant confidentialité et sécurité.

---

## 🧭 Roadmap

- [x] Système d’authentification
- [x] Gestion de stock et listes
- [ ] Scraping des promotions (en cours)
- [ ] Notifications de produits expirés
- [ ] Système de filtres et recherche avancée

---

## 🤝 Contribution

Les contributions sont les bienvenues !

### Règles de contribution
- Créez une **issue** avant de commencer un développement.
- Travaillez sur une branche nommée `feature/nom-de-votre-feature`
- Faites une Pull Request claire et détaillée
- Respectez la structure du projet

---

## 📄 Licence

Ce projet est sous licence **MIT**.  
Vous êtes libre de l’utiliser, le modifier ou le redistribuer avec attribution.

---

## 📬 Contact

Pour toute question, suggestion ou retour :  
📧 [sambah450@gmail.com]

---
