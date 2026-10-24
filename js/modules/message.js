/* =====================================================================
   Message final et lettre — écriture progressive
   ---------------------------------------------------------------------
   Le texte vit dans index.html (#message-lettre).
   - Finale : pas de texte, le bouton « Continuer » est disponible.
   - Lettre : le message complet, en trois paragraphes révélés un par un.
     Chaque paragraphe a son propre bouton « Continuer », placé juste après lui.
   Sans JS, sans IntersectionObserver ou en mouvement réduit : la lettre
   affiche son premier paragraphe en entier, sans machine à écrire.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - transitions protégées par withLock()
   - commentaires en français
   ===================================================================== */

import { ecrire } from '../utils/typewriter.js';
import { createLock } from '../utils/lock.js';

const pause = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const verrouLettre = createLock();

/* Observateur de la finale : conservé pour pouvoir le couper à la relecture. */
let observateurFinal = null;

/* Numéro de génération de la lettre : évite qu'une ancienne frappe
   continue d'écrire après une relecture. */
let generationLettre = 0;

/** Respecte la préférence système de réduction des mouvements. */
function mouvementReduit() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Écrit le contenu d'une ligne [data-machine] dans son span de frappe.
 * @param {HTMLElement} ligne
 */
async function ecrireLigne(ligne, delai = 28) {
  const plein = ligne.querySelector('.message-final__plein');
  const frappe = ligne.querySelector('.message-final__frappe');
  if (!plein || !frappe) return;

  frappe.textContent = '';
  await ecrire(frappe, plein.textContent, delai);
}

/* ---------------------------------------------------------------------
   Finale : le message complet est dans la lettre ; ici, on affiche
   simplement l'action « Continuer ».
   --------------------------------------------------------------------- */

/**
 * Prépare la finale : le conteneur #message-final est vide, on affiche
 * directement le bouton « Continuer ». Appelé à chaque arrivée sur l'écran 8.
 */
export function initMessageFinal() {
  const boite = document.getElementById('message-final');
  if (!boite) return;

  const lignes = [...boite.querySelectorAll('[data-machine]')];
  const conteneur = boite.closest('.conteneur') || document;
  const signature = conteneur.querySelector('.signature');
  const bouton = document.getElementById('btn-finale-suivant');

  /* Un ancien observateur ne doit pas relancer une frappe en double. */
  if (observateurFinal) {
    observateurFinal.disconnect();
    observateurFinal = null;
  }

  /* Remise à zéro de l'état visuel. */
  boite.classList.remove('message-final--frappe');
  lignes.forEach((ligne) => {
    const frappe = ligne.querySelector('.message-final__frappe');
    if (frappe) frappe.textContent = '';
  });

  if (signature) {
    signature.classList.remove('vue');
    signature.classList.add('signature--attente');
  }
  if (bouton) bouton.classList.remove('visible');

  /* Rend la signature et l'action visibles une fois le texte terminé. */
  const afficherAction = () => {
    if (signature) {
      /* On garde signature--attente : le CSS fait le fondu vers .vue. */
      signature.classList.add('vue');
    }
    if (bouton) bouton.classList.add('visible');
  };

  if (!lignes.length) {
    afficherAction();
    return;
  }

  /* Mouvement réduit ou navigateur sans IntersectionObserver :
     le texte complet et l'action sont disponibles tout de suite. */
  if (mouvementReduit() || !('IntersectionObserver' in window)) {
    afficherAction();
    return;
  }

  boite.classList.add('message-final--frappe');

  observateurFinal = new IntersectionObserver(async (entrees, obs) => {
    if (!entrees.some((entree) => entree.isIntersecting)) return;
    obs.disconnect();
    observateurFinal = null;

    for (const ligne of lignes) {
      await ecrireLigne(ligne);
      await pause(600);
    }

    afficherAction();
  }, { threshold: 0.6 });

  observateurFinal.observe(boite);
}

/** Coupe l'observateur et remet la finale à zéro (relecture). */
export function reinitialiserMessageFinal() {
  if (observateurFinal) {
    observateurFinal.disconnect();
    observateurFinal = null;
  }

  const boite = document.getElementById('message-final');
  if (!boite) return;

  boite.classList.remove('message-final--frappe');
  boite.querySelectorAll('.message-final__frappe').forEach((el) => {
    el.textContent = '';
  });

  const conteneur = boite.closest('.conteneur') || document;
  conteneur.querySelectorAll('.signature').forEach((signature) => {
    signature.classList.remove('signature--attente', 'vue');
  });

  const bouton = document.getElementById('btn-finale-suivant');
  if (bouton) bouton.classList.remove('visible');
}

