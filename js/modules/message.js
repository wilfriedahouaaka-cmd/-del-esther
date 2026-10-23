/* =====================================================================
   Message final — écrit lettre par lettre quand on arrive dans la finale
   ---------------------------------------------------------------------
   Le texte vit dans index.html (#message-final), un paragraphe
   [data-machine] par ligne. Pour changer ou allonger le message, on ajoute
   ou modifie ces paragraphes : aucun JS à toucher.
   Sans JS, sans IntersectionObserver ou en mouvement réduit : le texte
   est simplement affiché en entier.
   ===================================================================== */

import { ecrire } from '../utils/typewriter.js';

const pause = ms => new Promise(r => window.setTimeout(r, ms));

export function initMessageFinal() {
  const boite = document.getElementById('message-final');
  if (!boite) return;

  const lignes    = [...boite.querySelectorAll('[data-machine]')];
  const signature = document.querySelector('.signature');
  const reduit    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Affichage direct : rien à animer */
  if (reduit || !lignes.length || !('IntersectionObserver' in window)) return;

  /* À partir d'ici le JS prend la main : texte complet masqué (il garde la
     place et reste lisible par les lecteurs d'écran), frappe visible. */
  boite.classList.add('message-final--frappe');
  if (signature) signature.classList.add('signature--attente');

  const observateur = new IntersectionObserver(async (entrees, obs) => {
    if (!entrees.some(e => e.isIntersecting)) return;
    obs.disconnect();                       // une seule fois

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
