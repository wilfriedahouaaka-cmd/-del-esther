/* =====================================================================
   Del & Esther — Le Jardin Caché · ouverture 3D du portail (GSAP)
   ---------------------------------------------------------------------
   Gère l'animation d'ouverture de la porte (battants 3D, lumière, caméra).
   Repli CSS automatique si GSAP ne charge pas (offline, erreur CDN).

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - commentaires en français
   ===================================================================== */

import { withLock } from '../utils/lock.js';

/** Sélecteurs des éléments du portail */
const SELECTORS = {
  btnOuvrir: '#btn-ouvrir',
  porte3d: '#portail-3d',
  porte: '#porte',
  battantG: '.porte__battant--g',
  battantD: '.porte__battant--d',
  serrure: '#serrure',
  scenePortail: '#portail',
  sceneJardin: '#jardin'
};

/** État interne */
let gsapDispo = false;
let verrouOuverture = { locked: false };

/**
 * Vérifie si GSAP est chargé et utilisable.
 * @returns {boolean}
 */
function verifierGSAP() {
  return typeof window.gsap !== 'undefined' && typeof window.gsap.timeline === 'function';
}

/**
 * Applique l'état "porte ouverte" via classes CSS (repli sans GSAP).
 */
function ouvrirSansGSAP() {
  const porte3d = document.querySelector(SELECTORS.porte3d);
  const scenePortail = document.querySelector(SELECTORS.scenePortail);
  const sceneJardin = document.querySelector(SELECTORS.sceneJardin);

  if (porte3d) porte3d.classList.add('porte--ouverte');
  if (sceneJardin) {
    sceneJardin.removeAttribute('aria-hidden');
  }
}

/**
 * Animation d'ouverture avec GSAP (timeline chorégraphiée).
 * @param {Function} onComplete - Callback quand l'animation termine.
 */
function ouvrirAvecGSAP(onComplete) {
  const tl = window.gsap.timeline({ onComplete });

  // 1. Serrure qui tourne
  tl.to(SELECTORS.serrure, {
    rotation: 90,
    transformOrigin: 'center center',
    duration: 0.4,
    ease: 'power2.out'
  });

  // 2. Battants qui s'ouvrent en 3D (perspective sur .porte__3d)
  tl.to(SELECTORS.battantG, {
    rotationY: -110,
    transformOrigin: 'left center',
    duration: 1.2,
    ease: 'power3.inOut'
  }, '<0.1');

  tl.to(SELECTORS.battantD, {
    rotationY: 110,
    transformOrigin: 'right center',
    duration: 1.2,
    ease: 'power3.inOut'
  }, '<');

  // 3. Lumière qui s'intensifie
  tl.to('.porte__lueur', {
    opacity: 1,
    scale: 1.5,
    duration: 0.8,
    ease: 'power2.out'
  }, '<0.3');

  // 4. Caméra qui avance dans la lumière (zoom sur .porte__3d)
  tl.to(SELECTORS.porte3d, {
    scale: 0.02,
    opacity: 0,
    duration: 1,
    ease: 'power3.inOut'
  }, '>-0.4');

  // 5. Révéler le jardin (aria pour l'accessibilité ; pas de classe CSS forcée).
  tl.set(SELECTORS.sceneJardin, { attr: { 'aria-hidden': 'false' } }, '<');
}

/**
 * Initialise le portail : clic sur le bouton → ouverture.
 * @param {Object} options
 * @param {Function} options.onOuvert - Callback quand la porte est entièrement ouverte.
 */
export function initPortail({ onOuvert }) {
  const btn = document.querySelector(SELECTORS.btnOuvrir);
  if (!btn) return;

  // Détecte la disponibilité de GSAP (chargé en defer, peut ne pas être prêt tout de suite)
  const checkGSAP = () => {
    gsapDispo = verifierGSAP();
    if (!gsapDispo) {
      // Repli CSS : on ajoute une classe qui déclenche l'ouverture via CSS
      document.documentElement.classList.add('gsap-indisponible');
    }
  };

  // GSAP peut charger après l'init (defer) → on vérifie au premier clic aussi
  btn.addEventListener('click', () => {
    checkGSAP();

    withLock(async () => {
      if (gsapDispo) {
        ouvrirAvecGSAP(onOuvert);
      } else {
        ouvrirSansGSAP();
        // Petit délai pour laisser la transition CSS jouer
        await new Promise(r => setTimeout(r, 1200));
        if (onOuvert) onOuvert();
      }
    }, verrouOuverture);
  }, { passive: true });

  // Vérification initiale (au cas où GSAP serait déjà là)
  checkGSAP();
}