/* ---------------------------------------------------------------------
   Lettre « Un mot pour toi » : un paragraphe à la fois
   --------------------------------------------------------------------- */

/**
 * Affiche une étape de la lettre et écrit son paragraphe.
 * @param {number} numero - 2 ou 3
 */
async function revelerEtapeLettre(numero) {
  const boite = document.getElementById('message-lettre');
  if (!boite) return;

  const etape = boite.querySelector(`[data-etape-lettre="${numero}"]`);
  if (!etape) return;

  /* Le bouton de l'étape précédente disparaît : l'action suivante prend
     sa place juste après le nouveau texte. */
  const boutonPrecedent = document.getElementById(`btn-lettre-etape-${numero}`);
  if (boutonPrecedent) boutonPrecedent.hidden = true;

  etape.hidden = false;
  etape.classList.remove('lettre__etape--cachee');
  etape.classList.add('lettre__etape--visible');

  etape.scrollIntoView({
    block: 'nearest',
    behavior: mouvementReduit() ? 'auto' : 'smooth',
  });

  /* L'action n'apparaît qu'une fois le paragraphe entièrement écrit :
     on ne peut pas sauter la lecture par un clic trop rapide. */
  const actionSuivante = etape.querySelector('.btn-next');
  if (actionSuivante) actionSuivante.hidden = true;

  const ligne = etape.querySelector('[data-machine]');
  if (ligne) await ecrireLigne(ligne, 22);

  /* La signature n'apparaît qu'après le dernier paragraphe. */
  const signature = etape.querySelector('.signature');
  if (signature) {
    /* Même principe que la finale : le CSS gère le fondu. */
    signature.classList.add('vue');
  }

  if (actionSuivante) {
    actionSuivante.hidden = false;
    actionSuivante.focus({ preventScroll: true });
  }
}

/**
 * Branche les boutons de la lettre.
 * Appelé une seule fois au démarrage.
 */
export function initLettre() {
  const bouton2 = document.getElementById('btn-lettre-etape-2');
  const bouton3 = document.getElementById('btn-lettre-etape-3');

  if (bouton2) {
    bouton2.addEventListener('click', () => {
      verrouLettre.withLock(() => revelerEtapeLettre(2));
    });
  }

  if (bouton3) {
    bouton3.addEventListener('click', () => {
      verrouLettre.withLock(() => revelerEtapeLettre(3));
    });
  }
}

/**
 * Prépare la lettre et écrit le premier paragraphe.
 * Appelé à chaque arrivée sur l'écran 9.
 */
export async function ecrireLettre() {
  const boite = document.getElementById('message-lettre');
  if (!boite) return;

  generationLettre += 1;
  const generation = generationLettre;

  reinitialiserLettre();

  const premiere = boite.querySelector('[data-etape-lettre="1"]');
  if (!premiere) return;

  boite.classList.add('message-final--frappe');
  premiere.hidden = false;
  premiere.classList.remove('lettre__etape--cachee');
  premiere.classList.add('lettre__etape--visible');

  /* Le bouton du premier paragraphe attend la fin de la frappe. */
  const actionPremiere = premiere.querySelector('.btn-next');
  if (actionPremiere) actionPremiere.hidden = true;

  const ligne = premiere.querySelector('[data-machine]');
  if (ligne) await ecrireLigne(ligne, 22);

  if (generation !== generationLettre) return;

  if (actionPremiere) actionPremiere.hidden = false;
  await pause(500);
}

/** Remet la lettre à son état initial : seul le premier paragraphe de la lettre est visible. */
export function reinitialiserLettre() {
  const boite = document.getElementById('message-lettre');
  if (!boite) return;

  boite.classList.remove('message-final--frappe');

  boite.querySelectorAll('[data-etape-lettre]').forEach((etape) => {
    const premiere = etape.dataset.etapeLettre === '1';

    etape.hidden = !premiere;
    etape.classList.toggle('lettre__etape--cachee', !premiere);
    etape.classList.remove('lettre__etape--visible');

    etape.querySelectorAll('.message-final__frappe').forEach((el) => {
      el.textContent = '';
    });
  });

  const bouton2 = document.getElementById('btn-lettre-etape-2');
  const bouton3 = document.getElementById('btn-lettre-etape-3');
  if (bouton2) bouton2.hidden = false;
  if (bouton3) bouton3.hidden = false;

  const signature = boite.querySelector('.signature');
  if (signature) {
    signature.classList.remove('vue');
    signature.classList.add('signature--attente');
  }
}
