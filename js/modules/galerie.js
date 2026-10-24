/* =====================================================================
   Del & Esther — Le Jardin Caché · galerie des œuvres
   ---------------------------------------------------------------------
   Cinq œuvres, une seule visible à la fois. Chaque œuvre garde sa plaque
   et sa légende ; l'utilisateur avance avec « Œuvre suivante ».
   À la dernière œuvre, le bouton devient « Continuer vers le mur ».

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - transitions protégées par withLock()
   - commentaires en français
   ===================================================================== */

import { createLock } from '../utils/lock.js';

const verrou = createLock();
let indexCourant = 0;
let actionFin = () => {};

/** Retourne toutes les œuvres de la galerie, dans l'ordre du HTML. */
function oeuvres() {
  return [...document.querySelectorAll('#ecran-galerie .oeuvre')];
}

/** Petite attente pour laisser le temps à l'anti double-clic d'agir. */
function pause(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Respecte la préférence système de réduction des mouvements. */
function mouvementReduit() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Sur téléphone, l'œuvre et ses commandes ne tiennent pas ensemble dans
 * la hauteur de l'écran. Après un changement, on remonte donc au début
 * de la nouvelle œuvre : l'utilisateur la découvre entièrement avant de
 * faire défiler pour lire la légende et cliquer.
 * @param {HTMLElement} oeuvre
 */
function remonterVersOeuvre(oeuvre) {
  if (!oeuvre) return;
  if (!window.matchMedia('(max-width: 640px)').matches) return;

  oeuvre.scrollIntoView({
    block: 'start',
    behavior: mouvementReduit() ? 'auto' : 'smooth',
  });
}

/**
 * Affiche l'œuvre demandée et met à jour les commandes de navigation.
 * @param {number} i - index de l'œuvre (0 à 4)
 */
export function afficherOeuvreGalerie(i) {
  const liste = oeuvres();
  if (!liste.length) return;

  indexCourant = Math.min(Math.max(i, 0), liste.length - 1);

  liste.forEach((oeuvre, k) => {
    const active = k === indexCourant;

    oeuvre.classList.toggle('on', active);

    /* Les œuvres masquées ne doivent ni être lues ni recevoir le focus. */
    if (active) {
      oeuvre.removeAttribute('aria-hidden');
      oeuvre.removeAttribute('inert');
    } else {
      oeuvre.setAttribute('aria-hidden', 'true');
      oeuvre.setAttribute('inert', '');
    }

    const video = oeuvre.querySelector('video');
    if (video) {
      if (active) video.play().catch(() => {});
      else video.pause();
    }
  });

  const compteur = document.getElementById('galerie-compteur');
  if (compteur) {
    compteur.textContent = `Œuvre ${indexCourant + 1} sur ${liste.length}`;
  }

  const precedente = document.getElementById('btn-oeuvre-precedente');
  if (precedente) precedente.disabled = indexCourant === 0;

  const suivante = document.getElementById('btn-oeuvre-suivante');
  if (suivante) {
    const derniere = indexCourant === liste.length - 1;
    suivante.textContent = derniere ? 'Continuer vers le mur →' : 'Œuvre suivante →';
    suivante.setAttribute(
      'aria-label',
      derniere ? 'Continuer vers le mur de cadres' : 'Afficher l’œuvre suivante'
    );
  }
}

/** Passe à l'œuvre précédente ou suivante, avec verrou anti double-clic. */
function changer(delta) {
  verrou.withLock(async () => {
    const liste = oeuvres();
    if (!liste.length) return;

    const nouvelIndex = Math.min(
      Math.max(indexCourant + delta, 0),
      liste.length - 1
    );

    if (nouvelIndex === indexCourant) return;

    afficherOeuvreGalerie(nouvelIndex);
    remonterVersOeuvre(liste[nouvelIndex]);
    await pause(280);
  });
}

/**
 * Branche les boutons de la galerie.
 * @param {{ onTermine?: Function }} options - action après la dernière œuvre
 */
export function initGalerie({ onTermine = () => {} } = {}) {
  actionFin = typeof onTermine === 'function' ? onTermine : () => {};

  const precedente = document.getElementById('btn-oeuvre-precedente');
  const suivante = document.getElementById('btn-oeuvre-suivante');

  if (precedente) {
    precedente.addEventListener('click', () => changer(-1));
  }

  if (suivante) {
    suivante.addEventListener('click', () => {
      const liste = oeuvres();

      /* Dernière œuvre : on quitte la galerie pour le mur. */
      if (indexCourant >= liste.length - 1) {
        verrou.withLock(async () => {
          await actionFin();
          await pause(300);
        });
        return;
      }

      changer(1);
    });
  }

  /* Première œuvre visible dès l'initialisation. */
  afficherOeuvreGalerie(0);
}

/** Remet la galerie sur la première œuvre (relecture). */
export function resetGalerie() {
  afficherOeuvreGalerie(0);
}
