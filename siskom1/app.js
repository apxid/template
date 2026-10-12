const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const STORAGE_KEY = 'kompint-pertemuan-1';

const defaultState = {
  completed: [],
  readiness: '',
  feeling: '',
  category: 'hardware',
  detail: '',
  matching: { selected: null, solved: [], feedback: '' },
  scenarios: [],
  quizAnswers: {},
  quizSubmitted: false,
  reflection: { learned: '', unclear: '', benefit: '' }
};

let state = loadState();
let currentScreen = 'home';
let toastTimer;

const categories = {
  hardware: {
    label: 'Hardware',
    icon: '01',
    className: 'hardware',
    definition: 'Bagian fisik komputer yang dapat dilihat dan disentuh. Hardware menerima input, memproses data, menyimpan, atau menampilkan informasi.',
    examples: [
      ['Keyboard', 'Alat input untuk mengetik huruf, angka, dan perintah.'],
      ['CPU', 'Pusat pemrosesan yang menjalankan instruksi dan mengolah data.'],
      ['Monitor', 'Alat output untuk menampilkan teks, gambar, dan video.'],
      ['RAM', 'Memori sementara yang membantu komputer bekerja cepat saat program digunakan.']
    ]
  },
  software: {
    label: 'Software',
    icon: '02',
    className: 'software',
    definition: 'Kumpulan program atau instruksi yang mengatur kerja komputer. Software tidak dapat disentuh, tetapi dapat digunakan melalui perangkat.',
    examples: [
      ['Sistem operasi', 'Contoh: Windows, Linux, atau Android; mengatur perangkat dan aplikasi.'],
      ['Peramban', 'Contoh: Chrome atau Firefox; membantu membuka dan menjelajah laman web.'],
      ['Pengolah kata', 'Aplikasi untuk membuat, mengedit, dan menyimpan dokumen.'],
      ['Aplikasi gambar', 'Program untuk membuat atau mengolah gambar digital.']
    ]
  },
  brainware: {
    label: 'Brainware',
    icon: '03',
    className: 'brainware',
    definition: 'Manusia yang menggunakan, mengatur, merawat, atau mengembangkan sistem komputer. Komputer perlu brainware agar bermanfaat.',
    examples: [
      ['Pengguna', 'Orang yang memakai komputer untuk belajar, bekerja, atau berkreasi.'],
      ['Operator', 'Orang yang menjalankan perangkat atau sistem sesuai prosedur.'],
      ['Programmer', 'Orang yang membuat dan mengembangkan program komputer.'],
      ['Teknisi', 'Orang yang memasang, merawat, dan memperbaiki perangkat komputer.']
    ]
  }
};

const matchItems = [
  { id: 'keyboard', label: 'Keyboard', category: 'hardware', hint: 'dapat disentuh' },
  { id: 'browser', label: 'Peramban web', category: 'software', hint: 'berupa program' },
  { id: 'student', label: 'Siswa pengguna', category: 'brainware', hint: 'manusia yang memakai' },
  { id: 'monitor', label: 'Monitor', category: 'hardware', hint: 'menampilkan gambar' },
  { id: 'os', label: 'Sistem operasi', category: 'software', hint: 'mengatur perangkat' },
  { id: 'technician', label: 'Teknisi', category: 'brainware', hint: 'merawat sistem' }
];

