# Del & Esther — Le Jardin Caché

*Expérience web immersive — un jardin secret qui devient musée.*

---

## 1. Le projet

Un site-cadeau pour **Esther**, créé par Wilfried (Kofira), à partir du storyboard
validé par **Del** : son histoire (bébé, le micro, la rencontre), puis les
comparaisons d'Esther à des œuvres d'art.

**Direction créative retenue** : *le jardin se transforme progressivement en
musée* — une seule histoire qui défile, pas deux sites collés ensemble.
Inspiré de l'ambiance et des techniques d'Immersive Garden, The Price of Every
Door et Maskatorium (sans rien copier).

---

## 2. Le parcours (4 scènes)

| # | Scène | Ce qu'on y voit | Origine |
|---|---|---|---|
| 1 | **Le portail** | Une arche fermée, une serrure, un filet de lumière. Clic → la porte s'ouvre en 3D, la caméra avance dans la lumière | Jardin |
| 2 | **Le jardin** | L'histoire de Del : photo bébé, photo au micro, récits. Lucioles dans l'air | Jardin |
| 3 | **Le musée** | 3 œuvres en cadres dorés avec plaques (les punchlines de Del). Le décor devient doré | Musée |
| 4 | **La finale** | Le duo Del/Esther, la phrase de clôture, la signature manuscrite | Les deux |

---

## 3. Comment tester

Aucune installation, aucun build. Deux options :

1. **Double-cliquer sur `index.html`** (fonctionne, sauf les modules ES6 selon
   le navigateur — Chrome/Edge gèrent).
2. **Recommandé** : serveur local, par ex. avec l'extension VS Code
   « Live Server », ou `python -m http.server` dans ce dossier.

⚠️ **GSAP** est chargé depuis un CDN : il faut une connexion internet pour
l'ouverture animée de la porte. **Sans internet, la porte s'ouvre quand même**
(une classe CSS prend le relais) — c'est voulu.

---

## 4. Arborescence

```
index.html        les 4 scènes, dans l'ordre du parcours
style.css         tout le design, commenté par section (1 à 11)
js/main.js        point d'entrée : musique + lancement des modules
js/utils/lock.js  withLock() — verrou anti double-clic
js/modules/
  portal.js       ouverture 3D de la porte (GSAP + repli CSS)
  jardin.js       la traversée : de la porte ouverte jusqu'à l'intérieur
  ambient.js      les lucioles + la bascule de ton (jardin → musée)
  reveal.js       apparition des éléments au défilement (IntersectionObserver)
  medias.js       les vidéos ne jouent qu'à l'écran
assets/           photos (3), vidéos (34), musique (1)
```

---

## 5. Les recettes (modifier sans casser)

| Je veux… | Où je touche |
|---|---|
| **Changer un texte** | `index.html`, dans la scène concernée — le texte est dans le HTML, jamais dans le JS |
| **Ajouter une photo** | Copier le fichier dans `assets/photos/`, puis ajouter une balise `<img ... loading="lazy">` voulue un élément `.apparition` |
| **Ajouter une vidéo** | Copier dans `assets/videos/`, puis `<video loop muted playsinline preload="metadata" src="assets/videos/NOM.mp4#t=0.1"></video>` — elle se met en pause toute seule hors écran |
| **Ajouter une œuvre au musée** | Dupliquer un bloc `<figure class="oeuvre apparition">` dans la scène `#musee`, changer le média, la plaque et la phrase |
| **Changer les couleurs** | `style.css`, tout en haut : le bloc `:root` — les variables `--vert-profond`, `--or`, `--creme`… |
| **Changer la musique** | Remplacer `assets/audio/tes-une-etoile.mp3` (même nom = rien à toucher ailleurs) |
| **Ajouter une scène** | Dupliquer une `<section class="scene">` dans `index.html` et l'insérer à sa place. Vérifier que ses médias existent |

---

## 6. Les règles du projet (AGENTS.md — jamais y déroger)

- ❌ **Aucun `innerHTML`** → `textContent`, `createElement`, `replaceChildren`
- ❌ **Aucun handler inline** (`onclick=` dans le HTML) → `addEventListener`
- ✅ Modules ES6, un point d'entrée : `js/main.js`
- ✅ Toute transition protégée par `withLock()` (verrou anti double-clic)
- ✅ `prefers-reduced-motion` respecté partout : animations coupées, état final
  appliqué immédiatement, vidéos sans lecture automatique
