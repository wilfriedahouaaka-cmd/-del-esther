/* =====================================================================
   Ambiance — les lucioles du jardin (tâche 4)
   ---------------------------------------------------------------------
   Créées en JavaScript (jamais en HTML), animées en CSS. Elles restent
   invisibles tant que le corps du document n'a pas la classe
   .dans-le-jardin (le fondu est géré en CSS).
   ===================================================================== */

export function initLucioles() {
  const conteneur = document.getElementById('lucioles');
  if (!conteneur) return;

  /* Pas de particules pour qui a réduit les animations */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Moins de lucioles sur petit écran : même rendu, moins de charge */
  const petitEcran = window.matchMedia('(max-width: 768px)').matches;
  const total = petitEcran ? 18 : 34;

  for (let i = 0; i < total; i++) {
    const luciole = document.createElement('span');
    luciole.className = 'luciole';

    const taille = 2 + Math.random() * 4;                     // 2 à 6 px
    luciole.style.left = Math.random() * 100 + '%';
    luciole.style.top  = Math.random() * 100 + '%';
    luciole.style.width  = taille + 'px';
    luciole.style.height = taille + 'px';

    /* Durée et décalage aléatoires : elles ne scintillent jamais ensemble.
       Le décalage est négatif pour que l'animation soit déjà « en cours »
       à l'arrivée dans le jardin. */
    luciole.style.animationDuration = (6 + Math.random() * 9) + 's';
    luciole.style.animationDelay = (-Math.random() * 12) + 's';

    /* Déplacement aléatoire pour l'animation floatOrb */
    luciole.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    luciole.style.setProperty('--dy', (Math.random() * 60 - 30) + 'px');

    conteneur.append(luciole);
  }
}

/* ---------------------------------------------------------------------
   Braises qui montent — seulement dans le musée (initBraises)
   Créées en JS, jamais en HTML. Appelée depuis main.js.
   --------------------------------------------------------------------- */
export function initBraises() {
  const conteneur = document.getElementById('embers');
  if (!conteneur) return;

  /* Pas de particules pour qui a réduit les animations */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const total = 20;
  for (let i = 0; i < total; i++) {
    const braise = document.createElement('span');
    braise.style.left = Math.random() * 100 + '%';
    braise.style.animationDuration = (2 + Math.random() * 4) + 's';
    braise.style.animationDelay = (Math.random() * 5) + 's';
    conteneur.append(braise);
  }
}

/* ---------------------------------------------------------------------
   Bascule de ton : le décor devient doré à partir du musée, et le reste
   jusqu'à la finale (le parcours « devient musée » puis y reste —
   s'éteindre au dernier tableau cassait la continuité).
   (À appeler une seule fois, depuis main.js.)
   --------------------------------------------------------------------- */
export function initTon() {
  const musee  = document.getElementById('musee');
  const finale = document.getElementById('finale');
  if (!musee || !('IntersectionObserver' in window)) return;

  /* Sections dorées actuellement à l'écran : le décor suit la dernière
     observée, il ne s'éteint pas quand on passe du musée à la finale. */
  const actives = new Set();

  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) actives.add(entree.target);
      else actives.delete(entree.target);
    });
    document.body.classList.toggle('dans-le-musee', actives.size > 0);
  }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' }  /* bande centrale de l'écran : fonctionne même si la section est très haute */);

  observateur.observe(musee);
  if (finale) observateur.observe(finale);
}
