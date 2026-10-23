/* =====================================================================
   Del & Esther — Le Jardin Caché · garde-fou file://
   ---------------------------------------------------------------------
   Ce script s'exécute AVANT les modules ES6 (js/main.js).
   Son rôle : détecter si la page est ouverte en local (protocole file://)
   et afficher un message d'explication, car les modules ES6 sont bloqués
   par les navigateurs quand on double-clique sur index.html.
   
   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - commentaires en français
   ===================================================================== */

(function () {
  /* Protocole utilisé pour charger la page.
     'file://' = double-clic sur le fichier (bloqué).
     'http:' ou 'https:' = serveur local ou en ligne (OK). */
  const protocole = window.location.protocol;

  /* Si on est en file://, on affiche un message et on bloque l'exécution
     des modules pour éviter une page blanche silencieuse. */
  if (protocole === 'file:') {
    const message = document.createElement('div');
    message.style.position = 'fixed';
    message.style.top = '0';
    message.style.left = '0';
    message.style.width = '100%';
    message.style.height = '100%';
    message.style.background = '#0b0b0b';
    message.style.color = '#fff';
    message.style.display = 'flex';
    message.style.flexDirection = 'column';
    message.style.alignItems = 'center';
    message.style.justifyContent = 'center';
    message.style.padding = '2rem';
    message.style.fontFamily = 'Cormorant Garamond, serif';
    message.style.textAlign = 'center';
    message.style.zIndex = '99999';

    const titre = document.createElement('h1');
    titre.textContent = 'Le Jardin Caché';
    titre.style.fontSize = '2rem';
    titre.style.marginBottom = '1rem';
    titre.style.fontFamily = 'Cinzel, serif';

    const explication = document.createElement('p');
    explication.textContent =
      'Ce site doit être ouvert avec un serveur local, pas en double-cliquant sur le fichier.';
    explication.style.maxWidth = '600px';
    explication.style.lineHeight = '1.6';
    explication.style.marginBottom = '1.5rem';

    const liste = document.createElement('ul');
    liste.style.textAlign = 'left';
    liste.style.listStyle = 'none';
    liste.style.padding = '0';

    const etapes = [
      'Option 1 (VS Code) : installer l\'extension "Live Server", faire un clic droit sur index.html, puis "Open with Live Server".',
      'Option 2 (terminal) : ouvrir ce dossier, taper "python -m http.server", puis aller sur http://localhost:8000',
    ];

    etapes.forEach((texte) => {
      const item = document.createElement('li');
      item.textContent = texte;
      item.style.marginBottom = '0.5rem';
      liste.appendChild(item);
    });

    const lien = document.createElement('a');
    lien.textContent = 'Lire le README pour plus de détails';
    lien.href = 'README.md';
    lien.style.color = '#d4af37';
    lien.style.textDecoration = 'underline';
    lien.style.marginTop = '1.5rem';
    lien.style.display = 'inline-block';

    message.appendChild(titre);
    message.appendChild(explication);
    message.appendChild(liste);
    message.appendChild(lien);

    /* Remplacer le contenu du body par ce message d'erreur. */
    document.body.replaceChildren(message);

    /* Empêcher le module principal de se lancer (il est déjà chargé,
       mais ce garde-fou rend le problème visible). */
    console.warn(
      'Garde-fou : page ouverte en file://. Les modules ES6 sont bloqués. ' +
      'Utilisez un serveur local (Live Server ou python -m http.server).'
    );
  }
})();
