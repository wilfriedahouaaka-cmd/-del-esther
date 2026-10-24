/* =====================================================================
   Del & Esther — Le Jardin Caché · Lenis (défilement fluide et cinématique)
   ---------------------------------------------------------------------
   Lenis est branché sur la scène active, car le site ne défile pas sur
   window : chaque .scene est un conteneur `overflow-y: auto` superposé.
   L'instance est recréée à chaque changement de scène.

   - autoRaf: true est indispensable : sans la boucle rAF, Lenis
     intercepte la molette sans jamais déplacer le contenu.
   - Sur écran tactile (téléphone/tablette), on laisse le scroll natif :
     plus fiable et plus fluide que la synchronisation tactile de Lenis.
   - Désactivé aussi si prefers-reduced-motion.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - modules ES6          -> import / export
   - commentaires en français
   ===================================================================== */

/* Instance Lenis active (null si désactivée ou indisponible). */
let lenisInstance = null;

/**
 * Détecte un écran tactile principal (téléphone, tablette).
 * Sur ces appareils, le scroll natif est préféré.
 * @returns {boolean}
 */
function estTactile() {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/**
 * Initialise (ou réinitialise) Lenis sur une scène scrollable.
 * L'instance précédente est détruite pour ne pas laisser deux
 * gestionnaires de molette actifs en même temps.
 *
 * @param {HTMLElement|null} scene - scène à piloter (par défaut : la scène active)
 * @returns {Object|null} L'instance Lenis, ou null si désactivée.
 */
export function initLenis(scene = document.querySelector('.scene.active')) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* On détruit toujours l'ancienne instance avant d'en créer une nouvelle. */
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  /* Mouvement réduit, tactile ou bibliothèque absente : scroll natif. */
  if (prefersReduced || estTactile() || typeof window.Lenis === 'undefined' || !scene) {
    return null;
  }

  lenisInstance = new window.Lenis({
    wrapper: scene,            // la scène est le conteneur qui défile
    content: scene,            // son contenu est mesuré via scrollHeight
    autoRaf: true,             // boucle d'animation interne (indispensable)
    duration: 1.2,             // douceur du défilement programmé
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,         // molette fluide sur ordinateur
    syncTouch: false,          // tactile : pas de synchronisation Lenis
    touchMultiplier: 2,
    infinite: false,           // pas de boucle infinie
  });

  return lenisInstance;
}

/**
 * Retourne l'instance Lenis active, ou null si Lenis n'est pas activé.
 * @returns {Object|null}
 */
export function getLenis() {
  return lenisInstance;
}
