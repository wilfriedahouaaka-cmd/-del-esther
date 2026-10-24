/* =====================================================================
   Del & Esther — Le Jardin Caché · mur de cadres paginé
   ---------------------------------------------------------------------
   Le mur contient 28 vidéos. Pour ne pas surcharger l'écran, elles sont
   réparties en pages de 8 vignettes (4 pages). Chaque vignette garde son
   titre et son texte, affichés dans la visionneuse au clic.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - transitions protégées par withLock()
   - commentaires en français
   ===================================================================== */

import { createLock } from '../utils/lock.js';

/* Nombre exact de vignettes affichées par page. */
const TAILLE_PAGE = 8;

const verrou = createLock();
let pageCourante = 0;
let minuteurs = [];

/** Respecte la préférence système de réduction des mouvements. */
function mouvementReduit() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Petite attente pour laisser le temps à l'anti double-clic d'agir. */
function pause(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Retourne toutes les vignettes du mur, dans l'ordre du HTML. */
function vignettes() {
  return [...document.querySelectorAll('#ecran-mur .vignette')];
}

/** Nombre total de pages (au moins 1). */
function nombreDePages() {
  return Math.max(1, Math.ceil(vignettes().length / TAILLE_PAGE));
}

/** Annule les apparitions en cours avant de changer de page. */
function annulerMinuteurs() {
  minuteurs.forEach((minuteur) => window.clearTimeout(minuteur));
  minuteurs = [];
}

/**
 * Affiche une page du mur.
 * @param {number} numero - numéro de page (0 à 3)
 * @param {boolean} animer - true pour l'apparition en cascade
 * @param {boolean} defiler - true pour amener la grille à l'écran
 */
function afficherPage(numero, animer, defiler = false) {
  const liste = vignettes();
  if (!liste.length) return;

  const total = nombreDePages();
  pageCourante = Math.min(Math.max(numero, 0), total - 1);

  const debut = pageCourante * TAILLE_PAGE;
  const fin = Math.min(debut + TAILLE_PAGE, liste.length);

  annulerMinuteurs();

  liste.forEach((vignette, i) => {
    const surCettePage = i >= debut && i < fin;

    vignette.hidden = !surCettePage;
    vignette.classList.remove('vignette--visible');
    vignette.classList.add('vignette--attente');
  });

  /* Mise à jour du compteur et des deux boutons de page. */
  const compteur = document.getElementById('mur-compteur');
  if (compteur) {
    compteur.textContent = `Page ${pageCourante + 1} sur ${total} · œuvres ${debut + 1} à ${fin}`;
  }

  const precedente = document.getElementById('btn-mur-page-precedente');
  const suivante = document.getElementById('btn-mur-page-suivante');

  if (precedente) precedente.disabled = pageCourante === 0;
  if (suivante) {
    const derniere = pageCourante === total - 1;
    suivante.disabled = derniere;
    suivante.textContent = derniere ? 'Dernière page' : 'Page suivante →';
    suivante.setAttribute(
      'aria-label',
      derniere ? 'Dernière page du mur' : 'Afficher la page suivante du mur'
    );
  }

  /* Les vignettes de la page apparaissent l'une après l'autre. */
  const page = liste.slice(debut, fin);
  page.forEach((vignette, i) => {
    if (!animer) {
      vignette.classList.remove('vignette--attente');
      vignette.classList.add('vignette--visible');
      return;
    }

    const delai = mouvementReduit() ? 0 : 60 + i * 70;
    const minuteur = window.setTimeout(() => {
      vignette.classList.remove('vignette--attente');
      vignette.classList.add('vignette--visible');
    }, delai);

    minuteurs.push(minuteur);
  });

  if (defiler) {
    const grille = document.getElementById('mur-grille');
    if (grille) {
      grille.scrollIntoView({
        block: 'nearest',
        behavior: mouvementReduit() ? 'auto' : 'smooth',
      });
    }
  }
}

/** Change de page avec verrou anti double-clic. */
function changerPage(delta) {
  verrou.withLock(async () => {
    const nouvellePage = Math.min(
      Math.max(pageCourante + delta, 0),
      nombreDePages() - 1
    );

    if (nouvellePage === pageCourante) return;

    afficherPage(nouvellePage, true, true);
    await pause(300);
  });
}

/**
 * Branche les boutons de pagination.
 * Appelé une seule fois au démarrage.
 */
export function initMur() {
  const precedente = document.getElementById('btn-mur-page-precedente');
  const suivante = document.getElementById('btn-mur-page-suivante');

  if (precedente) {
    precedente.addEventListener('click', () => changerPage(-1));
  }

  if (suivante) {
    suivante.addEventListener('click', () => changerPage(1));
  }

  resetMur();
}

/**
 * Lance l'apparition de la page courante à l'entrée dans le mur.
 * Appelé par scenes.js quand l'écran 7 devient actif.
 */
export function lancerMurCadres() {
  afficherPage(pageCourante, true, false);
}

/** Remet le mur sur la première page (relecture). */
export function resetMur() {
  pageCourante = 0;
  annulerMinuteurs();
  afficherPage(0, false, false);
}
