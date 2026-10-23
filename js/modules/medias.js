/* =====================================================================
   Del & Esther — Le Jardin Caché · contrôle médias (vidéos)
   ---------------------------------------------------------------------
   Les vidéos ne jouent que lorsqu'elles sont visibles dans le viewport.
   Pause automatique hors écran. Respecte prefers-reduced-motion.

   Règles du projet (AGENTS.md) :
   - aucun innerHTML      -> textContent / createElement / replaceChildren
   - aucun handler inline -> addEventListener uniquement
   - commentaires en français
   ===================================================================== */

/** Sélecteur des vidéos à contrôler */
const SELECTOR_VIDEO = 'video[loop][muted][playsinline]';

/** Seuil de visibilité pour déclencher lecture/pause */
const THRESHOLD = 0.5;

/**
 * Initialise l'observation des vidéos.
 * Lecture quand visible, pause quand hors écran.
 */
export function initMedias() {
  const videos = document.querySelectorAll(SELECTOR_VIDEO);
  if (!videos.length) return;

  // Respecte prefers-reduced-motion : pas de lecture auto
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    videos.forEach(v => { v.pause(); v.removeAttribute('autoplay'); });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= THRESHOLD) {
        // Visible → lecture
        video.play().catch(() => {
          // Si lecture bloquée (pas de geste utilisateur), on attend le premier geste
          const playOnGesture = () => {
            video.play().catch(() => {});
            document.removeEventListener('pointerdown', playOnGesture);
            document.removeEventListener('keydown', playOnGesture);
          };
          document.addEventListener('pointerdown', playOnGesture, { once: true });
          document.addEventListener('keydown', playOnGesture, { once: true });
        });
      } else {
        // Hors écran → pause
        video.pause();
      }
    });
  }, { threshold: THRESHOLD });

  videos.forEach((video) => observer.observe(video));
}