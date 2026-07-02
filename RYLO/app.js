import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

/* ========== Global Audio Player ========== */
let audio = null;
let currentTrackId = null;
let isPlaying = false;

const playerEl = document.getElementById('globalPlayer');
const playBtn = document.getElementById('gpPlayBtn');
const prevBtn = document.getElementById('gpPrevBtn');
const nextBtn = document.getElementById('gpNextBtn');
const progressBar = document.getElementById('gpProgress');
const currentTimeEl = document.getElementById('gpCurrentTime');
const durationEl = document.getElementById('gpDuration');
const volumeBar = document.getElementById('gpVolume');
const trackTitleEl = document.getElementById('gpTitle');
const trackArtistEl = document.getElementById('gpArtist');
const trackArtEl = document.getElementById('gpArt');

let trackList = [];
let currentIndex = 0;

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function initPlayer(tracks) {
  trackList = tracks || [];
  if (!audio) {
    audio = new Audio();
    audio.addEventListener('timeupdate', () => {
      if (progressBar) progressBar.value = audio.currentTime || 0;
      if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      if (progressBar) progressBar.max = audio.duration || 0;
      if (durationEl) durationEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayBtn();
      playNext();
    });
    if (progressBar) {
      progressBar.addEventListener('input', () => {
        if (audio) audio.currentTime = progressBar.value;
      });
    }
    if (volumeBar) {
      volumeBar.addEventListener('input', () => {
        if (audio) audio.volume = volumeBar.value / 100;
      });
    }
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', playPrev);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
  }
}

export function playTrack(index) {
  if (!trackList.length) return;
  currentIndex = index;
  const track = trackList[currentIndex];
  if (!track) return;
  currentTrackId = track.id;
  if (audio) {
    audio.src = track.src;
    audio.load();
    audio.play().then(() => {
      isPlaying = true;
      updatePlayBtn();
    }).catch(() => {});
  }
  if (trackTitleEl) trackTitleEl.textContent = track.title || 'Unknown';
  if (trackArtistEl) trackArtistEl.textContent = track.artist || 'GoldProd';
  if (trackArtEl) trackArtEl.src = track.art || '';
  if (playerEl) playerEl.classList.remove('hidden-player');
}

function togglePlay() {
  if (!audio || !audio.src) return;
  if (audio.paused) {
    audio.play().then(() => { isPlaying = true; updatePlayBtn(); }).catch(() => {});
  } else {
    audio.pause(); isPlaying = false; updatePlayBtn();
  }
}

function updatePlayBtn() {
  if (!playBtn) return;
  playBtn.innerHTML = isPlaying
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function playNext() {
  if (!trackList.length) return;
  const next = (currentIndex + 1) % trackList.length;
  playTrack(next);
}

function playPrev() {
  if (!trackList.length) return;
  const prev = (currentIndex - 1 + trackList.length) % trackList.length;
  playTrack(prev);
}

/* ========== Admin Dashboard Tabs ========== */
export function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-sidebar .nav-item');
  const panels = document.querySelectorAll('.admin-tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => {
        if (p.id === 'tab-' + target) { p.classList.add('active'); }
        else { p.classList.remove('active'); }
      });
    });
  });
}

/* ========== Auth UI ========== */
export function initAuthUI() {
  const authBtn = document.getElementById('authBtn');
  if (!authBtn) return;
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authBtn.textContent = 'Logout';
      authBtn.onclick = () => { signOut(auth).then(() => window.location.reload()); };
    } else {
      authBtn.textContent = 'Log In';
      authBtn.onclick = () => { window.location.href = 'auth.html'; };
    }
  });
}

