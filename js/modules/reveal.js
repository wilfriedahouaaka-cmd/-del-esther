/* =====================================================================
   Del & Esther — Le Jardin Caché · apparition au défilement (GSAP ScrollTrigger)
   ---------------------------------------------------------------------
   Remplace l'IntersectionObserver basique par GSAP ScrollTrigger.
   Chaque élément .apparition est animé en y (déplacement vertical) et
   opacity, lié à sa position dans le viewport (scrub: true), pour un
   effet cinématique lié au scroll.

   Respecte prefers-reduced-motion : si activé, pas d'animation, les
   éléments s'affichent d'un coup (sans transition).

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - modules ES6          -> import / export
   - commentaires en français
   ===================================================================== */

/* Sélecteur des éléments qui doivent apparaître au défilement. */
const SELECTIONNEUR = '.apparition';

/**
 * Lit data-delai sur un élément et applique la valeur à --delai via le CSSOM.
 * La CSP autorise cette manipulation (ce n'est pas un style inline dans le HTML).
 * @param {HTMLElement} element
 */
function appliquerDelai(element) {
  const delaiBrut = element.dataset.delai;
  const delai = delaiBrut !== undefined ? parseFloat(delaiBrut) : 0;

  if (Number.isFinite(delai)) {
    element.style.setProperty('--delai', delai + 's');
  }
}

/**
 * Affichage immédiat (sans aucune animation) pour prefers-reduced-motion.
 * @param {HTMLElement} element
 */
function rendreVisibleImmédiat(element) {
  /* Aucune transition : l'élément doit être visible et cliquable tout de suite. */
  element.style.transition = 'none';
  element.style.setProperty('opacity', '1');
  element.style.setProperty('transform', 'none');
  element.style.setProperty('filter', 'blur(0)');
}

/**
 * Force l'affichage immédiat de TOUS les .apparition d'une scène, sans
 * tenir compte du viewport. Indispensable pour l'écran d'accueil : sur
 * petit écran, le bouton « Ouvre la porte » peut dépasser en bas et
 * resterait sinon à opacity 0 (donc invisible et non cliquable).
 * @param {HTMLElement|null} scene
 */
export function afficherApparitionsVisibles(scene) {
  if (!scene || typeof window.gsap === 'undefined') return;

  scene.querySelectorAll('.apparition').forEach((element) => {
    /* La transition CSS de .apparition retarderait l'état final : on la
       neutralise pour que l'affichage soit réellement immédiat. */
    element.style.transition = 'none';

    /* On retire d'abord le ScrollTrigger de cet élément. S'il est tué
       après la fixation de l'état final, il peut réappliquer l'état de
       départ du tween (opacity 0) : c'est ce qui faisait disparaître le
       texte de certaines scènes. */
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) trigger.kill();
      });
    }

    /* Puis on arrête toute animation GSAP en cours sur cet élément. */
    window.gsap.killTweensOf(element);

    /* Enfin seulement, on fixe l'état final : opacité, position, échelle
       et flou. L'ordre est important pour que rien ne l'écrase ensuite. */
    window.gsap.set(element, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
    });
  });
}

/**
 * Initialise les apparitions liées au défilement via GSAP ScrollTrigger.
 */
export function initApparitions() {
  const tousLesElements = [...document.querySelectorAll(SELECTIONNEUR)];

  /* Le bouton du portail doit être visible et cliquable dès l'arrivée,
     même si ScrollTrigger n'a pas encore pris la main (ou si le CDN GSAP
     est lent). On le sort de l'animation et on le fixe tout de suite :
     c'est le seul élément indispensable pour entrer dans l'expérience. */
  const boutonPortail = document.getElementById('btn-ouvrir');
  if (boutonPortail) rendreVisibleImmédiat(boutonPortail);

  const elements = tousLesElements.filter((element) => element !== boutonPortail);

  /* Applique --delai à chaque élément au démarrage (via CSSOM, CSP-compatible). */
  elements.forEach(appliquerDelai);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* GSAP ou ScrollTrigger indisponible : repli immédiat (tous visibles). */
  if (
    typeof window.gsap === 'undefined' ||
    typeof window.ScrollTrigger === 'undefined'
  ) {
    elements.forEach(rendreVisibleImmédiat);
    return;
  }

  /* Enregistre le plugin ScrollTrigger une seule fois. */
  try {
    window.gsap.registerPlugin(window.ScrollTrigger);
  } catch (e) {
    /* Plugin déjà enregistré ou erreur mineure : on continue. */
  }

  /* Si réduire les mouvements : pas d'animation, affichage immédiat. */
  if (prefersReduced) {
    elements.forEach(rendreVisibleImmédiat);
    return;
  }

  /* La transition CSS de 1,8 s entre en conflit avec le scrub : GSAP
     met à jour les styles à chaque frame, la transition les lisserait et
     donnerait l'impression que l'animation ne suit pas le défilement.
     On la neutralise uniquement quand GSAP pilote réellement les
     apparitions (le repli sans GSAP garde la transition CSS). */
  elements.forEach((element) => {
    element.style.transition = 'none';
  });

  /* Animation liée au scroll pour chaque élément .apparition :
     y (30px -> 0) et opacity (0 -> 1), pilotés par la position dans
     le viewport via scrub: true.
     Le site défile à l'intérieur de chaque .scene (overflow-y: auto) :
     on indique la scène comme scroller à ScrollTrigger. */
  elements.forEach((element) => {
    const scene = element.closest('.scene');

    window.gsap.fromTo(
      element,
      { y: 30, opacity: 0, filter: 'blur(8px)', scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          scroller: scene || undefined,
          start: 'top bottom-=100',
          end: 'top center',
          scrub: true,
        },
      }
    );
  });

  /* L'écran d'accueil est déjà visible : ses éléments doivent apparaître
     tout de suite, sans attendre un scroll (sinon le bouton reste caché). */
  afficherApparitionsVisibles(document.querySelector('.scene.active'));
}
