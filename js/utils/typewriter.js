/* =====================================================================
   Machine à écrire — affiche un texte lettre par lettre
   ---------------------------------------------------------------------
   Utilisation : await ecrire(element, 'texte', 38);   (délai en ms)
   Mouvement réduit : le texte apparaît d'un coup, sans effet.
   Jamais d'innerHTML : on n'écrit que du texte (textContent).
   ===================================================================== */

export function ecrire(element, texte, delai = 38) {
  return new Promise(resolve => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduit || !texte) { element.textContent = texte; resolve(); return; }

    let i = 0;
    const suite = () => {
      i += 1;
      element.textContent = texte.slice(0, i);
      if (i < texte.length) window.setTimeout(suite, delai);
      else resolve();
    };
    suite();
  });
}
