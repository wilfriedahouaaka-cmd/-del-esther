/* =====================================================================
   Visionneuse — le pop-up qui agrandit une œuvre (photo ou vidéo)
   ---------------------------------------------------------------------
   Éléments cliquables : .vignette (galerie), .oeuvre__cadre, .bloc__media.
   - Une vignette porte data-video (chemin) et data-titre ; elle n'affiche
     qu'une image d'aperçu : la vidéo ne se charge qu'au clic (léger).
   - Pour une œuvre du musée, titre et phrase sont lus dans sa plaque /
     légende ; sinon data-titre et data-texte.
   Utilise l'élément natif <dialog> : Échap ferme, le focus reste piégé.
   La musique de fond se met en pause pendant une vidéo, puis reprend.
   Aucun innerHTML : replaceChildren() / createElement() / textContent.
   ===================================================================== */

import { withLock } from '../utils/lock.js';

export function initVisionneuse({ musique = null, musiqueCoupee = () => false } = {}) {
  const boite  = document.getElementById('visionneuse');
  if (!boite || typeof boite.showModal !== 'function') return;

  const zone    = document.getElementById('visionneuse-media');
  const titre   = document.getElementById('visionneuse-titre');
  const texte   = document.getElementById('visionneuse-texte');
  const fermer  = document.getElementById('visionneuse-fermer');

  let declencheur = null;
  let musiqueActive = false;

  const sansHash = src => (src || '').split('#')[0];

  function lire(el) {
    const figure = el.closest('figure');
    const video  = el.querySelector('video');
    const image  = el.querySelector('img');
    return {
      video: el.dataset.video || sansHash(video && video.getAttribute('src')),
      image: image ? (image.currentSrc || image.src) : '',
      titre: el.dataset.titre
        || (figure && figure.querySelector('.plaque') && figure.querySelector('.plaque').textContent)
        || (image && image.alt) || '',
      texte: el.dataset.texte
        || (figure && figure.querySelector('figcaption p') && figure.querySelector('figcaption p').textContent)
        || ''
    };
  }

  function ouvrir(el) {
    const info = lire(el);
    let media;
    if (info.video) {
      media = document.createElement('video');
      media.src = info.video;
      media.controls = true;
      media.loop = true;
      media.playsInline = true;
      media.autoplay = true;
    } else if (info.image) {
      media = document.createElement('img');
      media.src = info.image;
      media.alt = info.titre;
    } else return;

    zone.replaceChildren(media);
    titre.textContent = info.titre;  titre.hidden = !info.titre;
    texte.textContent = info.texte;  texte.hidden = !info.texte;

    /* Les vidéos du décor se taisent ; la musique aussi pendant une vidéo */
    document.querySelectorAll('video').forEach(v => { if (!boite.contains(v)) v.pause(); });
    if (info.video && musique && !musique.paused) { musiqueActive = true; musique.pause(); }

    declencheur = el;
    boite.showModal();
    if (info.video) media.play().catch(() => {});
  }

  /* À la fermeture (bouton, Échap ou clic hors du cadre) */
  boite.addEventListener('close', () => {
    zone.replaceChildren();                       // stoppe et libère la vidéo
    if (musiqueActive && musique && !musiqueCoupee()) musique.play().catch(() => {});
    musiqueActive = false;
    if (declencheur) declencheur.focus({ preventScroll: true });
  });
  fermer.addEventListener('click', () => boite.close());
  boite.addEventListener('click', e => { if (e.target === boite) boite.close(); });

  document.querySelectorAll('.vignette, .oeuvre__cadre, .bloc__media').forEach(el => {
    const action = () => withLock(() => ouvrir(el), 400);
    el.addEventListener('click', action);
    if (el.tagName !== 'BUTTON') {          // un <button> gère déjà Entrée/Espace
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', 'Agrandir');
      el.tabIndex = 0;
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
      });
    }
  });
}
