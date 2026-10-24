/* =====================================================================
   Del & Esther — Le Jardin Caché · étapes de récit
   ---------------------------------------------------------------------
   Certains écrans contiennent deux textes successifs. Le premier reste
   affiché, puis le bouton « Lire la suite » révèle le second. L'action
   se trouve toujours juste après le texte concerné.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - transitions protégées par withLock()
   - commentaires en français
   ===================================================================== */

import { createLock } from '../utils/lock.js';

const verrou = createLock();

/** Respecte la préférence système de réduction des mouvements. */
function mouvementReduit() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Révèle l'étape cible et masque le bouton de l'étape précédente.
 * Le texte déjà lu reste visible : on ajoute la suite, on ne remplace pas.
 * @param {HTMLButtonElement} bouton - bouton « Lire la suite »
 */
async function revelerEtape(bouton) {
  const selecteur = bouton.dataset.etapeSuivante;
  if (!selecteur) return;

  const cible = document.querySelector(selecteur);
  if (!cible) return;

  /* L'ancien bouton disparaît pour éviter un second clic sur la même étape. */
  bouton.hidden = true;

  /* La nouvelle étape devient visible et joue une petite apparition. */
  cible.hidden = false;
  cible.classList.remove('etape--cachee');
  cible.classList.add('etape--apparue');

  /* On amène l'étape sous les yeux de l'utilisateur, sans mouvement brutal. */
  cible.scrollIntoView({
    block: 'nearest',
    behavior: mouvementReduit() ? 'auto' : 'smooth',
  });

  /* Le focus passe à l'action suivante : le clavier ne reste pas bloqué
     sur un bouton qui vient d'être masqué. */
  const actionSuivante = cible.querySelector('.btn-next');
  if (actionSuivante) actionSuivante.focus({ preventScroll: true });
}

/**
 * Branche tous les boutons « Lire la suite ».
 * Appelé une seule fois au démarrage.
 */
export function initEtapes() {
  document.querySelectorAll('[data-etape-suivante]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      /* Le verrou évite de révéler deux fois la même étape sur double-clic. */
      verrou.withLock(async () => {
        await revelerEtape(bouton);
        /* Courte immobilisation : le temps que l'apparition se termine. */
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      });
    });
  });
}

/**
 * Remet toutes les étapes dans leur état initial :
 * étape 1 visible, étapes suivantes cachées, boutons réaffichés.
 * Utilisé par « Relire l'Épopée ».
 */
export function resetEtapes() {
  document.querySelectorAll('[data-etape]').forEach((etape) => {
    const estPremiere = etape.dataset.etape === '1';

    etape.hidden = !estPremiere;
    etape.classList.toggle('etape--cachee', !estPremiere);
    etape.classList.remove('etape--apparue');

    etape.querySelectorAll('[data-etape-suivante]').forEach((bouton) => {
      bouton.hidden = false;
    });
  });
}
