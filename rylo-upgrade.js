/* Gold Prod / RYLO — Music Store Upgrade
 * Integration module for the existing static website.
 * Add <script src="rylo-upgrade.js" defer></script> before </body>.
 * Configure window.RYLO_CONFIG before this script (see README.md).
 */
(() => {
  "use strict";
  if (window.__RYLO_UPGRADE__) return;
  window.__RYLO_UPGRADE__ = true;

  const CONFIG = Object.assign({
    whatsappNumber: "", // international digits only, e.g. 213555123456
    newsletterEndpoint: "", // Formspree/custom HTTPS endpoint accepting {email}
    currencyRates: { EUR: 1, USD: 1.08, DZD: 145 }, // editable fallback; update to your actual rates
    beatPricesDzd: { "Dark Trap": 8000, "Algiers Drill": 9000, "Golden Hour": 8500 },
    servicesDzd: { beat: 12000, mixing: 6000, mastering: 3000, cover: 4000 },
    beats: [
      { title: "Dark Trap", genre: "Trap", bpm: 140, key: "F minor", mood: "Dark", priceDzd: 8000, src: "", cover: "img.png" },
      { title: "Algiers Drill", genre: "Drill", bpm: 142, key: "C minor", mood: "Aggressive", priceDzd: 9000, src: "", cover: "img.png" },
      { title: "Golden Hour", genre: "Melodic Trap", bpm: 130, key: "A minor", mood: "Chill", priceDzd: 8500, src: "", cover: "img.png" }
    ],
    rawVocalSrc: "",
    mixedVocalSrc: "",
    youtubeVideoIds: [], // add real video IDs, e.g. ["VIDEO_ID_1", "VIDEO_ID_2"]
    freeBeatDownloadUrl: "", // URL to a tagged free beat; keep empty until a real file is uploaded
    currencyApiUrl: "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,DZD",
    toastIntervalMs: 22000
  }, window.RYLO_CONFIG || {});

  const LANG = {
    ar: {
      name: "العربية", dir: "rtl", title: "RYLO / GOLD PROD — أدوات الاستوديو",
      subtitle: "إنتاج موسيقي • Beats • Vocal Engineering",
      player: "المشغل العائم", store: "متجر البيزات", currency: "محول العملات",
      calculator: "حاسبة تكلفة المشروع", lang: "اللغة", book: "اطلب البيت عبر واتساب",
      free: "احصل على بيت مجاني", filter: "ابحث بالاسم", genre: "النوع", mood: "المود",
      all: "الكل", bpm: "نطاق BPM", beforeAfter: "مقارنة الميكساج", raw: "قبل الميكس",
      mixed: "بعد الميكس والماستر", videos: "الكليبات والتراكات", email: "بريدك الإلكتروني",
      submit: "احصل على البيت", beat: "بيت Custom", mixing: "Vocal Mixing",
      mastering: "Mastering", cover: "Cover Art", total: "التكلفة التقديرية",
      request: "طلب البيت", play: "استمع", noAudio: "أضف رابط ملف الصوت في إعدادات RYLO_CONFIG",
      setupEmail: "خدمة البريد غير مربوطة بعد. أضف newsletterEndpoint قبل جمع العناوين.",
      success: "تم إرسال الطلب بنجاح.", error: "تعذّر إكمال الطلب. حاول مجدداً.",
      videoSetup: "أضف معرفات فيديو YouTube الحقيقية في الإعدادات لعرض الكليبات.",
      rates: "أسعار تقريبية قابلة للتعديل وليست عرض سعر ملزماً.",
      listening: "استمع للتو إلى", newBeat: "تذكير: حدّث قائمة البيزات بملفاتك الحقيقية."
    },
    fr: {
      name: "Français", dir: "ltr", title: "RYLO / GOLD PROD — Studio Tools",
      subtitle: "Production musicale • Beats • Ingénierie vocale",
      player: "Lecteur flottant", store: "Boutique de beats", currency: "Convertisseur",
      calculator: "Calculateur de projet", lang: "Langue", book: "Commander via WhatsApp",
      free: "Recevoir un beat gratuit", filter: "Rechercher un beat", genre: "Genre", mood: "Ambiance",
      all: "Tous", bpm: "Plage BPM", beforeAfter: "Comparaison du mix", raw: "Avant mix",
      mixed: "Après mix & mastering", videos: "Clips et morceaux", email: "Votre e-mail",
      submit: "Recevoir le beat", beat: "Beat sur mesure", mixing: "Mixage vocal",
      mastering: "Mastering", cover: "Cover Art", total: "Coût estimé",
      request: "Commander ce beat", play: "Écouter", noAudio: "Ajoutez une URL audio dans RYLO_CONFIG",
      setupEmail: "Le service e-mail n'est pas configuré. Définissez newsletterEndpoint.",
      success: "Demande envoyée.", error: "Impossible de terminer. Réessayez.",
      videoSetup: "Ajoutez les vrais identifiants YouTube dans la configuration.",
      rates: "Taux indicatifs modifiables, non contractuels.",
      listening: "Écoute récente :", newBeat: "Pensez à ajouter vos vrais beats."
    },
    en: {
      name: "English", dir: "ltr", title: "RYLO / GOLD PROD — Studio Tools",
      subtitle: "Music production • Beats • Vocal engineering",
      player: "Floating player", store: "Beat store", currency: "Currency converter",
      calculator: "Project cost calculator", lang: "Language", book: "Book via WhatsApp",
      free: "Get a free beat", filter: "Search beats", genre: "Genre", mood: "Mood",
      all: "All", bpm: "BPM range", beforeAfter: "Mix comparison", raw: "Raw vocal",
      mixed: "Mixed & mastered", videos: "Videos & tracks", email: "Your email",
      submit: "Get the beat", beat: "Custom beat", mixing: "Vocal mixing",
      mastering: "Mastering", cover: "Cover art", total: "Estimated total",
      request: "Request this beat", play: "Listen", noAudio: "Add a real audio URL in RYLO_CONFIG",
      setupEmail: "Email collection is not connected. Configure newsletterEndpoint first.",
      success: "Request sent.", error: "Could not complete the request. Try again.",
      videoSetup: "Add real YouTube video IDs in the configuration.",
      rates: "Indicative editable rates; not a binding quote.",
      listening: "Just listened to", newBeat: "Remember to add your real beat files."
    }
  };
  let lang = "ar";
  let activeAudio = null;
  let liveRates = { ...CONFIG.currencyRates };
  const $ = (s, root = document) => root.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const t = key => (LANG[lang] && LANG[lang][key]) || LANG.ar[key] || key;
  const money = (dzd, currency) => {
    const rates = liveRates;
    let amount = currency === "DZD" ? dzd : currency === "EUR" ? dzd / rates.DZD : (dzd / rates.DZD) * rates.USD;
    return new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US", {
      style: "currency", currency, maximumFractionDigits: currency === "DZD" ? 0 : 2
    }).format(amount);
  };
  const css = `
  #rylo-suite{--rylo-accent:#ff4757;--rylo-bg:#0f0f10;--rylo-card:#171719;--rylo-muted:#b8b8c0;color:#f8f8fa;background:transparent;font-family:inherit;width:min(1100px,100%);margin:24px auto 120px;line-height:1.5}
  #rylo-suite *{box-sizing:border-box} #rylo-suite button,#rylo-suite input,#rylo-suite select{font:inherit}
  #rylo-suite .rylo-hero{border:1px solid #343438;border-radius:24px;padding:clamp(18px,4vw,32px);background:radial-gradient(ellipse at top right,#ff475722,transparent 55%),#111113}
  #rylo-suite .rylo-eyebrow{color:var(--rylo-accent);font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
  #rylo-suite h2{font-size:clamp(22px,4vw,32px);line-height:1.2;margin:8px 0}
  #rylo-suite h3{font-size:18px;margin:0 0 14px} #rylo-suite .rylo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}
  #rylo-suite .rylo-card{min-width:0;border:1px solid #303034;border-radius:18px;background:#141416;padding:18px}
  #rylo-suite .rylo-full{grid-column:1/-1} #rylo-suite .rylo-muted{color:var(--rylo-muted);font-size:13px}
  #rylo-suite .rylo-fields{display:flex;gap:8px;flex-wrap:wrap} #rylo-suite .rylo-fields>*{flex:1;min-width:120px}
  #rylo-suite input,#rylo-suite select{background:#0d0d0f;color:#fff;border:1px solid #38383e;border-radius:10px;padding:10px 12px;min-width:0;width:100%}
  #rylo-suite button{cursor:pointer;border:1px solid #ff475766;border-radius:11px;background:#ff47571b;color:#fff;padding:10px 13px;font-weight:750;transition:background .15s,transform .15s}
  #rylo-suite button:hover{background:#ff475735} #rylo-suite button:active{transform:scale(.98)}
  #rylo-suite .rylo-primary{background:var(--rylo-accent);color:#111;border-color:var(--rylo-accent)} #rylo-suite .rylo-primary:hover{background:#ff6471}
  #rylo-suite .rylo-beat{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:10px;border-top:1px solid #2a2a2e;padding:12px 0}
  #rylo-suite .rylo-cover{width:46px;height:46px;border-radius:10px;object-fit:cover;background:#222}
  #rylo-suite .rylo-beat strong{display:block;overflow-wrap:anywhere} #rylo-suite .rylo-price{font-size:12px;color:#ff7b86;margin-top:2px}
  #rylo-suite .rylo-total{font-size:24px;font-weight:900;color:#ff6471;margin:12px 0}
  #rylo-suite .rylo-check{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:14px}
  #rylo-suite .rylo-check input{width:auto;accent-color:#ff4757}
  #rylo-suite .rylo-video-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  #rylo-suite .rylo-video{aspect-ratio:16/9;width:100%;border:0;border-radius:12px;background:#080808}
  #rylo-suite .rylo-toast{position:fixed;z-index:10001;bottom:22px;right:18px;max-width:min(340px,calc(100vw - 36px));background:#1a1a1d;color:#fff;border:1px solid #ff4757aa;border-radius:13px;padding:12px 16px;box-shadow:0 14px 40px #0008;opacity:0;transform:translateY(10px);transition:.25s;pointer-events:none}
  #rylo-suite .rylo-toast.show{opacity:1;transform:translateY(0)}
  #rylo-free-modal{position:fixed;inset:0;z-index:10000;background:#000b;display:none;align-items:center;justify-content:center;padding:18px}
  #rylo-free-modal.open{display:flex} #rylo-free-modal .rylo-modal-box{width:min(440px,100%);background:#151517;border:1px solid #ff475766;border-radius:22px;padding:22px;position:relative}
  #rylo-free-modal .rylo-close{position:absolute;top:10px;right:10px}
  #rylo-sticky-player{position:fixed;left:0;right:0;bottom:0;z-index:9998;background:#101012f2;border-top:1px solid #ff475766;backdrop-filter:blur(16px);padding:10px 14px calc(10px + env(safe-area-inset-bottom));display:none}
  #rylo-sticky-player.show{display:block} #rylo-sticky-player .rylo-player-row{width:min(900px,100%);margin:auto;display:flex;align-items:center;gap:12px}
  #rylo-sticky-player .rylo-track{min-width:0;flex:1} #rylo-sticky-player .rylo-track strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #rylo-sticky-player audio{width:100%;height:30px} #rylo-suite [hidden]{display:none!important}
  @media(max-width:640px){#rylo-suite .rylo-grid{grid-template-columns:1fr}#rylo-suite .rylo-video-grid{grid-template-columns:1fr}#rylo-suite .rylo-card{padding:14px}#rylo-suite .rylo-beat{grid-template-columns:38px minmax(0,1fr) auto;gap:8px}#rylo-suite .rylo-cover{width:38px;height:38px}#rylo-sticky-player .rylo-player-row{gap:8px}#rylo-sticky-player .rylo-player-row>button{padding:8px;font-size:12px}}
  @media(prefers-reduced-motion:reduce){#rylo-suite *,#rylo-suite .rylo-toast{transition:none!important;animation:none!important}}
  `;
  const style = document.createElement("style"); style.textContent = css; document.head.appendChild(style);

  const host = document.createElement("section");
  host.id = "rylo-suite";
  host.innerHTML = `
    <div class="rylo-hero">
      <div class="rylo-eyebrow">GOLD PROD · RYLO DZ</div>
      <h2 data-i18n="title">RYLO / GOLD PROD — أدوات الاستوديو</h2>
      <p class="rylo-muted" data-i18n="subtitle">إنتاج موسيقي • Beats • Vocal Engineering</p>
      <div class="rylo-fields" style="margin-top:16px;align-items:center">
        <label class="rylo-muted" for="rylo-language" data-i18n="lang">اللغة</label>
        <select id="rylo-language" aria-label="Language" style="max-width:180px">
          <option value="ar">🇩🇿 العربية</option><option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English</option>
        </select>
        <button id="rylo-open-free" class="rylo-primary" data-i18n="free">احصل على بيت مجاني</button>
      </div>
    </div>
    <div class="rylo-grid">
      <section class="rylo-card" id="rylo-store-card">
        <h3 data-i18n="store">متجر البيزات</h3>
        <div class="rylo-fields">
          <input id="rylo-search" data-placeholder="filter" placeholder="ابحث بالاسم" aria-label="Search beats">
          <select id="rylo-genre" aria-label="Genre"><option value="all">الكل</option><option>Trap</option><option>Drill</option><option>Melodic Trap</option></select>
        </div>
        <div class="rylo-fields" style="margin-top:8px">
          <select id="rylo-mood" aria-label="Mood"><option value="all">المود: الكل</option><option>Dark</option><option>Aggressive</option><option>Chill</option></select>
          <select id="rylo-bpm" aria-label="BPM range"><option value="all">كل السرعات</option><option value="under130">أقل من 130</option><option value="130-139">130–139</option><option value="140-149">140–149</option><option value="150plus">150+</option></select>
        </div>
        <div id="rylo-beats" style="margin-top:10px"></div>
      </section>
      <section class="rylo-card">
        <h3 data-i18n="currency">محول العملات</h3>
        <label class="rylo-muted" for="rylo-amount">السعر بالدينار الجزائري (DZD)</label>
        <input id="rylo-amount" type="number" min="0" step="100" value="8000" inputmode="decimal">
        <div class="rylo-fields" style="margin-top:8px">
          <label><span class="rylo-muted">العملة</span><select id="rylo-currency"><option>DZD</option><option>USD</option><option>EUR</option></select></label>
          <div><span class="rylo-muted">السعر المحوّل</span><div id="rylo-converted" class="rylo-total" aria-live="polite">—</div></div>
        </div>
        <p class="rylo-muted" data-i18n="rates">أسعار تقريبية قابلة للتعديل وليست عرض سعر ملزماً.</p>
        <p id="rylo-rate-status" class="rylo-muted">يتم استخدام أسعار الإعدادات حتى يتوفر تحديث مباشر.</p>
      </section>
      <section class="rylo-card">
        <h3 data-i18n="calculator">حاسبة تكلفة المشروع</h3>
        <label class="rylo-check"><input type="checkbox" data-service="beat"> <span data-i18n="beat">بيت Custom</span></label>
        <label class="rylo-check"><input type="checkbox" data-service="mixing"> <span data-i18n="mixing">Vocal Mixing</span></label>
        <label class="rylo-check"><input type="checkbox" data-service="mastering"> <span data-i18n="mastering">Mastering</span></label>
        <label class="rylo-check"><input type="checkbox" data-service="cover"> <span data-i18n="cover">Cover Art</span></label>
        <div class="rylo-muted" id="rylo-cost-breakdown"></div>
        <div class="rylo-total"><span data-i18n="total">التكلفة التقديرية</span>: <span id="rylo-total">0 DZD</span></div>
        <button id="rylo-cost-whatsapp" class="rylo-primary" data-i18n="book">اطلب البيت عبر واتساب</button>
      </section>
      <section class="rylo-card">
        <h3 data-i18n="beforeAfter">مقارنة الميكساج</h3>
        <p class="rylo-muted">Raw Vocal / Mixed Vocal — ضع ملفات مقارنة تملك حق استخدامها في الإعدادات.</p>
        <div class="rylo-fields">
          <button id="rylo-raw" data-i18n="raw">قبل الميكس</button>
          <button id="rylo-mixed" class="rylo-primary" data-i18n="mixed">بعد الميكس والماستر</button>
        </div>
        <audio id="rylo-compare-audio" controls preload="none" style="width:100%;margin-top:12px"></audio>
        <p id="rylo-compare-status" class="rylo-muted" aria-live="polite"></p>
      </section>
      <section class="rylo-card rylo-full">
        <h3 data-i18n="videos">الكليبات والتراكات</h3>
        <div id="rylo-videos" class="rylo-video-grid"></div>
      </section>
    </div>
    <div id="rylo-toast" class="rylo-toast" role="status" aria-live="polite"></div>
    <div id="rylo-free-modal" role="dialog" aria-modal="true" aria-labelledby="rylo-free-title">
      <div class="rylo-modal-box">
        <button type="button" class="rylo-close" id="rylo-close-free" aria-label="Close">✕</button>
        <div class="rylo-eyebrow">FREE TAGGED BEAT</div>
        <h3 id="rylo-free-title" data-i18n="free">احصل على بيت مجاني</h3>
        <p class="rylo-muted">أدخل بريدك للحصول على رابط البيت المجاني. لن يتم حفظ البريد ما لم يتم ربط خدمة جمع البريد.</p>
        <form id="rylo-email-form">
          <input type="email" id="rylo-email" required autocomplete="email" data-placeholder="email" placeholder="بريدك الإلكتروني" style="margin:8px 0">
          <button type="submit" class="rylo-primary" style="width:100%" data-i18n="submit">احصل على البيت</button>
          <p id="rylo-email-status" class="rylo-muted" aria-live="polite"></p>
        </form>
      </div>
    </div>
    <div id="rylo-sticky-player" aria-label="Persistent audio player">
      <div class="rylo-player-row">
        <div class="rylo-track"><strong id="rylo-player-title">GOLD PROD</strong><span id="rylo-player-meta" class="rylo-muted">Demo</span></div>
        <audio id="rylo-player-audio" controls preload="none"></audio>
        <button id="rylo-player-close" aria-label="Close player">✕</button>
      </div>
    </div>`;
  const main = document.querySelector("main") || document.querySelector("#main") || document.querySelector(".main-content");
  if (main) main.appendChild(host);
  else document.body.appendChild(host);

  const modal = $("#rylo-free-modal");
  const toastEl = $("#rylo-toast");
  let toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3500);
  }
  function setLanguage(next) {
    if (!LANG[next]) return;
    lang = next;
    host.dir = LANG[lang].dir;
    host.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
    host.querySelectorAll("[data-placeholder]").forEach(el => el.placeholder = t(el.dataset.placeholder));
    $("#rylo-language").value = lang;
    $("#rylo-genre").options[0].textContent = t("all");
    $("#rylo-mood").options[0].textContent = `${t("mood")}: ${t("all")}`;
    renderBeats(); renderCurrency(); renderCost();
  }
  $("#rylo-language").addEventListener("change", e => setLanguage(e.target.value));

  function playTrack(track, meta = "") {
    if (!track) return;
    const src = typeof track === "string" ? track : track.src;
    if (!src) { toast(t("noAudio")); return; }
    // Prefer the existing site's GoldPlayer so playback continues while SPA tabs change.
    if (window.GoldPlayer && typeof window.GoldPlayer.play === "function" && typeof track !== "string") {
      window.GoldPlayer.play({ src, title: track.title, meta: `${track.bpm || ""} BPM · ${track.key || ""}`, cover: track.cover || "img.png" });
      return;
    }
    const player = $("#rylo-sticky-player");
    const audio = $("#rylo-player-audio");
    $("#rylo-player-title").textContent = typeof track === "string" ? "RYLO Demo" : track.title;
    $("#rylo-player-meta").textContent = meta || (typeof track === "string" ? "" : `${track.bpm || ""} BPM · ${track.key || ""}`);
    player.classList.add("show");
    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;
    if (audio.src !== new URL(src, location.href).href) audio.src = src;
    audio.play().catch(() => toast(t("noAudio")));
  }
  $("#rylo-player-close").addEventListener("click", () => {
    const audio = $("#rylo-player-audio"); audio.pause(); $("#rylo-sticky-player").classList.remove("show");
  });

  function renderBeats() {
    const query = $("#rylo-search").value.toLowerCase().trim();
    const genre = $("#rylo-genre").value;
    const mood = $("#rylo-mood").value;
    const bpm = $("#rylo-bpm").value;
    const list = CONFIG.beats.filter(b => {
      const matchText = `${b.title} ${b.genre} ${b.mood} ${b.key}`.toLowerCase().includes(query);
      const matchGenre = genre === "all" || b.genre === genre;
      const matchMood = mood === "all" || b.mood === mood;
      const matchBpm = bpm === "all" || (bpm === "under130" ? b.bpm < 130 : bpm === "150plus" ? b.bpm >= 150 : b.bpm >= +bpm.split("-")[0] && b.bpm <= +bpm.split("-")[1]);
      return matchText && matchGenre && matchMood && matchBpm;
    });
    $("#rylo-beats").innerHTML = list.length ? list.map((b, i) => `
      <article class="rylo-beat">
        <img class="rylo-cover" loading="lazy" src="${esc(b.cover || "img.png")}" alt="">
        <div><strong>${esc(b.title)}</strong><span class="rylo-muted">${esc(b.genre)} · ${esc(b.bpm)} BPM · ${esc(b.key)} · ${esc(b.mood)}</span><div class="rylo-price">${money(Number(b.priceDzd)||0,"DZD")}</div></div>
        <div style="display:grid;gap:6px"><button type="button" data-play="${i}">${t("play")}</button><button type="button" data-order="${i}">${t("request")}</button></div>
      </article>`).join("") : `<p class="rylo-muted">—</p>`;
    $("#rylo-beats").querySelectorAll("[data-play]").forEach(btn => btn.addEventListener("click", () => {
      const b = list[+btn.dataset.play]; playTrack(b);
      toast(`${t("listening")} ${b.title}`);
    }));
    $("#rylo-beats").querySelectorAll("[data-order]").forEach(btn => btn.addEventListener("click", () => orderBeat(list[+btn.dataset.order])));
  }
  ["rylo-search","rylo-genre","rylo-mood","rylo-bpm"].forEach(id => $("#"+id).addEventListener(id==="rylo-search"?"input":"change", renderBeats));

  function renderCurrency() {
    const amount = Math.max(0, Number($("#rylo-amount").value) || 0);
    const currency = $("#rylo-currency").value;
    $("#rylo-converted").textContent = money(amount, currency);
  }
  $("#rylo-amount").addEventListener("input", renderCurrency);
  $("#rylo-currency").addEventListener("change", renderCurrency);
  async function updateRates() {
    try {
      const res = await fetch(CONFIG.currencyApiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("rate API");
      const data = await res.json();
      if (data && data.rates && Number(data.rates.USD)>0 && Number(data.rates.DZD)>0) {
        liveRates = { EUR: 1, USD: Number(data.rates.USD), DZD: Number(data.rates.DZD) };
        $("#rylo-rate-status").textContent = "تم تحديث أسعار التحويل عبر الإنترنت. قد تختلف الأسعار المصرفية/السوقية.";
        renderCurrency(); renderBeats(); renderCost();
      }
    } catch (_) {
      $("#rylo-rate-status").textContent = "تعذّر تحديث الصرف؛ تُستخدم القيم الاحتياطية القابلة للتعديل.";
    }
  }

  function renderCost() {
    const selected = [...host.querySelectorAll("[data-service]:checked")].map(el => el.dataset.service);
    const total = selected.reduce((sum, key) => sum + (Number(CONFIG.servicesDzd[key]) || 0), 0);
    $("#rylo-total").textContent = money(total, "DZD");
    $("#rylo-cost-breakdown").textContent = selected.map(key => `${t(key)}: ${money(Number(CONFIG.servicesDzd[key])||0,"DZD")}`).join(" · ");
    $("#rylo-cost-whatsapp").dataset.total = total;
  }
  host.querySelectorAll("[data-service]").forEach(el => el.addEventListener("change", renderCost));

  function openWhatsApp(message) {
    if (!/^\d{8,15}$/.test(String(CONFIG.whatsappNumber || ""))) {
      toast("أضف رقم واتساب الدولي في RYLO_CONFIG.whatsappNumber قبل تفعيل الطلب.");
      return;
    }
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }
  function orderBeat(b) {
    openWhatsApp(`طلب Beat من Gold Prod / RYLO\nBeat: ${b.title}\nGenre: ${b.genre}\nBPM: ${b.bpm}\nKey: ${b.key}\nMood: ${b.mood}\nالسعر التقريبي: ${money(Number(b.priceDzd)||0,"DZD")}`);
  }
  $("#rylo-cost-whatsapp").addEventListener("click", () => {
    const selected = [...host.querySelectorAll("[data-service]:checked")].map(el => el.dataset.service);
    const total = selected.reduce((sum, key) => sum + (Number(CONFIG.servicesDzd[key]) || 0), 0);
    openWhatsApp(`طلب خدمات موسيقية - Gold Prod / RYLO\nالخدمات: ${selected.join(", ") || "لم يتم اختيار خدمات"}\nالتكلفة التقديرية: ${money(total,"DZD")}`);
  });

  function setCompare(which) {
    const src = which === "raw" ? CONFIG.rawVocalSrc : CONFIG.mixedVocalSrc;
    const audio = $("#rylo-compare-audio");
    if (!src) { $("#rylo-compare-status").textContent = t("noAudio"); return; }
    audio.src = src; audio.load(); audio.play().catch(() => {});
    $("#rylo-compare-status").textContent = which === "raw" ? t("raw") : t("mixed");
  }
  $("#rylo-raw").addEventListener("click", () => setCompare("raw"));
  $("#rylo-mixed").addEventListener("click", () => setCompare("mixed"));

  function renderVideos() {
    const videos = $("#rylo-videos");
    if (!Array.isArray(CONFIG.youtubeVideoIds) || CONFIG.youtubeVideoIds.length === 0) {
      videos.innerHTML = `<p class="rylo-muted">${t("videoSetup")} <a href="https://music.youtube.com/@rylo_dz" target="_blank" rel="noopener noreferrer" style="color:#ff6471">RYLO on YouTube Music</a></p>`;
      return;
    }
    videos.innerHTML = CONFIG.youtubeVideoIds.filter(id => /^[\w-]{11}$/.test(id)).map(id =>
      `<iframe class="rylo-video" loading="lazy" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="RYLO music video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    ).join("");
  }

  $("#rylo-open-free").addEventListener("click", () => modal.classList.add("open"));
  $("#rylo-close-free").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") modal.classList.remove("open"); });
  $("#rylo-email-form").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("#rylo-email").value.trim();
    const status = $("#rylo-email-status");
    if (!CONFIG.newsletterEndpoint) {
      status.textContent = t("setupEmail");
      status.style.color = "#ff7b86";
      return;
    }
    try {
      const res = await fetch(CONFIG.newsletterEndpoint, {
        method: "POST", headers: { "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({ email, source: "RYLO free tagged beat", consent: true })
      });
      if (!res.ok) throw new Error("newsletter request failed");
      status.textContent = t("success"); status.style.color = "#5ee0a0";
      if (CONFIG.freeBeatDownloadUrl) {
        const a = document.createElement("a"); a.href = CONFIG.freeBeatDownloadUrl; a.textContent = "Download free tagged beat";
        a.target = "_blank"; a.rel = "noopener noreferrer"; a.style.display = "block"; a.style.marginTop = "10px";
        status.appendChild(document.createElement("br")); status.appendChild(a);
      } else status.appendChild(document.createTextNode(" Upload and configure freeBeatDownloadUrl to deliver the file."));
      $("#rylo-email").value = "";
    } catch (_) {
      status.textContent = t("error"); status.style.color = "#ff7b86";
    }
  });

  // Toasts: only truthful, locally generated product notices; no fake "someone just listened" claims.
  let toastBeatIndex = 0;
  setTimeout(() => toast("Gold Prod / RYLO: " + t("newBeat")), 6000);
  setInterval(() => {
    const b = CONFIG.beats[toastBeatIndex++ % Math.max(CONFIG.beats.length,1)];
    if (b) toast(`${t("newBeat")} ${b.title} — ${b.bpm} BPM`);
  }, Math.max(60000, Number(CONFIG.toastIntervalMs) || 22000));

  renderBeats(); renderCurrency(); renderCost(); renderVideos(); updateRates();
  // Set up default language and labels after initial markup is available.
  setLanguage("ar");
})();
