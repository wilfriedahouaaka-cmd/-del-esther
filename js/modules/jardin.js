/* =====================================================================
   Del & Esther — Le Jardin Caché · traversée jardin (après portail)
   ---------------------------------------------------------------------
   Gère la transition : porte ouverte → défilement vers le jardin,
   révélation progressive des blocs, lancement ambiance (lucioles, son).

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - commentaires en français
   ===================================================================== */

import { withLock } from '../utils/lock.js';
import { getLenis } from '../utils/lenis.js';

/** Verrou pour éviter les réentrées pendant la transition */
const verrouTransition = { locked: false };

/**
 * Fait défiler la page vers le début du jardin (scène #jardin).
 * Respecte prefers-reduced-motion.
 * @param {Function} onComplete
 */
function scrollerVersJardin(onComplete) {
  const jardin = document.querySelector('#ecran-jardin-bebe');
  if (!jardin) { onComplete?.(); return; }

  const lenis = getLenis();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Le site défile à l'intérieur de la scène : la cible est le début
     de la scène du jardin, pas une position de window. */
  const cibleY = 0;

  /* Cible déjà atteinte : on libère immédiatement le verrou. */
  if (Math.abs(jardin.scrollTop - cibleY) < 5) {
    onComplete?.();
    return;
  }

  /* Avec Lenis : défilement cinématique confié à l'instance de la scène. */
  if (lenis && !prefersReduced) {
    lenis.scrollTo(cibleY, {
      duration: 1.2,
      onComplete: () => { onComplete?.(); },
    });
    return;
  }

  /* Sans Lenis (réduit-motion, tactile ou indisponible) : scroll natif
     de la scène, avec détection de fin pour ne jamais bloquer le verrou. */
  jardin.scrollTo({ top: cibleY, behavior: prefersReduced ? 'auto' : 'smooth' });

  const debut = performance.now();

  function checkScroll() {
    const atteint = Math.abs(jardin.scrollTop - cibleY) < 5;
    const timeout = performance.now() - debut > 3000;

    if (atteint || timeout) {
      onComplete?.();
      return;
    }
    requestAnimationFrame(checkScroll);
  }

  requestAnimationFrame(checkScroll);
}

/**
 * Lance la séquence "entrée dans le jardin" :
 * - scroll vers le jardin
 * - callback de fin (lancera lucioles, ambiance, etc.)
 */
export function entrerDansLeJardin() {
  // Débloque le scroll et active l'état « jardin » avant la transition.
  document.body.classList.remove('portail-bloque');
  document.body.classList.add('dans-le-jardin');

  withLock(() => {
    return new Promise((resolve) => {
      // 1. Scroll vers le jardin
      scrollerVersJardin(() => {
        // 2. La suite (lucioles, ton, médias) est gérée par main.js
        //    via initLucioles(), initTon(), initMedias() déjà appelés
        resolve();
      });
    });
  }, verrouTransition);
}