const quizQuestions = [
  {
    q: 'Manakah yang termasuk hardware?',
    options: ['Sistem operasi', 'Keyboard', 'Programmer', 'Peramban web'],
    answer: 1,
    explanation: 'Keyboard adalah perangkat fisik yang bisa dilihat dan disentuh, sehingga termasuk hardware.'
  },
  {
    q: 'Fungsi utama software adalah …',
    options: ['Menjadi bagian fisik komputer', 'Mengatur dan memberi instruksi kepada komputer', 'Menekan tombol keyboard', 'Membersihkan monitor'],
    answer: 1,
    explanation: 'Software berisi program atau instruksi yang mengatur cara kerja komputer.'
  },
  {
    q: 'Orang yang menggunakan dan mengoperasikan komputer disebut …',
    options: ['Hardware', 'Software', 'Brainware', 'Firmware'],
    answer: 2,
    explanation: 'Brainware adalah manusia yang menggunakan, mengatur, merawat, atau mengembangkan sistem komputer.'
  },
  {
    q: 'Apa yang mungkin terjadi jika software tidak bekerja?',
    options: ['Program tidak dapat dijalankan', 'Monitor berubah menjadi manusia', 'Keyboard menjadi lebih berat', 'Meja komputer ikut menyala'],
    answer: 0,
    explanation: 'Tanpa software yang berjalan, komputer tidak dapat menerima instruksi untuk menjalankan program.'
  },
  {
    q: 'Agar sistem komputer bermanfaat, ketiga komponen perlu …',
    options: ['Bekerja sendiri-sendiri', 'Saling mendukung', 'Diganti setiap hari', 'Diletakkan di ruangan berbeda'],
    answer: 1,
    explanation: 'Hardware, software, dan brainware saling mendukung untuk membentuk sistem komputer yang dapat digunakan.'
  }
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved, matching: { ...defaultState.matching, ...saved.matching }, reflection: { ...defaultState.reflection, ...saved.reflection } } : structuredClone(defaultState);
  } catch { return structuredClone(defaultState); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
function isComplete(id) { return state.completed.includes(id); }
function markComplete(id) {
  if (!state.completed.includes(id)) state.completed.push(id);
  saveState();
}
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
function progress() { return Math.round((state.completed.length / 5) * 100); }
function navButtons() { return '<button class="back-link" data-screen="home">← Kembali ke menu grid</button>'; }
function screenHeader(eyebrow, title, description) {
  return `<div class="screen-header"><div>${navButtons()}<div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div></div>`;
}
function miniSteps(active) {
  const steps = [['Pembuka', 'start'], ['Eksplorasi', 'materi'], ['Aktivitas', 'aktivitas'], ['Evaluasi', 'evaluasi'], ['Refleksi', 'refleksi']];
  return `<div class="mini-steps">${steps.map(([label, id], i) => `<div class="mini-step"><span>${String(i + 1).padStart(2, '0')}</span>${label}${id === active ? ' · sedang dibuka' : ''}</div>`).join('')}</div>`;
}
function sideNote(active, title = 'Peta perjalanan') {
  return `<aside class="side-note"><div class="mono-label" style="color:var(--lime)">120 menit bersama</div><h3>${title}</h3><p>Lima tahap singkat untuk mengenal komponen sistem komputer. Ikuti urutannya dengan santai, lalu kembali ke grid kapan pun kamu siap.</p>${miniSteps(active)}</aside>`;
}
function progressBar() {
  return `<div class="progress-wrap"><div class="progress-label">Progres belajar <span>${progress()}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${progress()}%"></div></div></div>`;
}

function renderHome() {
  const cards = [
    { id: 'start', time: '10 MENIT', icon: '◌', title: 'Pembuka sadar', desc: 'Tarik napas, cek kesiapan, dan tetapkan niat belajar.', color: 'mint' },
    { id: 'materi', time: '35 MENIT', icon: '▦', title: 'Kenali 3 komponen', desc: 'Jelajahi hardware, software, dan brainware lewat contoh dekat.', color: 'cyan' },
    { id: 'aktivitas', time: '30 MENIT', icon: '↗', title: 'Coba & diskusi', desc: 'Cocokkan komponen dan analisis skenario dalam kelompok.', color: 'lime' },
    { id: 'evaluasi', time: '25 MENIT', icon: '✓', title: 'Uji pemahaman', desc: 'Jawab kuis, lihat pembahasan, lalu coba lagi jika perlu.', color: 'orange' },
    { id: 'refleksi', time: '20 MENIT', icon: '✳', title: 'Refleksi', desc: 'Rangkum ide, tulis yang masih membingungkan, dan hubungkan dengan hidupmu.', color: 'violet' }
  ];
  app.innerHTML = `<section class="hero"><div><div class="eyebrow">INFORMATIKA · KELAS IX · BAB 4</div><h1>Komputer itu<br /><em>sebuah sistem.</em></h1><p class="hero-copy">Kenali tiga bagian penting yang membuat komputer bekerja: benda yang bisa disentuh, program yang memberi instruksi, dan manusia yang menggunakannya.</p></div><div class="hero-side"><div class="orbit-card"><div class="card-top"><span class="step-number">01 / 03 JP</span><span class="orbit-symbol">⊙</span></div><h3>Pertemuan 1</h3><p>Mengenal komponen sistem komputer</p></div></div></section>${progressBar()}<div class="grid-heading"><div><div class="eyebrow">PILIH PERJALANANMU</div><h2>Menu belajar</h2></div><p>Semua tahap = 120 menit · klik kartu untuk mulai</p></div><section class="lesson-grid">${cards.map(card => `<button class="lesson-card ${isComplete(card.id) ? 'complete' : ''}" data-screen="${card.id}"><div><div class="card-topline"><span class="card-icon">${card.icon}</span><span class="card-time">${card.time}</span></div><h3>${card.title}</h3><p>${card.desc}</p></div><span class="card-status">${isComplete(card.id) ? 'selesai' : 'belum dimulai'}</span></button>`).join('')}</section>`;
}

function renderStart() {
  app.innerHTML = `${screenHeader('TAHAP 01 · 10 MENIT', 'Siapkan ruang untuk belajar.', 'Sebelum mengenal komponen komputer, berhenti sebentar. Fokus yang tenang membantu kita melihat hubungan antarbagian dengan lebih jelas.')}<div class="section-layout"><section class="content-panel"><div class="breathing-card"><div class="breath-orb">↕</div><div><h3>Napas 4 — 4</h3><p>Tarik napas selama 4 hitungan. Tahan sebentar. Hembuskan selama 4 hitungan. Ulangi tiga kali.</p></div></div><h2 class="question">Bagaimana perasaanmu sebelum belajar?</h2><div class="choice-row">${['Siap', 'Penasaran', 'Sedikit lelah', 'Butuh bantuan'].map(item => `<button class="choice ${state.feeling === item ? 'selected' : ''}" data-feeling="${item}">${item}</button>`).join('')}</div><h2 class="question">Apa benda teknologi yang paling sering kamu gunakan di rumah?</h2><div class="choice-row">${['Ponsel', 'Laptop', 'Televisi', 'Lainnya'].map(item => `<button class="choice ${state.readiness === item ? 'selected' : ''}" data-readiness="${item}">${item}</button>`).join('')}</div><div class="cta-row"><button class="primary-btn" id="finishStart" ${state.feeling && state.readiness ? '' : 'disabled'}>Saya siap belajar →</button><button class="secondary-btn" data-screen="home">Simpan dulu</button></div></section>${sideNote('start', 'Mulai dengan sadar')}</div>`;
}

function renderMateri() {
  const cat = categories[state.category];
  app.innerHTML = `${screenHeader('TAHAP 02 · 35 MENIT', 'Tiga bagian, satu sistem.', 'Komputer tidak hanya soal layar dan tombol. Mari lihat peran benda, program, dan manusia yang bekerja bersama.')}<div class="section-layout"><section class="content-panel"><div class="category-tabs">${Object.entries(categories).map(([key, value]) => `<button class="category-tab ${state.category === key ? 'active' : ''}" data-category="${key}">${value.icon} · ${value.label}</button>`).join('')}</div><div class="category-panel ${cat.className}"><div class="mono-label">Komponen ${cat.icon}</div><h3>${cat.label}</h3><p>${cat.definition}</p><div class="example-chips">${cat.examples.map(([name]) => `<button class="example-chip" data-example="${name}">${name}</button>`).join('')}</div>${state.detail ? `<div class="example-detail"><strong>${escapeHtml(state.detail.name)}</strong> — ${escapeHtml(state.detail.text)}</div>` : ''}</div><div class="section-title"><h2>Hubungan sederhananya</h2><p>Ingat dengan pola: benda · instruksi · manusia</p></div><div class="info-strip"><div class="info-box"><b>Hardware</b><span>Tanpa hardware, program dan manusia tidak punya alat untuk bekerja.</span></div><div class="info-box"><b>Software</b><span>Tanpa software, hardware tidak tahu instruksi apa yang harus dijalankan.</span></div><div class="info-box"><b>Brainware</b><span>Tanpa manusia, sistem tidak punya tujuan dan tidak digunakan secara bermakna.</span></div></div><div class="cta-row"><button class="primary-btn" id="finishMateri">Saya sudah mengenali 3 komponen →</button></div></section>${sideNote('materi', 'Lihat, sentuh, pikirkan')}</div>`;
}

function renderAktivitas() {
  const solved = state.matching.solved;
  const selected = state.matching.selected;
  const doneMatching = solved.length === matchItems.length;
  const scenarios = [
    ['Hardware berhenti', 'Bayangkan monitor tiba-tiba tidak menyala. Bagian belajar apa yang terdampak dan apa solusinya?', 'hardware'],
    ['Software tidak berjalan', 'Aplikasi pengolah kata tidak mau dibuka. Apa yang bisa diperiksa terlebih dahulu?', 'software'],
    ['Brainware tidak terlibat', 'Komputer menyala, tetapi tidak ada yang memberi tujuan atau perintah. Apakah komputer tetap bermanfaat?', 'brainware']
  ];
  app.innerHTML = `${screenHeader('TAHAP 03 · 30 MENIT', 'Coba, cocokkan, diskusikan.', 'Kerjakan bagian pertama secara mandiri. Lalu, gunakan skenario kedua untuk berbagi peran: penulis, pembicara, dan penggambar alur.')}<div class="section-layout"><section class="content-panel"><div class="section-title" style="margin-top:0"><h2>Latihan mencocokkan</h2><p>${solved.length}/${matchItems.length} pasangan benar</p></div><p class="match-intro">Pilih satu komponen di kiri, lalu pilih kategori yang tepat di kanan. Perhatikan petunjuk kecilnya.</p><div class="match-board">${matchItems.map(item => `<button class="match-item ${selected === item.id ? 'selected' : ''} ${solved.includes(item.id) ? 'done' : ''}" data-match-item="${item.id}" ${solved.includes(item.id) ? 'disabled' : ''}><span class="match-icon">${item.id.slice(0,2).toUpperCase()}</span><span><strong>${item.label}</strong><br /><small>${item.hint}</small></span></button>`).join('')}<div></div><div class="choice-row" style="grid-column:1/-1">${Object.entries(categories).map(([key, val]) => `<button class="match-target target-${key}" data-match-target="${key}"><strong>${val.icon} · ${val.label}</strong></button>`).join('')}</div></div>${state.matching.feedback ? `<div class="feedback ${state.matching.feedback.startsWith('Belum') ? 'wrong' : ''}">${state.matching.feedback}</div>` : ''}<div class="section-title"><h2>Diskusi kelompok</h2><p>Pilih jawaban paling masuk akal</p></div><div class="scenario-list">${scenarios.map(([title, text, type], index) => `<article class="scenario ${state.scenarios.includes(index) ? 'done' : ''}"><div class="scenario-top"><h3>${index + 1}. ${title}</h3><span class="scenario-tag">${type}</span></div><p>${text}</p><div class="choice-row">${['Cari bagian yang bermasalah', 'Minta bantuan / cek instruksi', 'Keduanya penting'].map(answer => `<button class="choice ${state.scenarios.includes(index) && answer === 'Keduanya penting' ? 'selected' : ''}" data-scenario="${index}" data-answer="${answer}">${answer}</button>`).join('')}</div></article>`).join('')}</div><div class="cta-row"><button class="primary-btn" id="finishAktivitas" ${doneMatching && state.scenarios.length === 3 ? '' : 'disabled'}>Aktivitas selesai →</button></div></section>${sideNote('aktivitas', 'Belajar bersama')}</div>`;
}

function renderEvaluasi() {
  const submitted = state.quizSubmitted;
  const score = submitted ? quizQuestions.reduce((total, q, i) => total + (state.quizAnswers[i] === q.answer ? 1 : 0), 0) : 0;
  app.innerHTML = `${screenHeader('TAHAP 04 · 25 MENIT', 'Sekarang, buktikan idemu.', 'Jawab lima pertanyaan berikut. Tidak apa-apa jika belum sempurna — pembahasan setelah mengirim akan membantu memperjelas konsepnya.')}<div class="section-layout"><section class="content-panel">${submitted ? `<div class="score-box"><div><h3>${score >= 4 ? 'Mantap, fondasimu kuat.' : 'Bagus, mari perkuat lagi.'}</h3><p>Periksa pembahasan di tiap soal. Kamu bisa mengubah jawaban dan mencoba kembali.</p></div><div class="score-num">${score}/5</div></div>` : ''}<div class="quiz-list">${quizQuestions.map((q, i) => `<article class="quiz-item"><p class="quiz-q">${i + 1}. ${q.q}</p><div class="quiz-options">${q.options.map((option, j) => `<button class="quiz-option ${state.quizAnswers[i] === j ? 'chosen' : ''} ${submitted && j === q.answer ? 'correct' : ''} ${submitted && state.quizAnswers[i] === j && j !== q.answer ? 'incorrect' : ''}" data-quiz="${i}" data-answer-index="${j}">${String.fromCharCode(65 + j)}. ${option}</button>`).join('')}</div>${submitted ? `<p class="explanation"><strong>${state.quizAnswers[i] === q.answer ? 'Benar. ' : 'Coba perhatikan. '}</strong>${q.explanation}</p>` : ''}</article>`).join('')}</div><div class="cta-row">${!submitted ? `<button class="primary-btn" id="submitQuiz" ${Object.keys(state.quizAnswers).length === quizQuestions.length ? '' : 'disabled'}>Kirim jawaban →</button>` : `<button class="primary-btn" id="finishEvaluasi">Tandai evaluasi selesai →</button><button class="secondary-btn" id="retryQuiz">Coba lagi</button>`}</div></section>${sideNote('evaluasi', 'Cek pemahaman')}</div>`;
}

function renderRefleksi() {
  const done = isComplete('refleksi');
  app.innerHTML = `${screenHeader('TAHAP 05 · 20 MENIT', 'Apa yang tinggal di kepalamu?', 'Tutup pertemuan ini dengan tiga kalimat jujur. Refleksi bukan soal benar atau salah; ini cara melihat proses belajarmu sendiri.')}<div class="section-layout"><section class="content-panel"><div class="reflection-grid"><div class="reflection-box"><label for="learned">Satu hal baru yang kupahami …</label><textarea id="learned" placeholder="Contoh: hardware adalah bagian komputer yang bisa disentuh.">${escapeHtml(state.reflection.learned)}</textarea></div><div class="reflection-box"><label for="unclear">Bagian yang masih membingungkan …</label><textarea id="unclear" placeholder="Tulis pertanyaanmu di sini, sekecil apa pun.">${escapeHtml(state.reflection.unclear)}</textarea></div><div class="reflection-box"><label for="benefit">Manfaatnya untuk hidupku …</label><textarea id="benefit" placeholder="Di rumah, sekolah, atau kegiatan lain …">${escapeHtml(state.reflection.benefit)}</textarea></div></div><div class="final-card"><div style="font-size:24px">✳</div><div><b>Kalimat kunci hari ini</b><p>Hardware, software, dan brainware bukan bagian yang berdiri sendiri. Ketiganya saling mendukung agar sistem komputer dapat digunakan dengan tujuan yang bermakna.</p></div></div><div class="cta-row"><button class="primary-btn" id="finishReflection">${done ? 'Refleksi tersimpan ✓' : 'Simpan refleksi & selesai →'}</button><button class="secondary-btn" data-screen="home">Kembali ke menu</button></div></section>${sideNote('refleksi', 'Bawa pulang idenya')}</div>`;
}

function render() {
  const screens = { home: renderHome, start: renderStart, materi: renderMateri, aktivitas: renderAktivitas, evaluasi: renderEvaluasi, refleksi: renderRefleksi };
  (screens[currentScreen] || renderHome)();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

app.addEventListener('click', event => {
  const screenButton = event.target.closest('[data-screen]');
  if (screenButton) { currentScreen = screenButton.dataset.screen; render(); return; }
  const feeling = event.target.closest('[data-feeling]');
  if (feeling) { state.feeling = feeling.dataset.feeling; saveState(); renderStart(); return; }
  const readiness = event.target.closest('[data-readiness]');
  if (readiness) { state.readiness = readiness.dataset.readiness; saveState(); renderStart(); return; }
  if (event.target.closest('#finishStart')) { markComplete('start'); showToast('Pembuka selesai. Yuk kenali komponennya.'); currentScreen = 'home'; render(); return; }
  const category = event.target.closest('[data-category]');
  if (category) { state.category = category.dataset.category; state.detail = ''; saveState(); renderMateri(); return; }
  const example = event.target.closest('[data-example]');
  if (example) { const cat = categories[state.category]; const detail = cat.examples.find(([name]) => name === example.dataset.example); state.detail = { name: detail[0], text: detail[1] }; renderMateri(); return; }
  if (event.target.closest('#finishMateri')) { markComplete('materi'); showToast('Eksplorasi selesai. Saatnya mencoba.'); currentScreen = 'home'; render(); return; }
  const matchItem = event.target.closest('[data-match-item]');
  if (matchItem) { state.matching.selected = matchItem.dataset.matchItem; state.matching.feedback = ''; renderAktivitas(); return; }
  const matchTarget = event.target.closest('[data-match-target]');
  if (matchTarget && state.matching.selected) {
    const item = matchItems.find(x => x.id === state.matching.selected);
    if (item.category === matchTarget.dataset.matchTarget) {
      state.matching.solved.push(item.id); state.matching.feedback = `Benar — ${item.label} termasuk ${categories[item.category].label}. Pilih pasangan berikutnya.`;
      state.matching.selected = null;
    } else { state.matching.feedback = `Belum tepat. Petunjuknya: ${item.hint}. Coba kategori lain.`; }
    saveState(); renderAktivitas(); return;
  }
  const scenario = event.target.closest('[data-scenario]');
  if (scenario) { const index = Number(scenario.dataset.scenario); if (scenario.dataset.answer === 'Keduanya penting') { if (!state.scenarios.includes(index)) state.scenarios.push(index); showToast('Ide bagus — sistem perlu diperiksa dan dipahami.'); } else { showToast('Pikirkan hubungan antarbagian sekali lagi.'); } saveState(); renderAktivitas(); return; }
  const quiz = event.target.closest('[data-quiz]');
  if (quiz && !state.quizSubmitted) { state.quizAnswers[quiz.dataset.quiz] = Number(quiz.dataset.answerIndex); saveState(); renderEvaluasi(); return; }
  if (event.target.closest('#submitQuiz')) { state.quizSubmitted = true; saveState(); renderEvaluasi(); return; }
  if (event.target.closest('#retryQuiz')) { state.quizSubmitted = false; state.quizAnswers = {}; saveState(); renderEvaluasi(); return; }
  if (event.target.closest('#finishEvaluasi')) { markComplete('evaluasi'); showToast('Evaluasi selesai. Tinggal refleksi.'); currentScreen = 'home'; render(); return; }
  if (event.target.closest('#finishAktivitas')) { markComplete('aktivitas'); showToast('Aktivitas selesai. Bagikan satu temuanmu.'); currentScreen = 'home'; render(); return; }
  if (event.target.closest('#finishReflection')) {
    state.reflection = { learned: document.querySelector('#learned')?.value || '', unclear: document.querySelector('#unclear')?.value || '', benefit: document.querySelector('#benefit')?.value || '' };
    if (Object.values(state.reflection).some(value => value.trim())) { markComplete('refleksi'); showToast('Refleksi tersimpan. Pertemuan 1 selesai!'); renderRefleksi(); } else { showToast('Tulis setidaknya satu kalimat refleksi dulu.'); }
  }
});

app.addEventListener('input', event => {
  if (event.target.matches('textarea')) {
    state.reflection[event.target.id === 'learned' ? 'learned' : event.target.id === 'unclear' ? 'unclear' : 'benefit'] = event.target.value;
    saveState();
  }
});

document.querySelector('#resetProgress').addEventListener('click', () => {
  if (window.confirm('Hapus progres Pertemuan 1 dan mulai dari awal?')) {
    localStorage.removeItem(STORAGE_KEY); state = structuredClone(defaultState); currentScreen = 'home'; render(); showToast('Progres diatur ulang.');
  }
});

render();
