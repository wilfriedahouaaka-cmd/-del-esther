/* =====================================================================
   Del & Esther — Le Jardin Caché · point d'entrée (module ES6)
   ---------------------------------------------------------------------
   Règles du projet (AGENTS.md) :
     - aucun innerHTML      -> replaceChildren() / textContent / createElement()
     - aucun handler inline -> tout passe par addEventListener
     - transitions protégées par withLock() (à partir de la tâche 3)
   ===================================================================== */

import { initScenes, go, prochain, reset } from './modules/scenes.js';
import { initPortail } from './modules/portal.js';
import { initLucioles, initTon, initBraises } from './modules/ambient.js';
import { initApparitions } from './modules/reveal.js';
import { initMedias } from './modules/medias.js';
import { initVisionneuse } from './modules/visionneuse.js';
import { initMessageFinal } from './modules/message.js';

/* Rechargement (F5, Ctrl+F5) : le parcours repart toujours de la porte.
   Sans ceci, le navigateur restaure l'ancien défilement alors que la page
   est verrouillée (portail-bloque) : on se retrouvait coincé au milieu. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('pageshow', e => { if (e.persisted) window.location.reload(); });

/* Sélecteur utilitaire */
const $ = s => document.querySelector(s);

/* ---------------------------------------------------------------------
   1. Musique de fond — une seule piste, en boucle, jamais interrompue
   ---------------------------------------------------------------------
   La musique ne démarre QUAND l'utilisateur clique sur "Ouvre la porte"
   (via le callback onOuvert du portail), jamais au clavier. */
const musique = $('#musique');
const btnSon  = $('#btn-son');
const VOLUME  = 0.45;          // volume de fond, laissé la place au son des vidéos plus tard
let coupe     = false;

/**
 * Tente de lancer la musique (appelé une seule fois à l'ouverture de la porte).
 * Respecte la politique d'autoplay : si le navigateur bloque, on attend un geste.
 */
function demarrerMusique() {
  if (!musique || coupe || !musique.paused) return;

  const promesse = musique.play();
  if (promesse) {
    promesse.catch(() => {
      // Si bloqué (pas de geste utilisateur), on attend le premier clic/touche
      const attendreGeste = () => {
        if (!coupe && musique.paused) musique.play().catch(() => {});
        document.removeEventListener('pointerdown', attendreGeste);
        document.removeEventListener('keydown', attendreGeste);
      };
      document.addEventListener('pointerdown', attendreGeste, { once: true });
      document.addEventListener('keydown', attendreGeste, { once: true });
    });
  }
}

if (musique && btnSon) {
  musique.volume = VOLUME;

  btnSon.addEventListener('click', () => {
    coupe = !coupe;
    musique.muted = coupe;
    btnSon.textContent = coupe ? '🔇' : '🔊';
    btnSon.setAttribute('aria-label', coupe ? 'Activer la musique' : 'Couper la musique');
  });
}

/* ---------------------------------------------------------------------
   2. LE PORTAIL — ouverture 3D de la porte, puis traversée (tâches 3-4)
   --------------------------------------------------------------------- */
/* Quand la porte est entièrement ouverte :
   1. On lance la musique (premier geste utilisateur = clic sur le bouton)
   2. On bascule sur l'écran suivant via go(1) */
initScenes();
initPortail({
  onOuvert: () => {
    demarrerMusique();
    go(1);
  }
});

/* Les lucioles du jardin (elles restent invisibles jusqu'à l'arrivée) */
initLucioles();

/* Les braises du musée (apparaisent quand body.dans-le-musee est ajouté) */
initBraises();

/* Les éléments entrent à l'écran au fur et à mesure du défilement */
initApparitions();

/* Les vidéos ne jouent que lorsqu'elles sont visibles */
initMedias();

/* Le décor s'échauffe (or) dès que le musée est atteint */
initTon();

/* Le pop-up qui agrandit les photos et lit les vidéos */
initVisionneuse({ musique, musiqueCoupee: () => coupe });

/* Le message final s'écrit lettre par lettre */
initMessageFinal();

/* Boutons "Continuer" de chaque écran : passent à l'écran suivant */
document.querySelectorAll('.btn-next').forEach((bouton) => {
  bouton.addEventListener('click', () => {
    prochain();
  });
});

/* Bouton "Relire l'Épopée" : remise à zéro complète + retour au portail */
const btnRelire = document.getElementById('btn-relire-epopee');
if (btnRelire) {
  btnRelire.addEventListener('click', () => {
    reset().then(() => {
      go(0);
    });
  });
}

/* ---------------------------------------------------------------------
   3. Fin du parcours de démarrage — le site est complet (tâches 1 à 6)
   --------------------------------------------------------------------- */