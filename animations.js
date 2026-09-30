/**
 * Hostel Midnight Pantry - Animations & Audio Engine
 * Inspired by Otsuka Air (otsuka-air.jp) & Soufflet Malt (souffletmalt.com)
 * Includes Web Audio API synthesizer for crunch/fizz, Canvas particles, 3D tilt, and microinteractions.
 */

// ==========================================
// 1. WEB AUDIO API SYNTHESIZER (Zero External Audio Files Needed)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Realistic Chip Crunch Sound
  playCrunch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Multiple rapid noise bursts for crispy texture
    const burstCount = 4;
    for (let i = 0; i < burstCount; i++) {
      const startTime = now + (i * 0.04) + (Math.random() * 0.01);
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 800, startTime);
      filter.Q.setValueAtTime(3 + Math.random() * 2, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(startTime);
    }
  }

  // Refreshing Soda Tab Pop & Fizz Sound
  playFizz() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Initial metallic "can pop" snap
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);

    // 2. Rising effervescent fizz spray (white noise sweep)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.9);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3500, now + 0.04);
    filter.frequency.linearRampToValueAtTime(5500, now + 0.7);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now + 0.04);
  }

  // Pure Harmonious Cart Bell Ding
  playChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.18 / (idx + 1), now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.75);
    });
  }

  // Friendly Hostel Doorbell Chime (Order Arrival)
  playDoorbell() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const tone1 = this.ctx.createOscillator();
    const tone2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    tone1.type = 'triangle';
    tone1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    tone1.connect(gain1);
    gain1.connect(this.ctx.destination);
    tone1.start(now);
    tone1.stop(now + 0.85);

    tone2.type = 'triangle';
    tone2.frequency.setValueAtTime(523.25, now + 0.4); // C5
    gain2.gain.setValueAtTime(0.25, now + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    tone2.connect(gain2);
    gain2.connect(this.ctx.destination);
    tone2.start(now + 0.4);
    tone2.stop(now + 1.35);
  }
}

const sounds = new SoundEngine();

// ==========================================
// 2. OTSUKA-AIR ATMOSPHERIC PARTICLE CANVAS
// ==========================================
class AtmosphericCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };
    this.particleCount = window.innerWidth < 768 ? 55 : 110;
    this.types = ['star', 'bubble', 'mote', 'crunch'];
    
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        baseX: 0,
        baseY: 0,
        radius: Math.random() * 2.8 + 0.8,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        type: this.types[Math.floor(Math.random() * this.types.length)],
        opacity: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI,
        color: this.getParticleColor()
      });
    }
  }

  getParticleColor() {
    const colors = [
      'rgba(0, 242, 254, ',   // Neon Cyan
      'rgba(138, 43, 226, ',  // Neon Purple
      'rgba(255, 170, 0, ',   // Golden Crisp
      'rgba(255, 75, 75, ',   // Midnight Red
      'rgba(255, 255, 255, '  // Pure Starlight
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.vx = e.clientX - this.mouse.lastX;
      this.mouse.vy = e.clientY - this.mouse.lastY;
      this.mouse.lastX = e.clientX;
      this.mouse.lastY = e.clientY;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Physics update
      p.pulseVal += p.pulseSpeed;
      const currentOpacity = p.opacity + Math.sin(p.pulseVal) * 0.2;

      // Cursor interaction (Otsuka Air gentle fluid deflection)
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 130;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 3.5;
        p.x -= (dx / dist) * force;
        p.y -= (dy / dist) * force;
      }

      // Natural drifting upward / floating like soda fizz and night dust
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      // Draw particle
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + Math.max(0.05, Math.min(0.9, currentOpacity)) + ')';
      this.ctx.shadowColor = p.color + '0.8)';
      this.ctx.shadowBlur = p.radius * 3.5;
      this.ctx.fill();

      // For bubble type, draw a tiny highlight ring
      if (p.type === 'bubble' && p.radius > 2.0) {
        this.ctx.beginPath();
        this.ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fill();
      }

      this.ctx.restore();

      // Connect nearby particles with subtle atmospheric lines (Otsuka Air style)
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < 65) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - cdist / 65) * 0.12})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 3. FAUX 3D CARD TILT & DEPTH (AR/VR Motion)
// ==========================================
function initCardTilt() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;

      // Dynamic holographic specular reflection
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 60%, transparent 80%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.background = 'none';
      }
    });
  });
}

// ==========================================
// 4. FLYING ITEM MICROINTERACTION INTO CART
// ==========================================
function triggerFlyToCart(originElement, itemEmoji = '\u{1F35F}') {
  const cartIcon = document.getElementById('header-cart-btn') || document.querySelector('.floating-cart-bar');
  if (!cartIcon || !originElement) return;

  const startRect = originElement.getBoundingClientRect();
  const targetRect = cartIcon.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.className = 'flying-cart-item';
  flyer.innerText = itemEmoji;
  document.body.appendChild(flyer);

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;

  // Animate parabolic arc using Web Animations API
  const keyframes = [
    {
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      opacity: 1
    },
    {
      transform: `translate(${(targetX - startX) * 0.5}px, ${(targetY - startY) * 0.5 - 70}px) scale(1.4) rotate(180deg)`,
      opacity: 0.9,
      offset: 0.5
    },
    {
      transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.3) rotate(360deg)`,
      opacity: 0.2
    }
  ];

  const animation = flyer.animate(keyframes, {
    duration: 650,
    easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)'
  });

  animation.onfinish = () => {
    flyer.remove();
    // Bounce cart icon on impact
    cartIcon.classList.remove('cart-bounce-pop');
    void cartIcon.offsetWidth; // trigger reflow
    cartIcon.classList.add('cart-bounce-pop');
  };
}

// ==========================================
// 5. CONFETTI CELEBRATION (Order Success)
// ==========================================
function launchHostelConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const emojis = ['\u{1F35F}', '\u{1F964}', '\u{2728}', '\u{26A1}', '\u{1F319}', '\u{1F389}', '\u{1F525}', '\u{1F6F5}'];
  const colors = ['#00f2fe', '#8a2be2', '#ffaa00', '#10b981', '#ff4b4b', '#ffffff'];

  for (let i = 0; i < 65; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';

    if (Math.random() > 0.4) {
      el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.fontSize = `${Math.random() * 16 + 14}px`;
    } else {
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = `${Math.random() * 10 + 6}px`;
      el.style.height = `${Math.random() * 14 + 8}px`;
      el.style.borderRadius = `${Math.random() > 0.5 ? '50%' : '2px'}`;
    }

    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = '-20px';
    el.style.animationDuration = `${Math.random() * 2.2 + 1.8}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    container.appendChild(el);
  }

  setTimeout(() => {
    container.remove();
  }, 4500);
}

// ==========================================
// 6. SCROLLYTELLING INTERSECTION OBSERVER
// ==========================================
function initScrollytelling() {
  const storyChapters = document.querySelectorAll('.scrolly-chapter');
  if (!storyChapters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        // Highlight active story step in timeline indicator
        const stepIndex = entry.target.getAttribute('data-chapter');
        document.querySelectorAll('.timeline-node').forEach(node => {
          if (node.getAttribute('data-chapter') === stepIndex) {
            node.classList.add('active');
          } else {
            node.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.55
  });

  storyChapters.forEach(chapter => observer.observe(chapter));
}

// Export functions to window
window.sounds = sounds;
window.triggerFlyToCart = triggerFlyToCart;
window.launchHostelConfetti = launchHostelConfetti;
window.initCardTilt = initCardTilt;
window.initScrollytelling = initScrollytelling;
