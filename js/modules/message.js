/* =====================================================================
   Message final et lettre — écriture lettre par lettre
   ---------------------------------------------------------------------
   Le texte vit dans index.html (#message-final, #message-lettre),
   un paragraphe [data-machine] par ligne. Pour changer ou allonger,
   on modifie le HTML : aucun JS à toucher.
   Sans JS, sans IntersectionObserver ou en mouvement réduit : le texte
   est simplement affiché en entier.
   ===================================================================== */

import { ecrire } from '../utils/typewriter.js';

const pause = ms => new Promise(r => window.setTimeout(r, ms));

/* ---------------------------------------------------------------------
   Finale : écriture déclenchée par IntersectionObserver
   --------------------------------------------------------------------- */
export function initMessageFinal() {
  const boite = document.getElementById('message-final');
  if (!boite) return;

  const lignes    = [...boite.querySelectorAll('[data-machine]')];
  const signature = document.querySelector('.signature');
  const reduit    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduit || !lignes.length || !('IntersectionObserver' in window)) return;

  boite.classList.add('message-final--frappe');
  if (signature) signature.classList.add('signature--attente');

  const observateur = new IntersectionObserver(async (entrees, obs) => {
    if (!entrees.some(e => e.isIntersecting)) return;
    obs.disconnect();

    for (const ligne of lignes) {
      const plein  = ligne.querySelector('.message-final__plein');
      const frappe = ligne.querySelector('.message-final__frappe');
      if (!plein || !frappe) continue;
      await ecrire(frappe, plein.textContent);
      await pause(600);
    }
    if (signature) signature.classList.add('vue');
  }, { threshold: 0.6 });

  observateur.observe(boite);
}

/* ---------------------------------------------------------------------
   Lettre : écriture déclenchée par programme quand l'écran 9 s'active
   --------------------------------------------------------------------- */
export async function ecrireLettre() {
  const boite = document.getElementById('message-lettre');
  if (!boite) return;

  const lignes = [...boite.querySelectorAll('[data-machine]')];
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduit || !lignes.length) return;

  boite.classList.add('message-final--frappe');

  for (const ligne of lignes) {
    const plein  = ligne.querySelector('.message-final__plein');
    const frappe = ligne.querySelector('.message-final__frappe');
    if (!plein || !frappe) continue;
    await ecrire(frappe, plein.textContent);
    await pause(600);
  }
}