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

import { createLock } from '../utils/lock.js';
import {
  ecrireLettre,
  initMessageFinal,
  reinitialiserLettre,
  reinitialiserMessageFinal,
} from './message.js';
import { afficherOeuvreGalerie, resetGalerie } from './galerie.js';
import { lancerMurCadres, resetMur } from './mur.js';
import { resetEtapes } from './etapes.js';
import { afficherApparitionsVisibles } from './reveal.js';
import { initLenis } from '../utils/lenis.js';

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

  /* Le bouton des portes de la galerie a sa propre transition 3D :
     il ne doit pas passer par le handler générique .btn-next. */
  initPortesGalerie();
}

/**
 * Passe à l'écran suivant.
 */
export function prochain() {
  return go(cur + 1);
}

/**
 * Affiche immédiatement les .apparition d'une scène dans deux cas :
 * - les deux premiers écrans (portail, jardin bébé) doivent être complets
 *   dès l'arrivée, sans attendre un scroll ;
 * - la scène n'est pas défilable : ScrollTrigger n'aurait aucun mouvement
 *   pour révéler les éléments, qui resteraient invisibles.
 * Pour une scène défilable plus bas dans le parcours, on laisse au
 * contraire ScrollTrigger piloter l'animation (y/opacity avec scrub).
 * @param {HTMLElement|null} scene
 * @param {number} index
 */
function afficherApparitionsSiNecessaire(scene, index) {
  if (!scene) return;
  const defilable = scene.scrollHeight > scene.clientHeight + 2;
  if (index <= 1 || !defilable) {
    afficherApparitionsVisibles(scene);
  }
}

/**
 * Active l'écran n, désactive les autres, met en pause les vidéos.
 * Retourne une promesse qui se résout quand la transition est prête.
 * @param {number} n - index de l'écran à activer
 */
export function go(n) {
  return verrou.withLock(async () => {
    const ancien = ecrans[cur];
    const nouveau = ecrans[n];
    cur = n;

    /* Lenis doit piloter la nouvelle scène : le site défile à l'intérieur
       de chaque .scene, pas sur window. L'instance précédente est détruite. */
    const lenis = initLenis(nouveau);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gsapDispo = typeof window.gsap !== 'undefined';

    /* Basculement immédiat : mouvement réduit, GSAP indisponible,
       ou demande de rester sur le même écran. */
    if (prefersReduced || !gsapDispo || !ancien || !nouveau || ancien === nouveau) {
      if (gsapDispo) {
        ecrans.forEach((ecran) => {
          window.gsap.set(ecran, { clearProps: 'opacity,transform' });
        });
      }
      ecrans.forEach((ecran, i) => {
        ecran.classList.toggle('active', i === n);
      });
    } else {
      /* Fondu enchaîné GSAP : l'ancien s'efface pendant que le nouveau
         apparaît. On coupe la transition CSS le temps de l'animation
         pour éviter que les deux systèmes se superposent. */
      const transitionAncien = ancien.style.transition;
      const transitionNouveau = nouveau.style.transition;
      ancien.style.transition = 'none';
      nouveau.style.transition = 'none';

      nouveau.classList.add('active');
      window.gsap.set(ancien, { opacity: 1 });
      window.gsap.set(nouveau, { opacity: 0, scale: 0.96, y: 12 });

      await new Promise((resolve) => {
        const tl = window.gsap.timeline({
          onComplete: () => {
            ancien.classList.remove('active');
            window.gsap.set(ancien, { clearProps: 'opacity,transform' });
            window.gsap.set(nouveau, { clearProps: 'opacity,transform' });
            ancien.style.transition = transitionAncien;
            nouveau.style.transition = transitionNouveau;
            resolve();
          },
        });

        tl.to(ancien, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
        }, 0);

        tl.to(nouveau, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
        }, 0);
      });
    }

    /* La nouvelle scène est active : Lenis recalcule sa limite de scroll. */
    lenis?.resize();

    /* Toutes les vidéos en pause lors d'un changement d'écran */
    document.querySelectorAll('video').forEach((v) => v.pause());

    /* Logique spécifique par écran */
    if (n === 1) {
      /* Écran jardin bébé : rien de particulier */
    }

    if (n === 3) {
      /* Écran révélation d'Esther : l'étoile bourgeonne via CSS (.bloomed) */
      const ecran = document.querySelector(SELECTEURS.revelation);
      if (ecran) {
        ecran.classList.add('bloomed');
      }
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
      /* Écran finale : le message s'écrit quand il devient visible,
         puis le bouton « Continuer » apparaît. */
      initMessageFinal();
    }

    if (n === 8) {
      /* Écran lettre : premier paragraphe seulement, les suivants
         seront révélés par les boutons de la lettre. */
      ecrireLettre();
    }

    /* Portail et jardin bébé : affichage complet immédiat. Scène non
       défilable : pas de scroll possible, donc affichage immédiat aussi.
       Scène défilable plus bas : ScrollTrigger garde la main.
       On attend la logique spécifique ci-dessus : .bloomed et la première
       œuvre de la galerie changent la hauteur de la scène. */
    afficherApparitionsSiNecessaire(nouveau, n);

    /* La scène active a changé : ScrollTrigger doit recalculer ses points
       de départ (parallaxe, apparitions) pour le bon scroller. */
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.ScrollTrigger.refresh();
        /* Le refresh peut modifier la hauteur mesurée : on réajuste Lenis. */
        lenis?.resize();
        /* Le refresh peut réappliquer un tween résiduel : on refixe
           l'état final uniquement quand la scène ne doit pas être animée. */
        afficherApparitionsSiNecessaire(nouveau, n);
      });
    }
  });
}