/* ========== Auth Forms ========== */
export function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const toast = document.getElementById('toast');

  function showToast(message, type) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  if (tabLogin && tabSignup && loginForm && signupForm) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active'); tabSignup.classList.remove('active');
      loginForm.classList.add('active'); signupForm.classList.remove('active');
    });
    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active'); tabLogin.classList.remove('active');
      signupForm.classList.add('active'); loginForm.classList.remove('active');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) { showToast('Please enter email and password.', 'error'); return; }
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Logged in successfully!', 'success');
        setTimeout(() => window.location.href = 'index.html', 800);
      } catch (err) { showToast(err.message || 'Login failed.', 'error'); }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      if (!email || !password) { showToast('Please enter email and password.', 'error'); return; }
      if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Account created! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'index.html', 800);
      } catch (err) { showToast(err.message || 'Signup failed.', 'error'); }
    });
  }
}

/* ========== Admin: Inventory CRUD ========== */
export function initAdminInventory() {
  const addForm = document.getElementById('addBeatForm');
  const editForm = document.getElementById('editBeatForm');
  const inventoryList = document.getElementById('inventoryList');
  const editSelect = document.getElementById('editBeatSelect');
  const deleteSelect = document.getElementById('deleteBeatSelect');

  function loadInventory() {
    const beats = JSON.parse(localStorage.getItem('goldprod_beats') || '[]');
    if (inventoryList) {
      inventoryList.innerHTML = '';
      beats.forEach((b, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${b.title}</td><td>${b.bpm}</td><td>${b.key}</td><td>${b.genre}</td><td>${b.price}</td>`;
        inventoryList.appendChild(row);
      });
    }
    [editSelect, deleteSelect].forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '<option value="" disabled selected>Select a beat</option>';
      beats.forEach((b, i) => {
        const opt = document.createElement('option'); opt.value = i; opt.textContent = b.title; sel.appendChild(opt);
      });
    });
  }
  loadInventory();

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const beats = JSON.parse(localStorage.getItem('goldprod_beats') || '[]');
      beats.push({
        id: 'beat_' + Date.now(),
        title: document.getElementById('addTitle').value,
        bpm: document.getElementById('addBpm').value,
        key: document.getElementById('addKey').value,
        genre: document.getElementById('addGenre').value,
        price: document.getElementById('addPrice').value,
        src: document.getElementById('addSrc').value || 'https://www.soundjay.com/buttons/beep-01a.mp3',
        art: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop&q=80'
      });
      localStorage.setItem('goldprod_beats', JSON.stringify(beats));
      addForm.reset(); loadInventory();
      const t = document.getElementById('toast'); if(t){ t.textContent='Beat added!'; t.className='toast success show'; setTimeout(()=>t.classList.remove('show'),2500); }
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const beats = JSON.parse(localStorage.getItem('goldprod_beats') || '[]');
      const idx = parseInt(editSelect.value, 10);
      if (isNaN(idx)) { const t = document.getElementById('toast'); if(t){ t.textContent='Select a beat to edit.'; t.className='toast error show'; setTimeout(()=>t.classList.remove('show'),3000); } return; }
      beats[idx].title = document.getElementById('editTitle').value;
      beats[idx].bpm = document.getElementById('editBpm').value;
      beats[idx].key = document.getElementById('editKey').value;
      beats[idx].genre = document.getElementById('editGenre').value;
      beats[idx].price = document.getElementById('editPrice').value;
      localStorage.setItem('goldprod_beats', JSON.stringify(beats));
      editForm.reset(); loadInventory();
      const t = document.getElementById('toast'); if(t){ t.textContent='Beat updated!'; t.className='toast success show'; setTimeout(()=>t.classList.remove('show'),2500); }
    });
  }

  const deleteBtn = document.getElementById('deleteBeatBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const beats = JSON.parse(localStorage.getItem('goldprod_beats') || '[]');
      const idx = parseInt(deleteSelect.value, 10);
      if (isNaN(idx)) { const t = document.getElementById('toast'); if(t){ t.textContent='Select a beat to delete.'; t.className='toast error show'; setTimeout(()=>t.classList.remove('show'),3000); } return; }
      beats.splice(idx, 1);
      localStorage.setItem('goldprod_beats', JSON.stringify(beats));
      loadInventory();
      const t = document.getElementById('toast'); if(t){ t.textContent='Beat deleted.'; t.className='toast success show'; setTimeout(()=>t.classList.remove('show'),2500); }
    });
  }
}

/* ========== Admin: Pricing Controller ========== */
export function initAdminPricing() {
  const form = document.getElementById('pricingForm');
  if (!form) return;
  const keys = ['priceStandard', 'pricePremium', 'priceUnlimited', 'priceExclusive'];
  keys.forEach(k => { const el = document.getElementById(k); if(el) el.value = localStorage.getItem(k) || ''; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    keys.forEach(k => { const el = document.getElementById(k); if(el) localStorage.setItem(k, el.value); });
    const t = document.getElementById('toast'); if(t){ t.textContent='Pricing updated!'; t.className='toast success show'; setTimeout(()=>t.classList.remove('show'),2500); }
  });
}

/* ========== Admin: Inbox View ========== */
export function initAdminInbox() {
  const tbody = document.getElementById('inboxTable');
  if (!tbody) return;
  const inquiries = JSON.parse(localStorage.getItem('goldprod_inquiries') || '[]');
  tbody.innerHTML = '';
  if (!inquiries.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">No inquiries yet.</td></tr>';
    return;
  }
  inquiries.forEach(q => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${q.name}</td><td>${q.email}</td><td>${q.genre}</td><td>${q.budget}</td><td>${q.message}</td>`;
    tbody.appendChild(tr);
  });
}

/* ========== Admin: Content Editor ========== */
export function initAdminContent() {
  const form = document.getElementById('contentForm');
  if (!form) return;
  const homeTitle = document.getElementById('homeTitle');
  const homeSubtitle = document.getElementById('homeSubtitle');
  if (homeTitle) homeTitle.value = localStorage.getItem('goldprod_homeTitle') || 'ELEVATE YOUR SOUND. GLOBAL-READY BEATS.';
  if (homeSubtitle) homeSubtitle.value = localStorage.getItem('goldprod_homeSubtitle') || 'Premium beats for artists, labels, and creators worldwide.';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (homeTitle) localStorage.setItem('goldprod_homeTitle', homeTitle.value);
    if (homeSubtitle) localStorage.setItem('goldprod_homeSubtitle', homeSubtitle.value);
    const t = document.getElementById('toast'); if(t){ t.textContent='Content saved!'; t.className='toast success show'; setTimeout(()=>t.classList.remove('show'),2500); }
  });
}

