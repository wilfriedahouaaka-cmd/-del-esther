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

/** Verrou pour éviter les réentrées pendant la transition */
const verrouTransition = { locked: false };

/**
 * Fait défiler la page vers le début du jardin (scène #jardin).
 * Respecte prefers-reduced-motion.
 * @param {Function} onComplete
 */
function scrollerVersJardin(onComplete) {
  const jardin = document.querySelector('#jardin');
  if (!jardin) { onComplete?.(); return; }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Cible calculée depuis le haut de la page (offsetTop seul peut être faux
  // si la page a déjà défilé).
  const cibleY = jardin.getBoundingClientRect().top + window.scrollY;

  if (prefersReduced) {
    window.scrollTo({ top: cibleY, behavior: 'auto' });
    onComplete?.();
    return;
  }

  // Scroll doux natif
  window.scrollTo({ top: cibleY, behavior: 'smooth' });

  // Détecte la fin du scroll (polling simple, fiable).
  // Sécurité : onComplete est TOUJOURS appelé au bout de 3000 ms, même si
  // le scroll n'atteint pas exactement la cible (évite le verrou permanent).
  const startY = window.scrollY;
  let lastY = startY;
  const debut = performance.now();

  function checkScroll() {
    const currentY = window.scrollY;
    const atteint = Math.abs(currentY - cibleY) < 5;
    const timeout = performance.now() - debut > 3000;

    if (atteint || timeout) {
      onComplete?.();
      return;
    }
    lastY = currentY;
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