/**
 * Remet tous les écrans et leurs états à zéro pour la relecture.
 * Protegé par withLock depuis main.js.
 */
export function reset() {
  /* 1. Tous les écrans inactifs sauf le portail (index 0) ;
        chaque scène repart de son début. */
  ecrans.forEach((ecran, i) => {
    ecran.classList.toggle('active', i === 0);
    ecran.scrollTop = 0;
  });
  cur = 0;

  /* 2. Révélation : retirer .bloomed */
  const revelation = document.querySelector(SELECTEURS.revelation);
  if (revelation) revelation.classList.remove('bloomed');

  /* 3. Portes de la galerie : fermer */
  const portesGalerie = document.querySelector(SELECTEURS.portesGalerie);
  if (portesGalerie) portesGalerie.classList.remove('doors-ouvert');

  /* 4. Finale : retirer .shown */
  const finale = document.querySelector(SELECTEURS.finale);
  if (finale) finale.classList.remove('shown');

  /* 5. Vidéos : pause et retour au début */
  document.querySelectorAll('video').forEach((v) => {
    v.pause();
    v.currentTime = 0;
  });

  /* 6. Récit : les deuxièmes textes redeviennent cachés. */
  resetEtapes();

  /* 7. Galerie : retour à la première œuvre. */
  resetGalerie();

  /* 8. Mur : retour à la première page de 8 vignettes. */
  resetMur();

  /* 9. Messages : la finale et la lettre repartent de zéro. */
  reinitialiserMessageFinal();
  reinitialiserLettre();

  /* La relecture est terminée : on rend une promesse pour conserver
     l'interface existante de main.js. */
  return Promise.resolve();
}

/**
 * Ouvre les portes métalliques de la galerie avant de passer au musée.
 * Le CSS existant (.doors + .doors-ouvert) applique la rotation 3D ;
 * on attend la fin de la transition de 1,6 s, puis on change d'écran.
 * En mouvement réduit, l'ouverture est instantanée et on enchaîne.
 */
function initPortesGalerie() {
  const bouton = document.getElementById('btn-open-gallery');
  const scene = document.querySelector(SELECTEURS.portesGalerie);
  if (!bouton || !scene) return;

  const verrouPortes = createLock();

  bouton.addEventListener('click', () => {
    verrouPortes.withLock(async () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* Déclenche l'ouverture 3D définie dans style.css. */
      scene.classList.add('doors-ouvert');

      if (!prefersReduced) {
        /* Attendre la fin de la transition CSS (1,6 s), avec un délai de
           sécurité si l'événement transitionend ne se déclenche pas. */
        await new Promise((resolve) => {
          const porte = scene.querySelector('.doors .porte');
          if (!porte) {
            resolve();
            return;
          }

          let termine = false;
          const finir = () => {
            if (termine) return;
            termine = true;
            porte.removeEventListener('transitionend', finir);
            resolve();
          };

          porte.addEventListener('transitionend', finir, { once: true });
          window.setTimeout(finir, 1900);
        });
      }

      await go(5);
    });
  });
}

