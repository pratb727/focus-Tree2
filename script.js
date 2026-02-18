// --- Configuration ---
const CONFIG = {
    images: [
        "https://i.ibb.co/b5TWrWnT/seed.png",
        "https://i.ibb.co/RkvyfX9c/sapling.png",
        "https://i.ibb.co/DxDS24Z/plant.png",
        "https://i.ibb.co/bjNVZcMj/bigger-plant.png",
        "https://i.ibb.co/k27Nj0dJ/tree.png"
    ],
    wiltedImage: "https://i.ibb.co/3YMwBG1j/wilted-tree.png",
    
    quotes: [
        "Growth takes time.",
        "Stay rooted, keep growing.",
        "Focus feeds the soul.",
        "Silence is where ideas bloom."
    ]
};

const el = {
    timer: document.getElementById('timerDisplay'),
    slider: document.getElementById('timeSlider'),
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    sessionControls: document.getElementById('sessionControls'),
    treeImg: document.getElementById('treeImage'),
    themeBtn: document.getElementById('themeToggle'),
    particleBox: document.getElementById('particleContainer'),
    confettiBox: document.getElementById('confettiContainer'),
    streak: document.getElementById('streakCount'),
    total: document.getElementById('totalTime'),
    taskInput: document.getElementById('taskInput'),
    addBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    quote: document.getElementById('quoteDisplay')
};

let state = {
    duration: 25 * 60,
    timeLeft: 25 * 60,
    active: false,
    paused: false,
    interval: null,
    night: false,
    streak: parseInt(localStorage.getItem('ft_streak')) || 0,
    total: parseInt(localStorage.getItem('ft_total')) || 0,
    particleInterval: null
};

// --- Init ---
function init() {
    renderStats();
    el.slider.addEventListener('input', updateTime);
    el.startBtn.addEventListener('click', start);
    el.stopBtn.addEventListener('click', () => fail("gave up"));
    el.pauseBtn.addEventListener('click', togglePause);
    el.themeBtn.addEventListener('click', toggleTheme);
    el.addBtn.addEventListener('click', addTask);
    el.taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());

    // Anti-Cheat (Even when paused, you can't leave!)
    document.addEventListener("visibilitychange", () => {
        if(document.hidden && state.active) fail("distraction");
    });

    el.quote.textContent = CONFIG.quotes[Math.floor(Math.random() * CONFIG.quotes.length)];
    startParticles(); 
}

// --- Timer Logic ---
function updateTime(e) {
    if(state.active) return;
    const mins = parseInt(e.target.value);
    state.duration = mins * 60;
    state.timeLeft = state.duration;
    renderTimer();
}

function renderTimer() {
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    el.timer.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function start() {
    state.active = true;
    state.paused = false;
    
    // UI Updates
    el.slider.disabled = true;
    el.startBtn.classList.add('hidden');
    el.sessionControls.classList.remove('hidden');
    el.pauseBtn.textContent = "⏸";
    
    // Reset to Seed
    updateTreeStage(0);

    state.interval = setInterval(() => {
        if (!state.paused) {
            state.timeLeft--;
            renderTimer();
            calcTreeProgress();

            if(state.timeLeft <= 0) success();
        }
    }, 1000);
}

function togglePause() {
    state.paused = !state.paused;
    el.pauseBtn.textContent = state.paused ? "▶" : "⏸";
    // Optional: Add visual opacity change to tree when paused
    el.treeImg.style.opacity = state.paused ? "0.5" : "1";
}

function calcTreeProgress() {
    const progress = 1 - (state.timeLeft / state.duration);
    const index = Math.floor(progress * (CONFIG.images.length - 1));
    updateTreeStage(index);
}

function updateTreeStage(index) {
    const url = CONFIG.images[index];
    if (el.treeImg.src !== url) {
        el.treeImg.style.opacity = 0; 
        setTimeout(() => {
            el.treeImg.src = url;
            el.treeImg.style.opacity = 1; 
        }, 300);
    }
}

function success() {
    clearInterval(state.interval);
    state.active = false;
    
    // Final Stage
    updateTreeStage(4);
    
    state.streak++;
    state.total += Math.floor(state.duration / 60);
    save();
    renderStats();
    
    // Trigger Petal Rain
    firePetalConfetti();
    
    alert("Tree Fully Grown! Session Complete. 🌳");
    resetUI();
}

function fail(reason) {
    clearInterval(state.interval);
    state.active = false;
    
    el.treeImg.src = CONFIG.wiltedImage;
    state.streak = 0;
    save();
    renderStats();

    alert(reason === "distraction" ? "Distraction detected! The tree has wilted." : "You gave up. Tree wilted.");
    resetUI();
}

function resetUI() {
    el.slider.disabled = false;
    el.startBtn.classList.remove('hidden');
    el.sessionControls.classList.add('hidden');
    el.treeImg.style.opacity = "1"; // Ensure opacity is back to normal
    state.timeLeft = state.duration;
    renderTimer();
}

// --- Confetti & Particles ---
function firePetalConfetti() {
    // Generate 80 petals
    for (let i = 0; i < 80; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        // Random positioning
        petal.style.left = Math.random() * 100 + 'vw';
        
        // Random pink shades
        const colors = ['#ffc0cb', '#ffb7b2', '#ff9e9e', '#f8a5c2'];
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random Fall speed and delay
        petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
        petal.style.animationDelay = (Math.random() * 1) + 's';
        
        el.confettiBox.appendChild(petal);
        
        // Remove after animation (Self-cleaning)
        setTimeout(() => {
            petal.remove();
        }, 5000);
    }
}

function startParticles() {
    if (state.particleInterval) clearInterval(state.particleInterval);
    state.particleInterval = setInterval(() => createParticle(), 800);
}

function createParticle() {
    const p = document.createElement('div');
    if (state.night) {
        p.className = 'firefly';
        p.style.top = Math.random() * 80 + '%';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 3 + 2) + 's';
    } else {
        p.className = 'leaf';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (Math.random() * 5 + 4) + 's';
    }
    el.particleBox.appendChild(p);
    setTimeout(() => p.remove(), 8000);
}

// --- Theme ---
function toggleTheme() {
    state.night = !state.night;
    document.body.classList.toggle('night-mode');
    el.themeBtn.querySelector('.icon').textContent = state.night ? '🌙' : '☀️';
    
    el.particleBox.innerHTML = ''; 
    
    if(state.night) generateStars();
    else removeStars();
}

function generateStars() {
    for(let i=0; i<40; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 60 + '%';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        el.particleBox.appendChild(star);
    }
}

function removeStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(s => s.remove());
}

// --- Data & Tasks ---
function save() {
    localStorage.setItem('ft_streak', state.streak);
    localStorage.setItem('ft_total', state.total);
}
function renderStats() {
    el.streak.textContent = state.streak;
    el.total.textContent = state.total;
}
function addTask() {
    const txt = el.taskInput.value.trim();
    if(!txt) return;
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `<input type="checkbox"><span>${txt}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;">×</button>`;
    li.querySelector('input').addEventListener('change', () => li.classList.toggle('done'));
    el.taskList.prepend(li);
    el.taskInput.value = '';
}

init();
