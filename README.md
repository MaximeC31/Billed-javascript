## README

Dans ce projet, j'ai travaillé sur le débogage et les tests d'une application SaaS pour les ressources humaines. J'ai utilisé Chrome Debugger pour identifier et corriger les bugs, écrit des tests unitaires et end-to-end avec Jest, et assuré la fiabilité des parcours utilisateur pour les administrateurs et employés. 

### Étapes pour installer et lancer le projet

1. **Cloner les dépôts**  
   - Créez un dossier `bill-app` pour organiser les fichiers.  
   - Clonez le back-end :  
     ```bash
     git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
     ```
   - Clonez le front-end :  
     ```bash
     git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git
     ```

2. **Installer et lancer le back-end**  
   - Suivez les instructions dans le README du dépôt back-end pour installer et lancer l'API.

3. **Installer et lancer le front-end**  
   - Accédez au dossier front-end :  
     ```bash
     cd Billed-app-FR-Front
     ```
   - Installez les dépendances :  
     ```bash
     npm install
     ```
   - Installez live-server pour le serveur local :  
     ```bash
     npm install -g live-server
     ```
   - Lancez l'application :  
     ```bash
     live-server
     ```
   - Ouvrez l'application à l'adresse suivante : [http://127.0.0.1:8080/](http://127.0.0.1:8080/)

4. **Lancer les tests avec Jest**  
   - Pour exécuter tous les tests :  
     ```bash
     npm run test
     ```
   - Pour exécuter un test spécifique :  
     ```bash
     npm i -g jest-cli
     jest src/__tests__/your_test_file.js
     ```
   - Pour vérifier la couverture des tests, ouvrez : [http://127.0.0.1:8080/coverage/lcov-report/](http://127.0.0.1:8080/coverage/lcov-report/)

### Informations de connexion

- **Administrateur**  
  - Utilisateur : `admin@test.tld`  
  - Mot de passe : `admin`  
- **Employé**  
  - Utilisateur : `employee@test.tld`  
  - Mot de passe : `employee`