- ✅ Commentaires en français dans le code

---

## 7. Technique

- **Pas de framework, pas de build** : HTML/CSS/JS purs. Déployable tel quel
  (GitHub Pages, Netlify…).
- **GSAP 3.12** (CDN) : la chorégraphie d'ouverture de la porte. Repli CSS
  automatique s'il ne se charge pas.
- **CSS 3D** (`perspective` + `transform-origin` aux gonds) pour la porte —
  Three.js a été écarté : 600 Ko de gagnés, et le rendu est identique ici.
- **Performance** : images en `lazy`, vidéos en `preload="metadata"` et jouées
  seulement à l'écran, particules réduites sur mobile.
- **Accessibilité** : une seule balise `h1`, `aria-hidden` sur les scènes
  hors parcours, cibles tactiles ≥ 44 px, focus visible, clavier supporté.

---

## 8. État d'avancement

| Tâche | État |
|---|---|
| 1. Architecture et base | ✅ Terminé |
| 2. Écran d'entrée (porte fermée) | ✅ Terminé |
| 3. Ouverture 3D de la porte | ✅ Terminé |
| 4. Traversée vers le jardin | ✅ Terminé |
| 5. Contenu immersif (textes + vidéos) | ✅ Terminé |
| 6. Polish et cohérence | ✅ Terminé |

**Projet complet.** Rien n'a été commité dans Git pour l'instant (dépôt vierge
initialisé).

---

## 9. Historique des décisions

| Décision | Raison |
|---|---|
| CSS 3D plutôt que Three.js pour la porte | Même effet, 600 Ko de moins, mieux sur mobile |
| GSAP chargé en repli CSS | Le site reste ouvert et fonctionnel sans internet |
| Vidéos jouées seulement à l'écran | Évite la chauffe et la batterie sur téléphone |
| `--delai` écrit dans le HTML | Le rythme des apparitions se règle sans toucher au CSS |
| Aucun `innerHTML` (règle du projet) | Sécurité + maintenabilité (voir AGENTS.md) |
| Ancien site Del & Esther supprimé | Remplacé par cette expérience — l'ancien code reste sur GitHub `wilfriedahouaaka-cmd/-del-esther` |

---

*Ce document est la référence en cas de reprise du projet. Il est mis à jour à
chaque modification.*

---

## Mise à jour du 23 octobre 2026

- **Galerie** : les vidéos du dossier `assets/videos/` (sauf 3 doublons) sont affichées en aperçus dans le musée (`.mur`). Les aperçus sont dans `assets/posters/` (un `.jpg` par vidéo, ~18 Ko) ; la vidéo ne se charge qu'au clic.
- **Pop-up** : `js/modules/visionneuse.js` (élément `<dialog>`) agrandit les photos et lit les vidéos ; la musique se met en pause pendant une vidéo.
- **Message final** : `js/modules/message.js` + `js/utils/typewriter.js`. Le texte vient de `-del-esther-main/js/main.js` (constante `finalMessageText`) : le premier paragraphe est sur l'écran 8 (`#message-final`), la suite dans la lettre (`#message-lettre`, 2 étapes).
- **Rechargement** (F5 / Ctrl+F5) : le parcours repart de la porte (`scrollRestoration = 'manual'` dans `main.js`).
- **Bascule or** (`ambient.js`) : se déclenche maintenant sur la bande centrale de l'écran, même si le musée est très long.
- Doublons repérés (contenu identique) : `ax.mp4`=`kk.mp4`, `abz.mp4`=`W.mp4`, `sze.mp4`=`Z.mp4`.
- Pour ajouter une vidéo à la galerie : copier le `.mp4`, créer son aperçu (`ffmpeg -ss 0.6 -i X.mp4 -frames:v 1 -vf scale=480:-2 -q:v 6 assets/posters/X.jpg`), dupliquer un bouton `.vignette`.
- Correction du déverrouillage du portail : `entrerDansLeJardin()` retire `portail-bloque` et ajoute `dans-le-jardin` ; `scrollerVersJardin()` utilise `getBoundingClientRect()` avec une sécurité de timeout (3000 ms) ; `reveal.js` ajoute la classe `.vue` (et non `.visible`) ; `portal.js` ne force plus les classes `.scene--cachee`/`.scene--visible`.

