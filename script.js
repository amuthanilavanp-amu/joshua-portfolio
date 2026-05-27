/* ==========================================================================
   FUTURISTIC PORTFOLIO - CORE INTERACTION ENGINE (script.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Core systems initializer
    initGlowCursor();
    initParticleBackground();
    initScrollReveal();
    initWebAudioSynth();
    initRadialSkills();
    initRadarChart();
    initContactForm();
    initScrollSpy();
    
    // Interactive popups, birds and special features
    initCVTerminal();
    initProjectsCatalog();
    initParallaxBirds();
    initSpontaneousBirds();
    initSpecialFeatures();
    initDetailsModalViewer();
    initPersonalityRealImageToggle();
});

/* ==========================================================================
   1. HOLOGRAPHIC GLOW CURSOR
   ========================================================================== */
function initGlowCursor() {
    const glowPointer = document.getElementById('glow-pointer');
    if (!glowPointer) return;

    // Detect if device supports touch to prevent sticking cursor on mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        glowPointer.style.display = 'none';
        return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const speed = 0.15; // Pointer delay speed

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    // Smooth movement interpolation (LERP)
    function animateCursor() {
        currentX += (targetX - currentX) * speed;
        currentY += (targetY - currentY) * speed;
        glowPointer.style.left = `${currentX}px`;
        glowPointer.style.top = `${currentY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Scale up glow when hovering over interactive elements
    const hoverables = document.querySelectorAll('a, button, input, textarea, .project-card, .radial-skill-card, .interest-bubble-wrapper, .timeline-node');
    hoverables.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            glowPointer.style.width = '380px';
            glowPointer.style.height = '380px';
        });
        elem.addEventListener('mouseleave', () => {
            glowPointer.style.width = '300px';
            glowPointer.style.height = '300px';
        });
    });
}

/* ==========================================================================
   2. DIGITAL PARTICLE SYSTEM (CANVAS BACKGROUND)
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.baseAlpha = Math.random() * 0.4 + 0.15;
            this.alpha = this.baseAlpha;
            this.hue = Math.random() < 0.6 ? 180 : 280; // Blue/Cyan vs Purple Hues
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Screen boundary loop
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Interactive mouse repel/attract
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move slightly away from cursor
                    this.x -= dx / distance * force * 1.2;
                    this.y -= dy / distance * force * 1.2;
                    this.alpha = Math.min(1.0, this.baseAlpha + force * 0.5);
                } else {
                    if (this.alpha > this.baseAlpha) {
                        this.alpha -= 0.01;
                    }
                }
            } else {
                if (this.alpha > this.baseAlpha) {
                    this.alpha -= 0.01;
                }
            }
        }

        draw() {
            ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function setup() {
        const particleCount = Math.min(100, Math.floor((width * height) / 12000));
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Connect neighboring particles with neon lines
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < 110) {
                    const alpha = (110 - dist) / 110 * 0.15;
                    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    setup();
    animate();
}

/* ==========================================================================
   3. WEB AUDIO API SYNTHESIZER
   ========================================================================== */
function initWebAudioSynth() {
    let audioCtx = null;
    let isSoundEnabled = true;

    const soundToggle = document.getElementById('sound-toggle-btn');
    const statusLabel = soundToggle ? soundToggle.querySelector('.sound-status-label') : null;

    // Load sound preference from LocalStorage
    const savedSound = localStorage.getItem('portfolio-sound-pref');
    if (savedSound === 'off') {
        isSoundEnabled = false;
        if (soundToggle) {
            soundToggle.classList.add('sound-muted');
            if (statusLabel) statusLabel.textContent = 'OFF';
        }
    }

    // Toggle button logic
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isSoundEnabled = !isSoundEnabled;
            if (isSoundEnabled) {
                soundToggle.classList.remove('sound-muted');
                if (statusLabel) statusLabel.textContent = 'ON';
                localStorage.setItem('portfolio-sound-pref', 'on');
                // Brief sound check feedback
                playSynthSound(440, 'sine', 0.1, 0.05);
            } else {
                soundToggle.classList.add('sound-muted');
                if (statusLabel) statusLabel.textContent = 'OFF';
                localStorage.setItem('portfolio-sound-pref', 'off');
            }
        });
    }

    // Audio Context lazy initialization
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Dynamic synthesizer play function
    function playSynthSound(freqStart, type = 'sine', duration = 0.15, gainStart = 0.08, freqEnd = null) {
        if (!isSoundEnabled) return;

        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freqStart, ctx.currentTime);

            // Synthesize frequency sweep (chirps/lasers)
            if (freqEnd !== null) {
                osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
            }

            gainNode.gain.setValueAtTime(gainStart, ctx.currentTime);
            // Dynamic exponential decay
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Web Audio Playback blocked or unsupported:', e);
        }
    }

    // Attach dynamic hover & click sounds to specific UI selectors
    function attachSounds(selector, hoverFreq, clickFreq, hoverDur = 0.08, clickDur = 0.25) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(elem => {
            // Synth soft electronic beep on hover
            elem.addEventListener('mouseenter', () => {
                playSynthSound(hoverFreq, 'sine', hoverDur, 0.05, hoverFreq * 1.5);
            });
            // Synth resonant laser chirp on click
            elem.addEventListener('click', () => {
                playSynthSound(clickFreq, 'triangle', clickDur, 0.12, 60);
            });
        });
    }

    // Apply sounds across UI components
    attachSounds('.nav-link, .btn-connect, .social-icon-wrapper', 523.25, 880, 0.05, 0.18); // High clear chime
    attachSounds('.btn-primary, .btn-secondary, .btn-view-all, .btn-explore-more', 392.00, 600, 0.08, 0.22); // Solid chime
    attachSounds('.about-card, .project-card, .timeline-node, .interest-bubble-wrapper', 261.63, 400, 0.1, 0.2); // Mid mechanical beep
    attachSounds('.flow-step', 659.25, 1200, 0.04, 0.12); // Digital micro-beeps
}

/* ==========================================================================
   4. SVG SKILL progress RINGS (INTERSECTION OBSERVER)
   ========================================================================== */
function initRadialSkills() {
    const skillCards = document.querySelectorAll('.radial-skill-card');
    if (skillCards.length === 0) return;

    const observerOptions = {
        threshold: 0.2
    };

    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillCard(entry.target);
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    skillCards.forEach(card => skillObserver.observe(card));

    function animateSkillCard(card) {
        const targetPercent = parseInt(card.getAttribute('data-percent'), 10);
        const percentText = card.querySelector('.radial-percentage');
        const radialBar = card.querySelector('.radial-bar');

        if (!percentText || !radialBar) return;

        // Animate stroke dasharray offset
        // R = 42, Circumference = 2 * PI * R ≈ 263.8
        const circumference = 263.8;
        const offset = circumference - (targetPercent / 100) * circumference;
        
        radialBar.style.strokeDashoffset = offset;

        // Animate digital percentage counter increment
        let currentPercent = 0;
        const duration = 1800; // Counter timing
        const stepTime = Math.abs(Math.floor(duration / targetPercent));

        const timer = setInterval(() => {
            currentPercent++;
            percentText.textContent = `${currentPercent}%`;
            if (currentPercent >= targetPercent) {
                clearInterval(timer);
            }
        }, stepTime);
    }
}

/* ==========================================================================
   5. RESPONSIVE SVG RADAR CHART ENGINE
   ========================================================================== */
function initRadarChart() {
    const svg = document.getElementById('radar-svg');
    if (!svg) return;

    // Design parameters
    const size = 400;
    const center = size / 2;
    const radius = 130;
    const gridLevels = 5;

    // Six axes attributes
    const skills = [
        { label: "LOGIC", val: 0.90 },
        { label: "CREATIVITY", val: 0.90 },
        { label: "PROBLEM SOLVING", val: 0.95 },
        { label: "COMMUNICATION", val: 0.85 },
        { label: "INNOVATION", val: 0.90 },
        { label: "AI", val: 0.95 }
    ];

    const count = skills.length;
    const angleStep = (Math.PI * 2) / count;

    const gridGroup = svg.querySelector('.radar-grid-grp');
    const labelGroup = svg.querySelector('.radar-labels-grp');
    const dataPoly = svg.querySelector('.radar-poly');
    const glowPoly = svg.querySelector('.radar-poly-glow');

    // 1. Draw Concentric Grid Hexagons
    for (let level = 1; level <= gridLevels; level++) {
        const r = (radius / gridLevels) * level;
        const points = [];

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            points.push(`${x},${y}`);
        }

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points.join(" "));
        polygon.setAttribute("class", "radar-ring");
        gridGroup.appendChild(polygon);
    }

    // 2. Draw Spokes and Labels
    skills.forEach((skill, i) => {
        const angle = i * angleStep - Math.PI / 2;
        // Outer bounds
        const outerX = center + radius * Math.cos(angle);
        const outerY = center + radius * Math.sin(angle);

        // Grid axis line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", center);
        line.setAttribute("y1", center);
        line.setAttribute("x2", outerX);
        line.setAttribute("y2", outerY);
        line.setAttribute("class", "radar-grid-line");
        gridGroup.appendChild(line);

        // Custom label position placement details
        const textDist = radius + 22;
        const textX = center + textDist * Math.cos(angle);
        const textY = center + textDist * Math.sin(angle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("class", "radar-label-text");
        
        // Alignment formatting
        if (Math.abs(textX - center) < 10) {
            text.setAttribute("text-anchor", "middle");
        } else if (textX > center) {
            text.setAttribute("text-anchor", "start");
        } else {
            text.setAttribute("text-anchor", "end");
        }

        // Adjust vertical height slightly
        if (Math.abs(textY - center) < 10) {
            text.setAttribute("dy", "3");
        } else if (textY > center) {
            text.setAttribute("dy", "10");
        } else {
            text.setAttribute("dy", "-5");
        }

        text.textContent = skill.label;
        labelGroup.appendChild(text);
    });

    // 3. Draw Cybernetically Glow Filled Data Polygon
    function renderRadarData(scale = 1.0) {
        const points = [];
        skills.forEach((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * skill.val * scale;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            points.push(`${x},${y}`);
        });

        const pointsStr = points.join(" ");
        dataPoly.setAttribute("points", pointsStr);
        glowPoly.setAttribute("points", pointsStr);
    }

    // Initial render
    renderRadarData(1.0);

    // Subtle scale morph interaction on spider chart container hover
    const parentContainer = document.getElementById('radar-chart-card');
    if (parentContainer) {
        parentContainer.addEventListener('mouseenter', () => {
            // Animate scale pulse
            let s = 1.0;
            const morph = setInterval(() => {
                s += 0.01;
                renderRadarData(s);
                if (s >= 1.05) clearInterval(morph);
            }, 10);
        });

        parentContainer.addEventListener('mouseleave', () => {
            let s = 1.05;
            const morph = setInterval(() => {
                s -= 0.01;
                renderRadarData(s);
                if (s <= 1.0) {
                    renderRadarData(1.0);
                    clearInterval(morph);
                }
            }, 10);
        });
    }
}

/* ==========================================================================
   6. SCROLL REVEAL (FADE UP ENTRANCE)
   ========================================================================== */
function initScrollReveal() {
    const revealElems = document.querySelectorAll('.scroll-reveal');
    if (revealElems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElems.forEach(elem => observer.observe(elem));

    // Monitor Sticky Header scroll threshold
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   7. SCROLL SPY (ACTIVE NAV HIGHLIGHTS)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let currentSecId = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 180; // Offset for header
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSecId = section.getAttribute('id');
            }
        });

        if (currentSecId !== "") {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-sec') === currentSecId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/* ==========================================================================
   8. CONTACT FORM SUBMISSIONS & VALIDATIONS
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('cyber-contact-form');
    const successMsg = document.getElementById('form-success-msg');
    const submitBtn = document.getElementById('form-submit-btn');

    if (!form || !successMsg || !submitBtn) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Capture values
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const msg = document.getElementById('form-message').value.trim();

        if (name === "" || email === "" || msg === "") return;

        // Button interactive loading state
        const originalBtnText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = "TRANSMITTING SIGNAL...";
        submitBtn.disabled = true;

        // Send submission to Netlify Forms via AJAX POST
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                "form-name": "contact",
                "name": name,
                "email": email,
                "message": msg
            }).toString()
        })
        .then(() => {
            // Trigger visual success box
            form.style.opacity = '0';
            setTimeout(() => {
                form.style.display = 'none';
                successMsg.classList.add('show');
            }, 300);

            // Store signal logs locally
            const submissions = JSON.parse(localStorage.getItem('uplink-comms') || '[]');
            submissions.push({ name, email, msg, timestamp: new Date().toISOString() });
            localStorage.setItem('uplink-comms', JSON.stringify(submissions));
            
            console.log('Signal transmitted successfully:', { name, email, msg });
        })
        .catch((error) => {
            console.error('Netlify form submission failed:', error);
            submitBtn.querySelector('span').textContent = "TRANSMISSION ERROR";
            submitBtn.disabled = false;
        });
    });
}

/* ==========================================================================
   9. INTERACTIVE CYBER DECRYPT TERMINAL (CV POPUP)
   ========================================================================== */
function initCVTerminal() {
    const trigger = document.getElementById('btn-download-cv');
    const modal = document.getElementById('cv-terminal-modal');
    const closeBtn = document.getElementById('close-cv-modal');
    const consoleOutput = document.getElementById('terminal-log-lines');
    const cmdLine = document.getElementById('terminal-typed-cmd');
    const downloadRaw = document.getElementById('btn-download-raw-cv');

    if (!trigger || !modal || !closeBtn || !consoleOutput) return;

    let isTyping = false;

    // Terminal print log sequences
    const logLines = [
        "SYSTEM: Initializing handshake protocol...",
        "CONNECTING: amuthanilavan_p.db.secure port 9163...",
        "SUCCESS: Encrypted uplink established.",
        "DECRYPTING: Core Bio Profile Data... [100%]",
        "DECRYPTING: Academic History Summary (B.Tech AI & DS)... [100%]",
        "DECRYPTING: Technical Skills Radar Vector Grid... [100%]",
        "DECRYPTING: Creative Projects Ledger Database... [100%]",
        "SUCCESS: CV stream decryption complete. Stream ready."
    ];

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('show');
        
        if (isTyping) return;
        isTyping = true;
        
        consoleOutput.innerHTML = "";
        cmdLine.textContent = "";

        // Sequentially print console lines with sound beeps
        let lineIdx = 0;
        function printNextLine() {
            if (lineIdx < logLines.length) {
                const line = document.createElement('div');
                line.className = "terminal-log-line";
                line.textContent = logLines[lineIdx];
                consoleOutput.appendChild(line);
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
                
                // Synth brief mechanical sweep per print line
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    osc.frequency.setValueAtTime(400 + lineIdx * 50, ctx.currentTime);
                    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
                    osc.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.08);
                } catch(e){}

                lineIdx++;
                setTimeout(printNextLine, 350);
            } else {
                // Type dynamic terminal command simulation after logs finish
                typeCommand();
            }
        }

        setTimeout(printNextLine, 600);
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        isTyping = false;
    });

    function typeCommand() {
        const cmdStr = "cat amuthanilavan_cv.txt";
        let charIdx = 0;
        
        function typeChar() {
            if (charIdx < cmdStr.length) {
                cmdLine.textContent += cmdStr[charIdx];
                charIdx++;
                setTimeout(typeChar, 70);
            } else {
                isTyping = false;
            }
        }
        setTimeout(typeChar, 300);
    }

    // Dynamic dynamic CV downloader click handler
    downloadRaw.addEventListener('click', (e) => {
        e.preventDefault();
        
        const cvText = `=========================================
AMUTHANILAVAN. P - PROFESSIONAL RESUME
=========================================
B.Tech - Artificial Intelligence & Data Science
Location: Tamil Nadu, India
Email: amuthanilavanp@gmail.com
Phone: 6369729536

PROFILE SUMMARY:
-----------------------------------------
Curious mind and future-focused thinker. Experienced in building
intelligent AI solutions, responsive web architectures, and 
exploring state-of-the-art data science workflows.

EDUCATION:
-----------------------------------------
* B.Tech in Artificial Intelligence & Data Science
  Tamil Nadu, India

SKILLS CORE:
-----------------------------------------
* Website Development & Architecture (90%)
* AI Thinking & Machine Learning Models (95%)
* Creative Writing & Script Drafting (85%)
* Technical Video Production (75%)
* Logic & Problem Solving (95%)

EXPERIENCE & PROJECTS:
-----------------------------------------
1. AI Projects: Deep Learning network visualizers and ML classifiers.
2. Web Applications: Responsive cyber-themed glassmorphism sandboxes.
3. Future Concepts & Experiments: A* pathfinding and synthetic Audio.

=========================================
End of Decrypted Data Stream.
=========================================`;

        const blob = new Blob([cvText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Amuthanilavan_P_Resume.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

/* ==========================================================================
   10. ADVANCED PROJECTS CATALOG MODAL
   ========================================================================== */
function initProjectsCatalog() {
    const trigger = document.getElementById('btn-view-all-projects');
    const modal = document.getElementById('projects-gallery-modal');
    const closeBtn = document.getElementById('close-projects-modal');

    if (!trigger || !modal || !closeBtn) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
}

/* ==========================================================================
   11. DYNAMIC BIRD GLIDERS & PARALLAX ENGINE
   ========================================================================== */
function initParallaxBirds() {
    const heroSec = document.getElementById('hero');
    const birds = document.querySelectorAll('.hero-image-wrapper .floating-bird');

    if (!heroSec || birds.length === 0) return;

    heroSec.addEventListener('mousemove', (e) => {
        // Compute delta offsets relative to center
        const dx = e.clientX - window.innerWidth / 2;
        const dy = e.clientY - window.innerHeight / 2;

        birds.forEach((bird, idx) => {
            const factor = (idx + 1) * 0.05; // Differing depth layers
            const xOffset = dx * factor;
            const yOffset = dy * factor;
            bird.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
}

// Spontaneously glide single flying birds across viewport at intervals
function initSpontaneousBirds() {
    function spawnFlyingBird() {
        // Verify MOUSE INTERACTIONS is active
        const toggleMouse = document.getElementById('toggle-mouse');
        if (toggleMouse && toggleMouse.classList.contains('muted-feature')) {
            setTimeout(spawnFlyingBird, 15000);
            return;
        }

        const bird = document.createElement('div');
        // Random cyan vs purple bird color
        const isPurple = Math.random() > 0.5;
        bird.className = `flying-glider-bird ${isPurple ? 'glow-purple' : 'glow-cyan'}`;
        
        // Custom inline flapping SVG
        bird.innerHTML = `
            <svg class="bird-svg" viewBox="0 0 100 100">
                <path class="bird-left-wing" d="M 50,50 C 30,20 10,35 5,55 C 15,50 35,48 50,50 Z" fill="${isPurple ? '#d500f9' : '#00e5ff'}" />
                <path class="bird-right-wing" d="M 50,50 C 70,20 90,35 95,55 C 85,50 65,48 50,50 Z" fill="${isPurple ? '#d500f9' : '#00e5ff'}" />
                <path class="bird-body" d="M 50,45 C 48,50 48,70 50,85 C 52,70 52,50 50,45 Z M 50,45 C 50,40 48,35 50,30 C 52,35 50,40 50,45 Z" fill="${isPurple ? '#d500f9' : '#00e5ff'}" />
            </svg>
        `;

        // Start coordinates
        const startY = Math.random() * (window.innerHeight * 0.7) + (window.innerHeight * 0.1);
        const directionLeftToRight = Math.random() > 0.5;
        
        bird.style.top = `${startY}px`;
        bird.style.left = directionLeftToRight ? `-60px` : `${window.innerWidth + 60}px`;
        
        // Initial glide scaling
        bird.style.transform = `scale(${Math.random() * 0.4 + 0.4}) ${directionLeftToRight ? '' : 'scaleX(-1)'}`;
        
        document.body.appendChild(bird);

        const duration = Math.random() * 8000 + 8000; // 8 - 16s flight duration
        const startTime = performance.now();
        const startX = directionLeftToRight ? -60 : window.innerWidth + 60;
        const targetX = directionLeftToRight ? window.innerWidth + 60 : -60;

        function animateGlider(now) {
            const progress = (now - startTime) / duration;
            if (progress < 1) {
                const currentX = startX + (targetX - startX) * progress;
                // Add vertical waves
                const currentY = startY + Math.sin(progress * Math.PI * 4) * 30;
                bird.style.left = `${currentX}px`;
                bird.style.top = `${currentY}px`;
                requestAnimationFrame(animateGlider);
            } else {
                bird.remove();
            }
        }
        requestAnimationFrame(animateGlider);

        // Schedule next random glide
        setTimeout(spawnFlyingBird, Math.random() * 15000 + 12000);
    }

    // Delay first glide spawn
    setTimeout(spawnFlyingBird, 8000);
}

/* ==========================================================================
   12. SPECIAL FEATURES SYSTEM CONTROLLER
   ========================================================================== */
function initSpecialFeatures() {
    const toggleAnim = document.getElementById('toggle-animations');
    const toggleMouse = document.getElementById('toggle-mouse');
    const toggleGlass = document.getElementById('toggle-glass');
    const toggleUI = document.getElementById('toggle-ui');

    // 1. Toggle standard CSS animations and transitions
    if (toggleAnim) {
        toggleAnim.addEventListener('click', () => {
            document.body.classList.toggle('no-animations');
            const isActive = !document.body.classList.contains('no-animations');
            toggleAnim.querySelector('.status-label').textContent = isActive ? "ON" : "OFF";
            if (isActive) {
                toggleAnim.classList.remove('muted-feature');
            } else {
                toggleAnim.classList.add('muted-feature');
            }
        });
    }

    // 2. Toggle particle background & custom follow cursor
    if (toggleMouse) {
        toggleMouse.addEventListener('click', () => {
            const glowPointer = document.getElementById('glow-pointer');
            const pCanvas = document.getElementById('particle-canvas');
            
            toggleMouse.classList.toggle('muted-feature');
            const isActive = !toggleMouse.classList.contains('muted-feature');
            toggleMouse.querySelector('.status-label').textContent = isActive ? "ON" : "OFF";

            if (isActive) {
                if (glowPointer) glowPointer.style.display = 'block';
                if (pCanvas) pCanvas.style.opacity = '1';
            } else {
                if (glowPointer) glowPointer.style.display = 'none';
                if (pCanvas) pCanvas.style.opacity = '0';
            }
        });
    }

    // 3. Toggle Glass blur overlays
    if (toggleGlass) {
        toggleGlass.addEventListener('click', () => {
            document.body.classList.toggle('no-glass');
            const isActive = !document.body.classList.contains('no-glass');
            toggleGlass.querySelector('.status-label').textContent = isActive ? "ON" : "OFF";
            if (isActive) {
                toggleGlass.classList.remove('muted-feature');
            } else {
                toggleGlass.classList.add('muted-feature');
            }
        });
    }

    // 4. Toggle Matrix Green Theme (Matrix Hacker Mode!)
    if (toggleUI) {
        toggleUI.addEventListener('click', () => {
            document.body.classList.toggle('matrix-theme');
            const isActive = document.body.classList.contains('matrix-theme');
            
            toggleUI.querySelector('.status-label').textContent = isActive ? "MATRIX" : "DARK";
            if (isActive) {
                toggleUI.classList.remove('muted-feature');
                // Brief sound warning feedback
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.04, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.3);
                } catch(e){}
            } else {
                toggleUI.classList.remove('muted-feature');
            }
        });
    }
}

/* ==========================================================================
   13. DETAILS DATABASE & INTERACTIVE MODAL VIEWER
   ========================================================================== */

const DETAILS_DATABASE = {
    // 4 Projects
    forecast: {
        title: "Store Demand Forecasting",
        subtitle: "Time-series models with statistical preprocessing and EDA",
        bullets: [
            "Engineered predictive time-series models (SARIMA, Prophet, Holt-Winters) forecasting store demand logs.",
            "Designed robust statistical preprocessing pipelines including anomaly detection and seasonal adjustment.",
            "Conducted extensive Exploratory Data Analysis (EDA) uncovering key operational trends for retail planning.",
            "Visualized prediction analytics with dynamic trend overlays, error margins, and confidence fields."
        ]
    },
    detector: {
        title: "AI-Generated Content Detector",
        subtitle: "Machine Learning NLP Classification Tool",
        bullets: [
            "Developed an ML text classifier utilizing TF-IDF and word embeddings to detect generative AI content.",
            "Built NLP tokenization, lemmatization, and text preprocessing pipelines for clean inputs.",
            "Trained and tuned classification models (Random Forests, Logistic Regression, XGBoost) to high accuracies.",
            "Evaluated classification profiles with rigorous F1-score auditing, confusion matrices, and ROC metrics."
        ]
    },
    lucy: {
        title: "Lucy Deep Search Algorithm",
        subtitle: "Pattern Recognition & Data Indexing Optimizer",
        bullets: [
            "Designed a high-throughput pattern recognition algorithm optimizing data indexing structures.",
            "Reduced search latencies and improved query retrieval throughput across large-scale log records.",
            "Engineered custom binary index structures and matching vectors resolving fuzzy search patterns.",
            "Integrated algorithmic complexity controls, ensuring lightweight memory footprints and fast execution."
        ]
    },
    movie: {
        title: "Movie Prediction Analytics",
        subtitle: "Regression Modeling & Trend Forecasting",
        bullets: [
            "Engineered multi-variable regression models predicting global box office revenue trends.",
            "Cleaned and preprocessed large media datasets analyzing cast strength, budgets, and seasonality.",
            "Crafted beautiful visual graphics mapping feature correlations, residuals, and prediction variances.",
            "Implemented cross-validation, regularization (Ridge, Lasso), and hyperparameter searches."
        ]
    },
    // 3 Internships
    besant: {
        title: "Data Science & AI Intern",
        subtitle: "Besant Technologies, Bangalore | Jan 2025 – Apr 2026",
        bullets: [
            "Engineered predictive models optimizing historical data processing for business forecasting.",
            "Built dynamic, interactive Power BI dashboards translating complex operational metrics into executive insights.",
            "Delivered high-accuracy visual graphs and statistical analytics ahead of schedule, improving stakeholder review cycles."
        ],
        certFile: "certificate/Amuthanilavan P  _Internship Certificate.pdf",
        certType: "pdf"
    },
    certify: {
        title: "Deep Learning Intern",
        subtitle: "Intern Certify | Aug 2024 – Present",
        bullets: [
            "Designed deep neural networks with optimized loss functions and rigorous hyperparameter tuning.",
            "Implemented computer vision, image segmentation, and pattern recognition solutions with clean pipelines.",
            "Conducted performance evaluations comparing backpropagation speeds, weight decay, and dropouts."
        ],
        certFile: "certificate/gMTdCXwDdLYoXZ3wG_ifobHAoMjQs9s6bKS_6965acc0adc800fbf21c41f8_1776432017406_completion_certificate.pdf",
        certType: "pdf"
    },
    infogro: {
        title: "Automation Testing Intern",
        subtitle: "Infogro Technology | Aug 2024 – Sep 2024",
        bullets: [
            "Developed automated test scripts using Selenium, reducing regression testing cycle times.",
            "Analyzed verification metrics in agile frameworks to detect and report software system vulnerabilities."
        ]
    },
    // 3 Course Certificates
    ibm_ds: {
        title: "Data Science Fundamentals",
        subtitle: "IBM Cloud Digilabs | Oct 2025",
        bullets: [
            "Successfully completed extensive training and evaluation in core Data Science Fundamentals.",
            "Mastered data cleaning, visual analytics, exploratory data processing, and predictive statistical pipelines.",
            "Certified and authentic credential issued through IBM Cloud Digilabs by Tech Head Raja Gopal and Director Shiva Kumar."
        ],
        certFile: "certificate/WhatsApp Image 2026-05-27 at 10.19.30 AM.jpeg",
        certType: "image"
    },
    apex_readiness: {
        title: "Advanced Professional Readiness",
        subtitle: "Apex Seekers EdTech | 2026",
        bullets: [
            "Conducted at Tagore Institute of Engineering and Technology for final year AI & DS students.",
            "Demonstrated deep alignment with advanced professional engineering systems and industry-ready standards.",
            "Validated by Apex Seekers EdTech Pvt. Ltd. and officially affiliated by RSDC."
        ],
        certFile: "certificate/WhatsApp Image 2026-05-27 at 10.18.02 AM.jpeg",
        certType: "image"
    },
    udacity: {
        title: "Tech Skills Advancement Graduate",
        subtitle: "Udacity Career Program | 2025",
        bullets: [
            "Intensive training program mastering state-of-the-art software systems and cloud logic workflows.",
            "Acquired hands-on expertise building production-ready architectures and data interfaces.",
            "Recognized by Udacity as a certified specialist equipped with advanced tech capabilities."
        ],
        certFile: "certificate/Learn the Latest Tech Skills; Advance Your Career _ Udacity (1).pdf",
        certType: "pdf"
    }
};

function initDetailsModalViewer() {
    const modal = document.getElementById('details-viewer-modal');
    const closeBtn = document.getElementById('close-details-modal');
    const footerCloseBtn = document.getElementById('btn-close-details-footer');
    const headerTitle = document.getElementById('details-modal-header-title');
    const modalBody = document.getElementById('details-modal-body-content');

    if (!modal || !closeBtn || !footerCloseBtn || !modalBody) return;

    // 1. Attach listeners to Projects cards and titles
    const projCards = document.querySelectorAll('.project-card[data-proj]');
    projCards.forEach(card => {
        const key = card.getAttribute('data-proj');
        const titleElem = card.querySelector('.project-title');
        const specBtn = card.querySelector('.btn-proj-spec');

        const triggerAction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDetails(key);
        };

        if (titleElem) titleElem.addEventListener('click', triggerAction);
        if (specBtn) specBtn.addEventListener('click', triggerAction);
        card.addEventListener('click', triggerAction);
    });

    // 2. Attach listeners to Experience cards and titles
    const expCards = document.querySelectorAll('.experience-card[data-exp]');
    expCards.forEach(card => {
        const key = card.getAttribute('data-exp');
        const titleElem = card.querySelector('.experience-title');
        const specBtn = card.querySelector('.btn-proj-spec');

        const triggerAction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDetails(key);
        };

        if (titleElem) titleElem.addEventListener('click', triggerAction);
        if (specBtn) specBtn.addEventListener('click', triggerAction);
        card.addEventListener('click', triggerAction);
    });

    // Close logic
    const dismissModal = () => {
        modal.classList.remove('show');
    };

    closeBtn.addEventListener('click', dismissModal);
    footerCloseBtn.addEventListener('click', dismissModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', dismissModal);

    function openDetails(key) {
        const record = DETAILS_DATABASE[key];
        if (!record) return;

        // Play synthetic mid-tone sweep beep sound
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(350, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch(e){}

        // Populate terminal header & typewriter bullets
        headerTitle.textContent = `SYSTEM ANALYSIS: ${record.title.toUpperCase()}`;
        
        let htmlContent = `
            <div class="details-header-block">
                <div class="details-main-title">${record.title}</div>
                <div class="details-subtitle">${record.subtitle}</div>
            </div>
            <ul class="details-bullets">
        `;

        record.bullets.forEach(bullet => {
            htmlContent += `<li class="details-bullet-item">${bullet}</li>`;
        });

        htmlContent += `</ul>`;

        // Embed certificate image or PDF iframe dynamically
        if (record.certFile) {
            htmlContent += `
                <div class="details-cert-block" style="margin-top: 25px; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 20px;">
                    <div style="font-family: 'Orbitron', sans-serif; font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); letter-spacing: 1.5px; margin-bottom: 12px; text-transform: uppercase;">
                        SECURE CREDENTIAL TRANSMISSION:
                    </div>
            `;
            if (record.certType === "image") {
                htmlContent += `
                    <div class="cert-img-container" style="position: relative; display: flex; justify-content: center; align-items: center; border-radius: 8px; overflow: hidden; border: 1px solid rgba(0, 229, 255, 0.25); background: rgba(2, 2, 8, 0.4); box-shadow: 0 0 20px rgba(0, 229, 255, 0.15);">
                        <img src="${record.certFile}" alt="Certificate for ${record.title}" style="width: 100%; max-height: 420px; object-fit: contain; display: block; border-radius: 8px;">
                    </div>
                `;
            } else if (record.certType === "pdf") {
                htmlContent += `
                    <div class="cert-pdf-container" style="position: relative; width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid rgba(0, 229, 255, 0.25); background: rgba(2, 2, 8, 0.4); box-shadow: 0 0 20px rgba(0, 229, 255, 0.15);">
                        <iframe src="${record.certFile}" width="100%" height="400px" style="border: none; display: block;"></iframe>
                    </div>
                    <div style="margin-top: 15px; text-align: center;">
                        <a href="${record.certFile}" target="_blank" class="btn-primary" style="display: inline-block; font-size: 0.75rem; padding: 8px 18px; border-radius: 20px; text-decoration: none; border: 1px solid var(--accent-cyan); color: var(--accent-cyan); background: transparent; transition: all 0.3s ease;">
                            OPEN CERTIFICATE PDF IN NEW TAB
                        </a>
                    </div>
                `;
            }
            htmlContent += `</div>`;
        }

        modalBody.innerHTML = htmlContent;
        modal.classList.add('show');
    }
}

/* ==========================================================================
   14. PERSONALITY SECTION REAL IMAGE TOGGLER
   ========================================================================== */
function initPersonalityRealImageToggle() {
    const toggleBtn = document.getElementById('btn-toggle-real');
    const avatarImg = document.querySelector('.personality-avatar-img');
    if (!toggleBtn || !avatarImg) return;

    let showingReal = false;
    const avatarSrc = "./avatar.png";
    const realSrc = "certificate/WhatsApp Image 2026-05-27 at 10.20.53 AM.jpeg";

    toggleBtn.addEventListener('click', () => {
        showingReal = !showingReal;
        
        // Play click sound using Audio Context
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.frequency.setValueAtTime(showingReal ? 800 : 600, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch(e){}

        // Smooth transition
        avatarImg.style.opacity = '0';
        setTimeout(() => {
            if (showingReal) {
                avatarImg.src = realSrc;
                toggleBtn.textContent = "SHOW AVATAR IMAGE";
                toggleBtn.style.borderColor = "var(--accent-pink)";
                toggleBtn.style.boxShadow = "0 0 15px rgba(255, 0, 127, 0.4)";
            } else {
                avatarImg.src = avatarSrc;
                toggleBtn.textContent = "SHOW REAL IMAGE";
                toggleBtn.style.borderColor = "var(--accent-cyan)";
                toggleBtn.style.boxShadow = "0 0 15px rgba(0, 229, 255, 0.3)";
            }
            avatarImg.style.opacity = '1';
        }, 250);
    });
}

