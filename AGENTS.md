# AGENTS.md — Del & Esther — Le Jardin Caché

Ce document définit les **Règles d'Or** du projet. Toute intervention sur ce
code doit les respecter à la lettre.

---

## 1. Interdiction absolue de `innerHTML`

- ❌ **Interdit** : `innerHTML`, `insertAdjacentHTML`, `outerHTML`,
  `document.write()`, `eval()`.
- ✅ **Obligatoire** : construire le DOM avec des méthodes sûres :
  - `document.createElement(tag)`
  - `el.textContent = '...'` pour le texte (jamais de HTML)
  - `el.replaceChildren()` pour vider un conteneur
  - `el.append(...)` / `el.prepend(...)` pour insérer des nœuds
- Toute occurrence de `innerHTML` retrouvée dans le code doit être signalée et
  corrigée.

## 2. Zéro handler inline dans le HTML

- ❌ **Interdit** : attributs `onclick`, `onerror`, `onload`, `onchange`, etc.
  écrits directement dans `index.html`.
- ✅ **Obligatoire** : attacher tous les écouteurs en JavaScript avec
  `addEventListener` (ou `withLock` — voir règle 4).
- Conséquence : les fonctions appelées depuis le HTML doivent être exportées
  depuis les modules et référencées par un sélecteur + `addEventListener`.

## 3. Architecture modulaire ES6

- Point d'entrée unique : `js/main.js`, chargé via
  `<script type="module" src="js/main.js"></script>`.
- Toute la logique vit dans des modules ES6 (`import` / `export`).
- Organisation :
  - `js/utils/` — fonctions génériques partagées (`withLock`, `createLock`, `typewriter`).
  - `js/modules/` — logique par domaine (`portal.js`, `jardin.js`, `ambient.js`, `reveal.js`, `medias.js`, `message.js`, `visionneuse.js`).
  - `js/main.js` — bootstrap : rattache les modules au DOM.
- Aucune variable globale (`window.x`) sauf utilité impérative prouvée.

## 4. Protection anti double-clic (signature `withLock`)

- `withLock(fn, lockRef)` : `fn` est exécutée une seule fois tant qu'elle
  n'est pas terminée (promesse résolue). `lockRef` est un objet
  `{ locked: boolean }` partagé.
- `createLock()` : crée un verrou réutilisable `{ locked, withLock(fn) }`.
- Toute transition ou navigation entre écrans doit passer par le verrou.
- Un clic pendant une transition est ignoré ; le verrou se libère quand la
  promesse de `fn` se résout.

## 5. Politique de sécurité du contenu (CSP)

- `index.html` définit une CSP stricte :
  - `script-src 'self' https://cdn.jsdelivr.net` + hash du script inline
  - `style-src 'self'` : **aucun attribut `style=""` dans le HTML** (utiliser des
    classes ou `:nth-child`)
  - `img-src 'self'`, `media-src 'self'` : aucune image/distante distante
  - Aucune image distante dans les `url()` du CSS
- Ne jamais assouplir la CSP (pas d'`unsafe-inline`, pas de domaine distant
  non maîtrisé).

## 6. Textes dans le HTML, jamais dans le JS

- Le contenu textuel (messages, légendes, phrases) vit dans `index.html`.
- Le JS ne fait que lire et afficher ce texte (`textContent`).

## 7. Respect de `prefers-reduced-motion`

- Toutes les animations et transitions sont neutralisées quand l'utilisateur
  a demandé la réduction des mouvements.
- Le texte s'affiche d'un coup, sans machine à écrire.
- Les boutons "tardifs" sont visibles immédiatement.
- L'ouverture de la porte fonctionne toujours (repli CSS sans GSAP).

## 8. GSAP avec repli CSS

- GSAP est chargé depuis le CDN (nécessite internet pour l'animation
  fluide). Sans internet, une classe CSS prend le relais
  (`.porte--ouverte`, `rotateY ±108deg`).
- Le site reste fonctionnel dans les deux cas.

## 9. Design CSS préservé

- Le fichier `style.css` est la **source de vérité** du design.
- ❌ Ne jamais modifier : couleurs, variables CSS (`:root`), animations
  (`@keyframes`), classes et ID utilisés par le HTML/JS/GSAP.
- Toute nouvelle classe doit être ajoutée **en plus**, jamais en remplacement.
- Les variables dont la valeur change sont notées dans le README.

---

## Checklist avant chaque intervention

1. Aucun `innerHTML` introduit.
2. Aucun attribut handler inline ajouté.
3. Code placé dans le bon module (pas de `main.js` surchargé).
4. Transitions protégées par `withLock` / `createLock` (signature objet).
5. CSP respectée (pas de `style=""`, pas d'image distante).
6. `prefers-reduced-motion` respecté.
7. CSS inchangé sauf demande explicite du propriétaire.