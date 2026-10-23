/* =====================================================================
   Del & Esther — Le Jardin Caché · mise en scène écran par écran
   ---------------------------------------------------------------------
   Un seul écran visible à la fois. Navigation via go(n).
   Les écrans sont des sections .scene ; l'écran actif porte la classe .active.
   
   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - transitions protégées par withLock(fn, lockRef)
   - commentaires en français
   ===================================================================== */

import { withLock, createLock } from '../utils/lock.js';
import { ecrireLettre } from './message.js';

/* Sélecteurs des écrans (IDs définis dans index.html) */
const SELECTEURS = {
  portail:   '#ecran-portail',
  jardinBebe: '#ecran-jardin-bebe',
  jardinMicro: '#ecran-jardin-micro',
  revelation: '#ecran-revelation',
  portesGalerie: '#ecran-portes-galerie',
  galerie:   '#ecran-galerie',
  mur:       '#ecran-mur',
  finale:    '#ecran-finale',
  lettre:    '#ecran-lettre',
};

let ecrans = [];
let cur = 0;
const verrou = createLock();

/* Durées de verrou par transition (ms), inspirées de la référence */
const LOCK = {
  portail: 1600,   // ouverture de la porte
  next:    700,    // changement d'écran classique
  punch:   500,    // galerie : œuvre suivante
  star:    500,    // révélation d'Esther
  galerie: 1800,   // portes de la galerie
};

/**
 * Initialise les écrans : cache tous sauf le premier (index 0).
 */
export function initScenes() {
  ecrans = [...document.querySelectorAll('.scene')];
  ecrans.forEach((ecran, i) => {
    if (i === 0) ecran.classList.add('active');
    else ecran.classList.remove('active');
  });
}

/**
 * Passe à l'écran suivant.
 */
export function prochain() {
  return go(cur + 1);
}

/**
 * Active l'écran n, désactive les autres, met en pause les vidéos.
 * Retourne une promesse qui se résout quand la transition est prête.
 * @param {number} n - index de l'écran à activer
 */
export function go(n) {
  return withLock(async () => {
    cur = n;

    ecrans.forEach((ecran, i) => {
      ecran.classList.toggle('active', i === n);
    });

    /* Toutes les vidéos en pause lors d'un changement d'écran */
    document.querySelectorAll('video').forEach((v) => v.pause());

    /* Logique spécifique par écran */
    if (n === 1) {
      /* Écran jardin bébé : rien de particulier */
    }

    if (n === 2) {
      /* Écran jardin micro : le bouton "Continuer" arrive en retard (~6 s) */
      const bouton = document.querySelector('#ecran-jardin-micro .btn-next');
      if (bouton) {
        bouton.classList.add('late');
        window.setTimeout(() => {
          bouton.classList.remove('late');
        }, 6000);
      }
    }

    if (n === 3) {
      /* Écran révélation d'Esther : l'étoile bourgeonne via CSS (.bloomed) */
      const ecran = document.querySelector(SELECTEURS.revelation);
      if (ecran) {
        ecran.classList.add('bloomed');
      }
    }

    if (n === 4) {
      /* Écran portes de la galerie : rien de particulier (CSS gère l'ouverture) */
    }

    if (n === 5) {
      /* Écran galerie des œuvres : première œuvre visible */
      afficherOeuvreGalerie(0);
    }

    if (n === 6) {
      /* Écran mur de cadres : apparition en cascade */
      lancerMurCadres();
    }

    if (n === 7) {
      /* Écran finale : rien de particulier ici (géré par message.js) */
    }

    if (n === 8) {
      /* Écran lettre : le message s'écrit lettre par lettre */
      ecrireLettre();
    }
  }, verrou);
}

/**
 * Remet tous les écrans et leurs états à zéro pour la relecture.
 * Protegé par withLock depuis main.js.
 */
export function reset() {
  /* 1. Tous les écrans inactifs sauf le portail (index 0) */
  ecrans.forEach((ecran, i) => {
    ecran.classList.toggle('active', i === 0);
  });
  cur = 0;

  /* 2. Révélation : retirer .bloomed */
  const revelation = document.querySelector(SELECTEURS.revelation);
  if (revelation) revelation.classList.remove('bloomed');

  /* 3. Portes de la galerie : fermer */
  const portesGalerie = document.querySelector(SELECTEURS.portesGalerie);
  if (portesGalerie) portesGalerie.classList.remove('doors-ouvert');

  /* 4. Mur : cacher toutes les cellules */
  document.querySelectorAll('#ecran-mur .cellule').forEach((c) => {
    c.classList.remove('visible');
  });

  /* 5. Finale : retirer .shown */
  const finale = document.querySelector(SELECTEURS.finale);
  if (finale) finale.classList.remove('shown');

  /* 6. Vidéos : pause et retour au début */
  document.querySelectorAll('video').forEach((v) => {
    v.pause();
    v.currentTime = 0;
  });

  /* 7. Galerie : première œuvre */
  afficherOeuvreGalerie(0);

  /* 8. États des messages : retirer les classes de frappe/attente */
  document.querySelectorAll('.message-final--frappe').forEach((el) => {
    el.classList.remove('message-final--frappe');
  });
  document.querySelectorAll('.signature--attente, .signature--vue').forEach((el) => {
    el.classList.remove('signature--attente', 'signature--vue');
  });
}

/**
 * Affiche la n-ième œuvre de la galerie (comme showPunch dans la référence).
 * @param {number} i - index de l'œuvre
 */
function afficherOeuvreGalerie(i) {
  const oeuvres = [...document.querySelectorAll('#ecran-galerie .oeuvre')];
  oeuvres.forEach((oeuvre, k) => {
    const active = k === i;
    oeuvre.classList.toggle('on', active);
    const video = oeuvre.querySelector('video');
    if (video) {
      if (active) video.play().catch(() => {});
      else video.pause();
    }
  });
}

/**
 * Apparition en cascade des cellules du mur de cadres.
 * Délai total <= ~3 s (délai par vignette = min(350 ms, 3000 ms / nb)).
 */
function lancerMurCadres() {
  const cellules = [...document.querySelectorAll('#ecran-mur .cellule')];
  const total = cellules.length;
  const delaiParVignette = Math.min(350, 3000 / Math.max(total, 1));

  cellules.forEach((cellule, i) => {
    window.setTimeout(() => {
      cellule.classList.add('visible');
    }, 300 + i * delaiParVignette);
  });
}