const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
/* ===== MESSAGES DES POP-UPS =====
   'd' = photo/vidéo de DEL (message d'un garçon), 'e' = ESTHER (message pour elle).
   Un fichier non listé est considéré comme Esther. Ajoute ici les fichiers où Del apparaît. */
const S4_TEXT = "C'est en regardant le ciel que j'ai vu le reflet de ton visage se dessiner dans les astres.";
const WHO = { 'bebe.jpeg': 'd', 'photo-au-micro.jpeg': 'd' };
const MSG = {
  d: ["Avant même de te connaître, la vie préparait déjà notre rencontre.","Chaque mot prononcé ce jour-là cherchait déjà le chemin vers toi.","L'homme que je suis devenu rêve d'une seule chose : toi.","Je ne le savais pas encore, mais je me préparais à t'aimer.","Voilà celui qui a eu la chance de te rencontrer.","Tout ce que j'ai été m'a conduit jusqu'à toi."],
  e: ["Et là, tout s'est arrêté. Le temps. Le monde. Mon cœur.","Ce regard-là, c'est celui qui a changé ma vie.","Chaque seconde avec toi mérite d'être gardée précieusement.","Ton sourire, c'est le soleil de mes matins.","Dans chaque geste de toi, je vois notre avenir.","Toi, ma plus belle œuvre, ma plus grande fierté.","Un souvenir qui brille dans ma mémoire.","Chaque image de toi est une œuvre.","Le temps s'arrête quand je te regarde.","Tu illumines tout ce que tu touches.","Ces instants-là, je les chéris.","Mon cœur bat pour toi, encore et encore.","Toi, mon éternité.","Et si c'était à refaire, je te choisirais encore.","La femme que j'aime, celle avec qui je veux vieillir."]
};
const fileOf = el => decodeURIComponent((el.getAttribute('src') || '').split('#')[0].split('/').pop()).toLowerCase();
const msgByFile = {};
(() => { const n = { d: 0, e: 0 };
  document.querySelectorAll('.scene img, .scene video').forEach(m => {
    const f = fileOf(m); if (!f || msgByFile[f]) return;
    const w = WHO[f] || 'e'; msgByFile[f] = MSG[w][n[w]++ % MSG[w].length];
  }); })();

const scenes = $$('.scene'), punches = $$('.punch'), cells = $$('.cell');
const jardin = $('#audio-jardin'), musee = $('#audio-musee'), btnSound = $('#sound');
let cur = 0, pi = 0, muted = false, track = jardin;