/* ========== Store Filter ========== */
export function initStoreFilter() {
  const genreFilter = document.getElementById('filterGenre');
  const bpmRange = document.getElementById('bpmRange');
  const bpmVal = document.getElementById('bpmVal');
  const keyFilter = document.getElementById('filterKey');
  const cards = document.querySelectorAll('.beat-card');

  function apply() {
    const genre = genreFilter ? genreFilter.value : '';
    const bpm = bpmRange ? parseInt(bpmRange.value, 10) : 200;
    const key = keyFilter ? keyFilter.value : '';
    if (bpmVal) bpmVal.textContent = bpm + ' BPM';
    cards.forEach(card => {
      const cGenre = card.dataset.genre || '';
      const cBpm = parseInt(card.dataset.bpm || '0', 10);
      const cKey = card.dataset.key || '';
      let show = true;
      if (genre && cGenre !== genre) show = false;
      if (cBpm > bpm) show = false;
      if (key && cKey !== key) show = false;
      card.style.display = show ? '' : 'none';
    });
  }
  if (genreFilter) genreFilter.addEventListener('change', apply);
  if (bpmRange) { bpmRange.addEventListener('input', apply); bpmRange.addEventListener('change', apply); }
  if (keyFilter) keyFilter.addEventListener('change', apply);
  if (bpmRange && bpmVal) bpmVal.textContent = bpmRange.value + ' BPM';
}
