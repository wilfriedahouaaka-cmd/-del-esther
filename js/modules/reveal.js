/* =====================================================================
   Del & Esther — Le Jardin Caché · apparition au défilement (IntersectionObserver)
   ---------------------------------------------------------------------
   Lit l'attribut data-delai (en secondes) sur chaque élément .apparition,
   l'applique à la variable CSS --delai via le CSSOM (autorisé par la CSP),
   puis ajoute la classe .visible quand l'élément entre dans le viewport.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - commentaires en français
   ===================================================================== */

/* Délai par défaut si data-delai est absent ou invalide. */
const DELAI_DEFAUT = 0;

/* Sélecteur des éléments qui doivent apparaître au défilement. */
const SELECTIONNEUR = '.apparition';

/**
 * Lit data-delai sur un élément et applique la valeur à --delai via le CSSOM.
 * La CSP autorise cette manipulation (ce n'est pas un style inline dans le HTML).
 * @param {HTMLElement} element
 */
function appliquerDelai(element) {
  const delaiBrut = element.dataset.delai;
  const delai = delaiBrut !== undefined ? parseFloat(delaiBrut) : DELAI_DEFAUT;

  if (Number.isFinite(delai)) {
    element.style.setProperty('--delai', delai + 's');
  }
}

/**
 * Initialise l'observation des apparitions.
 * Chaque élément .apparition reçoit --delai via le CSSOM,
 * puis la classe .visible quand il devient visible à l'écran.
 */
export function initApparitions() {
  const elements = document.querySelectorAll(SELECTIONNEUR);

  /* Applique --delai à chaque élément au démarrage (via CSSOM, CSP-compatible). */
  elements.forEach(appliquerDelai);

  /* IntersectionObserver : ajoute .visible quand l'élément entre dans le viewport. */
  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (entree.isIntersecting) {
          entree.target.classList.add('vue');
          /* Plus besoin d'observer une fois apparu. */
          observateur.unobserve(entree.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((element) => observateur.observe(element));
}
