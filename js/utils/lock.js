/* =====================================================================
   Del & Esther — Le Jardin Caché · utilitaire verrou (anti double-clic)
   ---------------------------------------------------------------------
   withLock(fn, lockRef) exécute fn une seule fois tant qu'elle n'est pas
   terminée (promesse résolue). Utilisé pour protéger les transitions
   (ouverture porte, changement de scène) contre les clics répétés.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - commentaires en français
   ===================================================================== */

/**
 * Verrou simple anti double-exécution.
 * @param {Function} fn - Fonction async à exécuter (retourne une Promise).
 * @param {Object} lockRef - Objet muté { locked: boolean } pour partager l'état.
 * @returns {Promise<any>} Résultat de fn, ou undefined si déjà verrouillé.
 */
export function withLock(fn, lockRef = { locked: false }) {
  if (lockRef.locked) {
    return Promise.resolve(undefined);
  }

  lockRef.locked = true;

  try {
    const result = fn();
    // Supporte fn synchrone ou asynchrone
    return Promise.resolve(result).finally(() => {
      lockRef.locked = false;
    });
  } catch (err) {
    lockRef.locked = false;
    return Promise.reject(err);
  }
}

/**
 * Crée un verrou nommé réutilisable (pour plusieurs éléments partageant le même verrou).
 * @returns {{ locked: boolean, withLock: Function }}
 */
export function createLock() {
  const lock = { locked: false };
  return {
    get locked() { return lock.locked; },
    withLock: (fn) => withLock(fn, lock)
  };
}