/* Lucioles (légères : 14 seulement, animées en CSS) */
for (let i = 0; i < 14; i++) {
  const d = document.createElement('i');
  d.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--dx:${Math.random()*60-30}px;--dy:${Math.random()*60-30}px;animation-duration:${6+Math.random()*8}s;animation-delay:-${Math.random()*8}s`;
  $('#fireflies').append(d);
}

for (let i = 0; i < 18; i++) {
  const e = document.createElement('span');
  e.style.left = Math.random() * 100 + '%';
  e.style.animationDuration = (7 + Math.random() * 6) + 's';
  e.style.animationDelay = (Math.random() * 8) + 's';
  document.getElementById('embers').appendChild(e);
}

/* Navigation */
function go(n) {
  if (n === 0) {
    resetAll(); // Retour complet à l'état initial (incluant l'enveloppe)
  }
  cur = n;
  scenes.forEach((s, i) => s.classList.toggle('active', i === n));
  $$('video').forEach(v => v.pause());           // une seule vidéo à la fois
  document.body.classList.toggle('museum', n >= 5); // Musée à partir de la scène 5 (S0=Env, S1=Titre, S2=Bébé, S3=Micro, S4=Fleur, S5=Portes...)
  if (n === 3) { const s3 = scenes[3]; s3.classList.remove('ready'); setTimeout(() => s3.classList.add('ready'), 6200); }
  if (n === 4) {   // ciel étoilé : graine-étoile, rayons, légende tapée, puis photos « elle et moi »
    const s = scenes[4];
    s.classList.remove('sprout', 'bloomed', 'ready', 'duo');
    $('#s4-cap').textContent = ''; $('#s4-next').textContent = 'Continuer';
    setTimeout(() => s.classList.add('sprout'), 50);
    setTimeout(() => s.classList.add('bloomed'), 1700);
    setTimeout(() => typeWriter(S4_TEXT, $('#s4-cap')), 2400);
    setTimeout(() => s.classList.add('ready'), 7000);
  }
  if (n === 6) showPunch(0);                      // Galerie punchlines (S6)
  if (n === 7) cells.forEach((c, i) => setTimeout(() => c.classList.add('visible'), 300 + i * 350)); // Mur (S7)
  if (n === 8) {                                  // Finale (S8)
    setTimeout(() => scenes[8].classList.add('shown'), 200);
    const v = $('#scene-8 video'); v.currentTime = 0; v.play().catch(() => {});
  }
  if (n === 9) typeWriter(finalMessageText, $('#final-message'));
}

/**
 * Séquence de fermeture poétique : referme les portes du musée, puis le portail, puis l'enveloppe
 */
function closeStory() {
  const s0 = $('#scene-0');
  const s1 = $('#scene-1');
  const s5 = $('#scene-5');
  const s9 = $('#scene-9');

  // Cacher toutes les scènes actives pour préparer la séquence
  [s0, s1, s5, s9].forEach(s => s.classList.remove('active'));

  // TEMPS 1 : scène 5 (portes du musée) ouvertes, puis fermeture
  s5.classList.add('active', 'open');
  setTimeout(() => s5.classList.remove('open'), 100);

  // TEMPS 2 : à 1,8s → scène 1 (portail) ouvert, puis fermeture
  setTimeout(() => {
    s5.classList.remove('active');
    s1.classList.add('active', 'open');
    setTimeout(() => s1.classList.remove('open'), 100);
  }, 1800);

  // TEMPS 3 : à 3,6s → retour à l'enveloppe fermée
  setTimeout(() => {
    s1.classList.remove('active');
    go(0);
    document.getElementById('closing-vignette').classList.add('is-visible');
  }, 3600);
}

const finalMessageText = `Mon amour, je ne veux pas seulement être ton copain aujourd'hui, je veux être ton mari demain, ton compagnon pour la vie et celui avec qui tu vieilliras. 💍 Je ne suis pas venu dans ta vie pour chercher une autre femme, mais pour construire mon avenir avec toi. Je ne suis pas parfait, mais je te promets de faire de mon mieux pour rester sincère, fidèle et protéger notre amour. Et si Dieu nous le permet, c'est avec toi que je veux fonder une famille et passer le reste de ma vie. 🥹❤️🔐`;

let twTimer;
function typeWriter(text, el, speed = 45) {
  clearInterval(twTimer); el.textContent = '';
  const chars = Array.from(text); let i = 0;       // Array.from : les emojis ne sont plus coupés
  twTimer = setInterval(() => { if (i < chars.length) el.textContent += chars[i++]; else clearInterval(twTimer); }, speed);
}

/**
 * Gère l'ouverture de l'enveloppe initiale (Scène 0)
 */
function openEnvelope() {
  const env = $('.envelope');
  env.classList.add('open');
  jardin.volume = .6; jardin.play().catch(() => {}); // musique dès le 1er clic, jusqu'à la remise à zéro
  document.getElementById('closing-vignette').classList.remove('is-visible');
  document.getElementById('loading-bar').style.width = '100%';
  setTimeout(() => go(1), 900); // Transition vers le titre Del & Esther (S1)
}

/**
 * Remet l'intégralité du site à zéro (états, animations, médias)
 */
function resetAll() {
  $('.envelope').classList.remove('open'); // Referme l'enveloppe (S0)

  // 1. Audio : Reset complet
  [jardin, musee].forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
  });
  track = jardin;

  // 2. Scène 1 : Refermer le portail
  $('#scene-1').classList.remove('open');
  $('#scene-3').classList.remove('ready');

  // 3. Scène 4 : Refermer la fleur
  $('#scene-4').classList.remove('sprout', 'bloomed', 'ready', 'duo');

  // 4. Scène 5 : Reset portes et bouton
  $('#scene-5').classList.remove('open');
  $('#open-gallery').classList.remove('hidden');

  // 5. Scène 6 : Reset punchlines
  pi = 0;
  punches.forEach((p, i) => p.classList.toggle('on', i === 0));

  // 6. Scène 7 : Cacher les cellules du mur
  cells.forEach(c => c.classList.remove('visible'));

  // 7. Scène 8 : Cacher la finale
  $('#scene-8').classList.remove('shown');

  // 8. Vidéos : Stop et reset total
  $$('video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });

  // 9. Modal : Fermeture manuelle sans relancer la musique
  const modal = $('#modal');
  modal.classList.remove('open');
  $('#modal-media').innerHTML = '';

  const lb = document.getElementById('loading-bar');
  lb.style.transition = 'none';
  lb.style.width = '0%';
  void lb.offsetWidth;
  lb.style.transition = '';
  document.getElementById('closing-vignette').classList.remove('is-visible');
}

// Alias pour permettre l'appel depuis le HTML (bouton Relire l'Épopée)
function goToScene(n) {
  go(n);
}

function showPunch(i) {
  pi = i;
  punches.forEach((p, k) => {
    const on = k === i, v = p.querySelector('video');
    p.classList.toggle('on', on);
    if (v) on ? v.play().catch(() => {}) : v.pause();
  });
}

/* Musique */
function crossfade(a, b, ms = 1800) {
  /* La musique ne s'arrête JAMAIS : le jardin ne baisse que si le musée joue vraiment.
     Si soza.mp3 est introuvable ou bloqué, le jardin continue jusqu'à la fin. */
  clearInterval(window._ft);
  b.volume = 0; b.muted = muted;
  b.addEventListener('error', () => { track = a; try { a.volume = .6; } catch (e) {} if (a.paused && !muted) a.play().catch(() => {}); }, { once: true });
  Promise.resolve(b.play()).then(() => {
    track = b; let k = 0; const steps = ms / 50;
    window._ft = setInterval(() => {
      const r = Math.min(1, ++k / steps);
      try { a.volume = .6 * (1 - r); b.volume = .8 * r; } catch (e) {}   // iOS ignore volume : on bascule quand même
      if (r >= 1) { clearInterval(window._ft); a.pause(); }
    }, 50);
  }).catch(() => { track = a; });
}
btnSound.onclick = () => {
  muted = !muted;
  jardin.muted = musee.muted = muted;
  btnSound.textContent = muted ? '🔇' : '🔊';
  btnSound.setAttribute('aria-label', muted ? 'Activer la musique' : 'Couper la musique');
};

/* Boutons */
$('#start').onclick = () => {
  jardin.volume = .6; jardin.play().catch(() => {});
  scenes[1].classList.add('open');
  setTimeout(() => go(2), 1500);
};
$$('.next').forEach(b => b.onclick = () => go(cur + 1));
$('#open-gallery').onclick = e => {
  e.target.classList.add('hidden');
  crossfade(jardin, musee);
  scenes[5].classList.add('open');
  setTimeout(() => go(6), 1700);
};
$('#next-punch').onclick = () => pi < punches.length - 1 ? showPunch(pi + 1) : go(7);
$('#restart').onclick = closeStory; // Déclenche la séquence poétique

/* Modale d'agrandissement (mur de cadres) */
function openModal(src, isVideo, message) {
  $$('video').forEach(v => v.pause()); // Arrête toutes les vidéos en ligne pour éviter les superpositions sonores
  const modal = $('#modal');
  const mediaCont = $('#modal-media');
  const msgCont = $('#modal-message');

  mediaCont.innerHTML = ''; // Nettoyage

  if (isVideo) {
    const v = document.createElement('video');
    v.src = src.split('#')[0];
    Object.assign(v, { controls: true, autoplay: true, loop: true, playsInline: true });
    mediaCont.append(v);
    if (track) track.pause();
  } else {
    const img = new Image();
    img.src = src;
    mediaCont.append(img);
  }

  msgCont.textContent = message;
  modal.classList.add('open');
}

function closeModal() {
  const modal = $('#modal');
  const mediaCont = $('#modal-media');
  modal.classList.remove('open');
  mediaCont.innerHTML = '';
  if (track) track.play().catch(() => {});
}


$('#modal').onclick = e => { if (!e.target.closest('#modal-content')) closeModal(); };
$('#close').onclick = closeModal;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* Toute photo/vidéo cliquable ouvre la modale avec SON message (selon Del ou Esther) */
$$('.scene img, .scene video').forEach(m => m.addEventListener('click', () =>
  openModal(m.getAttribute('src'), m.tagName === 'VIDEO', msgByFile[fileOf(m)] || '')));

/* Scène 4 : 1er clic = photos « elle et moi » agrandies, 2e clic = portes de la galerie */
$('#s4-next').onclick = () => { const s = scenes[4]; if (!s.classList.contains('duo')) s.classList.add('duo'); else go(5); };