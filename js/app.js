(() => {
  const C = window.SITE_CONTENT || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const contentValue = (path) => path.split(".").reduce((value, key) => value?.[key], C);

  const COLORS = {
    red: "#e53935",
    blue: "#1e6fd9",
    green: "#2e9b4f",
    yellow: "#ffd23f",
    white: "#ffffff",
    ink: "#111111",
  };

  /* ---------------------------------------------------------
     1. Colour each letter of a heading (red, blue, green...)
     --------------------------------------------------------- */
  function colorize(el, names) {
    const text = el.textContent;
    el.textContent = "";
    let i = 0;
    for (const ch of text) {
      if (ch.trim() === "") {
        el.appendChild(document.createTextNode(ch));
        continue;
      }

      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = ch;
      span.style.setProperty("--c", COLORS[names[i % names.length]] || COLORS.ink);
      span.style.setProperty("--i", i);
      el.appendChild(span);
      i++;
    }
  }

  /* ---------------------------------------------------------
     2. Fill the page from content.js
     --------------------------------------------------------- */
  function fillContent() {
    document.title = contentValue("site.title") || document.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && contentValue("site.description")) description.content = contentValue("site.description");

    $$("[data-bind]").forEach((el) => {
      const value = C[el.dataset.bind];
      if (value != null) el.textContent = value;
    });
    $$("[data-text]").forEach((el) => {
      const value = contentValue(el.dataset.text);
      if (value != null) el.textContent = value;
    });
    $$("[data-attr]").forEach((el) => {
      el.dataset.attr.split(";").forEach((entry) => {
        const [attribute, path] = entry.split(":");
        const value = contentValue(path);
        if (attribute && value != null) el.setAttribute(attribute, value);
      });
    });

    const oc = $("#oc");
    if (C.oc) {
      oc.src = C.oc.image;
      oc.alt = C.oc.label || contentValue("ui.ocAltFallback");
    }
    if (C.pageOc) {
      $$("[data-page-oc] img").forEach((img) => {
        img.src = C.pageOc.image;
        img.alt = C.pageOc.label || "Little original character";
      });
    }

    const services = C.services || [];
    const serviceIcons = ["i-pencil", "i-frame", "i-bulb"];
    const serviceColors = ["var(--blue)", "var(--red)", "var(--green)"];
    $("#services-list").innerHTML = services
      .map(
        (s, i) => `
        <article class="note-card">
          <svg class="ico" style="color:${serviceColors[i % 3]}" aria-hidden="true">
            <use href="#${serviceIcons[i % 3]}"/>
          </svg>
          <h3 class="label-tag">${s.title}</h3>
          <p class="body">${s.text}</p>
          ${s.image ? `<img class="thumb" src="${s.image}" alt="">` : ""}
        </article>`
      )
      .join("");

    $("#projects-list").innerHTML = (C.projects || [])
      .map(
        (p) => `
        <article class="note-card project">
          <img src="${p.image}" alt="${p.title}">
          <h3 class="label-tag">${p.title}</h3>
          <p class="body">${p.description}</p>
          <a class="link" href="${p.link || "#"}">${contentValue("ui.viewProject")}
            <svg aria-hidden="true"><use href="#i-arrow"/></svg>
          </a>
        </article>`
      )
      .join("");

    $("#certs-list").innerHTML = (C.certificates || [])
      .map(
        (c) => `
        <article class="cert" style="--c:${COLORS[c.color] || COLORS.blue}">
          <svg class="rosette" aria-hidden="true"><use href="#i-rosette"/></svg>
          <h3>${c.title}</h3>
          <p>${c.issuer}</p>
          <p>${c.year}</p>
        </article>`
      )
      .join("");

    $("#contact-list").innerHTML = (C.contact || [])
      .map(
        (c) => `
        <a class="sticker" href="${c.href}" target="_blank" rel="noopener">
          <b>${c.label}</b> ${c.value}
        </a>`
      )
      .join("");
  }

  function applyColorize() {
    $$("[data-colorize]").forEach((el) => {
      colorize(el, el.dataset.colorize.split(",").map((s) => s.trim()));
    });
  }

  /* ---------------------------------------------------------
     3. Folder opening: papers scatter, then fade to white
     --------------------------------------------------------- */
  const intro = $("#intro");
  const folder = $("#folder");
  const scraps = $("#scraps");
  const flash = $("#flash");
  const site = $("#site");
  let opened = false;
  let audioContext = null;
  let musicGain = null;
  let noiseVolume = 1;
  const musicAudio = $("#site-music");
  musicAudio.volume = 0.35;
  let soundEnabled = true;
  let particlesEnabled = true;
  let setPhysicsEnabled = () => {};

  const SCRAP_KINDS = ["note", "note", "sticky", "bookmark", "photo", "star", "tape"];
  const SCRAP_COLORS = [COLORS.yellow, COLORS.blue, COLORS.red, COLORS.green, "#fffdf0"];

  function scatter() {
    const f = folder.getBoundingClientRect();
    const i0 = intro.getBoundingClientRect();
    const cx = f.left - i0.left + f.width / 2;
    const cy = f.top - i0.top + f.height * 0.45;

    for (let n = 0; n < 18; n++) {
      const el = document.createElement("div");
      const kind = SCRAP_KINDS[Math.floor(Math.random() * SCRAP_KINDS.length)];
      el.className = `scrap ${kind}`;
      el.style.setProperty("--c", SCRAP_COLORS[Math.floor(Math.random() * SCRAP_COLORS.length)]);
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      scraps.appendChild(el);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6;
      const dist = 200 + Math.random() * Math.min(340, window.innerWidth * 0.35);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 200;

      el.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)", opacity: 0 },
          { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1, offset: 0.2 },
          {
            transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1) rotate(${rot}deg)`,
            opacity: 1,
          },
        ],
        {
          duration: 900 + Math.random() * 400,
          delay: n * 40,
          easing: "cubic-bezier(.16,.9,.3,1)",
          fill: "forwards",
        }
      );
    }
  }

  function openPortfolio() {
    if (opened) return;
    opened = true;
    startAudio();
    if (audioContext && audioContext.state === "suspended") audioContext.resume();
    folder.classList.add("opening");
    folder.disabled = true;

    if (!reduceMotion) scatter();

    const wait = reduceMotion ? 0 : 1500;
    setTimeout(() => flash.classList.add("on"), wait);

    setTimeout(() => {
      intro.classList.add("gone");
      intro.hidden = true;
      site.hidden = false;
      requestAnimationFrame(() => {
        site.classList.add("show");
        initPhysics();
        initPaperTraveler();
      });
      setTimeout(() => flash.classList.remove("on"), 150);
    }, wait + 800);
  }

  function startAudio() {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContext = new AudioContext();
        musicGain = audioContext.createGain();
        musicGain.gain.value = 1;
        musicGain.connect(audioContext.destination);
      }
    }
    if (soundEnabled) {
      musicAudio.play().catch(() => {
        const soundToggle = $("#sound-toggle");
        soundToggle.textContent = "♫ click for music";
      });
    }
  }

  function playSound(kind) {
    if (!audioContext || !soundEnabled || noiseVolume <= 0) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const settings = {
      click: [330, 660, 0.16],
      drop: [220, 520, 0.22],
      open: [180, 420, 0.4],
    }[kind] || [300, 500, 0.15];
    osc.type = kind === "drop" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(settings[0], now);
    osc.frequency.exponentialRampToValueAtTime(settings[1], now + settings[2]);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08 * noiseVolume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings[2]);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + settings[2] + 0.03);
  }

  function makePaperBits(count = 8) {
    const rain = $("#paper-rain");
    if (!rain || reduceMotion || !particlesEnabled) return;
    const colors = [COLORS.yellow, COLORS.blue, COLORS.red, COLORS.green, "#ff9aa2"];
    for (let i = 0; i < count; i++) {
      const bit = document.createElement("i");
      bit.className = "paper-bit";
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
      bit.style.setProperty("--drift", `${(Math.random() - 0.5) * 180}px`);
      bit.style.setProperty("--spin", `${(Math.random() - 0.5) * 540}deg`);
      bit.style.setProperty("--fall", `${2 + Math.random() * 1.8}s`);
      bit.style.transform = `rotate(${Math.random() * 45 - 22}deg)`;
      rain.appendChild(bit);
      bit.addEventListener("animationend", () => bit.remove(), { once: true });
    }
  }

  function makeConfettiBurst(x, y, containerId = "click-confetti") {
    const confetti = $(`#${containerId}`);
    if (!confetti || reduceMotion) return;
    const colors = [COLORS.yellow, COLORS.blue, COLORS.red, COLORS.green, "#ff9aa2", "#fff"];
    for (let i = 0; i < 14; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti-bit";
      bit.style.left = `${x}px`;
      bit.style.top = `${y}px`;
      bit.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
      bit.style.setProperty("--burst-x", `${(Math.random() - 0.5) * 150}px`);
      bit.style.setProperty("--burst-y", `${(Math.random() - 0.5) * 150}px`);
      bit.style.setProperty("--burst-spin", `${(Math.random() - 0.5) * 720}deg`);
      bit.style.setProperty("--burst-duration", `${520 + Math.random() * 300}ms`);
      confetti.appendChild(bit);
      bit.addEventListener("animationend", () => bit.remove(), { once: true });
    }
  }

  function wireScrollParticles() {
    let last = 0;
    window.addEventListener("scroll", () => {
      const now = performance.now();
      if (now - last < 140) return;
      last = now;
      makePaperBits(4);
    }, { passive: true });
  }

  function initPaperTraveler() {
    const traveler = $("#paper-traveler");
    const main = $("#main");
    if (!traveler || !main || reduceMotion) return;
    const sheets = [$("#hero-paper"), ...$$(".hang", main)];
    let activeIndex = -1;
    let direction = 1;
    let jumpStarted = 0;
    let nextJumpAt = 0;
    const travelStart = 0.32;
    const travelEnd = 0.68;
    let position = travelStart;
    let jumpFrom = travelStart;
    let targetPosition = travelStart;
    let jumping = false;

    function chooseSheet() {
      const boundary = 76;
      let index = sheets.length - 1;
      for (let i = 0; i < sheets.length; i++) {
        if (sheets[i].getBoundingClientRect().top > boundary) {
          index = i;
          break;
        }
      }
      return index;
    }

    function step(time) {
      const nextIndex = chooseSheet();
      const sheet = sheets[nextIndex];
      if (!sheet) return;
      const rect = sheet.getBoundingClientRect();
      if (nextIndex !== activeIndex) {
        activeIndex = nextIndex;
        jumpStarted = time;
        position = travelStart;
        targetPosition = travelStart;
        jumping = false;
        nextJumpAt = time + 900;
        traveler.classList.remove("falling");
        void traveler.offsetWidth;
        traveler.classList.add("falling");
        setTimeout(() => traveler.classList.remove("falling"), 920);
      }

      const edgeInset = Math.min(48, Math.max(28, rect.width * 0.12));
      const left = rect.left + edgeInset;
      const right = rect.right - edgeInset;
      const elapsed = time - jumpStarted;
      if (!jumping && time >= nextJumpAt) {
        direction *= -1;
        jumpStarted = time;
        jumpFrom = position;
        targetPosition = direction > 0 ? travelEnd : travelStart;
        jumping = true;
        traveler.classList.remove("jumping");
        void traveler.offsetWidth;
        traveler.classList.add("jumping");
      } else if (jumping) {
        const jumpProgress = Math.min(1, elapsed / 900);
        const easedProgress = jumpProgress < 0.5
          ? 2 * jumpProgress * jumpProgress
          : 1 - Math.pow(-2 * jumpProgress + 2, 2) / 2;
        position = jumpFrom + (targetPosition - jumpFrom) * easedProgress;
        if (jumpProgress >= 1) {
          position = targetPosition;
          jumping = false;
          jumpStarted = time;
          nextJumpAt = time + 650;
        }
      }
      const x = left + (right - left) * position;
      const y = Math.max(62, Math.min(window.innerHeight - 20, rect.top + 10));
      traveler.style.left = `${x}px`;
      traveler.style.top = `${y}px`;
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     4. Hanging papers with physics
        Each paper swings and drops a little when you scroll,
        and two strings join it to the paper above.
     --------------------------------------------------------- */
  let physicsStarted = false;

  function initPhysics() {
    if (physicsStarted) return;
    physicsStarted = true;

    const main = $("#main");
    const svg = $("#strings");
    const heroPaper = $("#hero-paper");
    const hangs = $$(".hang", main);

    // states[0] is the hero paper (fixed). The rest hang.
    const chain = [heroPaper, ...hangs];
    const states = chain.map((el, i) => ({
      el,
      a: 0,   // swing angle (radians)
      va: 0,  // swing velocity
      d: 0,   // drop distance (px)
      vd: 0,  // drop velocity
      fixed: i === 0,
    }));

    // Position of an element inside #main, ignoring transforms
    function pos(el) {
      let x = 0, y = 0, n = el;
      while (n && n !== main) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      return { x, y };
    }

    // A point (dx, dy) measured from the paper's top-centre,
    // after it has been rotated and dropped.
    function corner(st, dx, dy) {
      const p = pos(st.el);
      const cx = p.x + st.el.offsetWidth / 2;
      const top = p.y + st.d;
      const c = Math.cos(st.a), s = Math.sin(st.a);
      return { x: cx + dx * c - dy * s, y: top + dx * s + dy * c };
    }

    function resize() {
      svg.setAttribute("width", main.offsetWidth);
      svg.setAttribute("height", main.offsetHeight);
    }

    function drawStrings() {
      let out = "";
      for (let i = 1; i < states.length; i++) {
        const prev = states[i - 1];
        const cur = states[i];
        const w = cur.el.offsetWidth;
        const hw = w / 2 - Math.min(50, w * 0.07);

        for (const side of [-1, 1]) {
          const a = corner(prev, side * hw, prev.el.offsetHeight - 4);
          const b = corner(cur, side * hw, 4);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2 + 14 + Math.abs(cur.va) * 60;
          out += `<path class="string" d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}"/>`;
          out += `<circle class="pin" cx="${a.x}" cy="${a.y}" r="5"/>`;
          out += `<circle class="pin" cx="${b.x}" cy="${b.y}" r="5"/>`;
        }
      }
      svg.innerHTML = out;
    }

    let lastY = window.scrollY;
    let speed = 0; // smoothed scroll speed (px per frame)
    let t = 0;
    let physicsEnabled = true;

    function step() {
      if (!physicsEnabled) return;
      t++;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      speed = speed * 0.82 + dy * 0.18;

      for (let i = 0; i < states.length; i++) {
        const st = states[i];
        if (st.fixed) continue;

        // Swing: scrolling pushes the paper, a spring pulls it back
        const k = 0.045;   // spring stiffness
        const c = 0.12;    // damping
        const g = 0.00028 * (1 + i * 0.08);
        st.va += -k * st.a - c * st.va + speed * g;
        st.a += st.va;
        st.a += Math.sin(t * 0.02 + i * 1.7) * 0.0006; // tiny idle sway
        st.a = Math.max(-0.14, Math.min(0.14, st.a));

        // Drop: papers sink a little as you scroll, then bounce back
        const target = Math.min(12, Math.abs(speed) * 0.45);
        st.vd += (target - st.d) * 0.06 - st.vd * 0.18;
        st.d += st.vd;
        if (st.d < 0) st.d = 0;

        st.el.style.transform = `translateY(${st.d.toFixed(2)}px) rotate(${st.a.toFixed(4)}rad)`;
      }

      drawStrings();
      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", () => { resize(); drawStrings(); });
    setPhysicsEnabled = (enabled) => {
      physicsEnabled = enabled;
      if (physicsEnabled) {
        step();
      } else {
        states.forEach((state) => {
          state.a = 0;
          state.va = 0;
          state.d = 0;
          state.vd = 0;
          if (!state.fixed) state.el.style.transform = "";
        });
        drawStrings();
      }
    };
    step();
  }

  /* ---------------------------------------------------------
     5. Interactions
     --------------------------------------------------------- */
  function wireInteractions() {
    folder.addEventListener("click", openPortfolio);
    folder.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPortfolio();
      }
    });

    const ocBtn = $("#oc-btn");
    const ocWrap = $(".hero-oc");
    const modes = ["wave", "squish", "bounce"];

    function restartMode(mode) {
      modes.forEach((name) => ocWrap.classList.remove(name));
      ocWrap.classList.remove("comic-pop");
      void ocWrap.offsetWidth;
      ocWrap.classList.add(mode);
      const burstColors = ["#ffe27a", "#91d8f7", "#ffabc7"];
      ocWrap.style.setProperty("--burst-color", burstColors[Math.floor(Math.random() * burstColors.length)]);
      ocWrap.classList.add("comic-pop");
      playSound(mode === "bounce" ? "click" : "open");
      setTimeout(() => ocWrap.classList.remove("comic-pop"), 820);
    }

    ocBtn.addEventListener("click", () => {
      restartMode(modes[Math.floor(Math.random() * modes.length)]);
    });

    $$("[data-page-oc]").forEach((ocWrap) => {
      const button = $(".page-oc-btn", ocWrap);
      button.addEventListener("click", () => {
        modes.forEach((name) => ocWrap.classList.remove(name));
        void button.offsetWidth;
        const burstColors = ["#ffe27a", "#91d8f7", "#ffabc7"];
        ocWrap.style.setProperty("--burst-color", burstColors[Math.floor(Math.random() * burstColors.length)]);
        ocWrap.classList.remove("comic-pop");
        void ocWrap.offsetWidth;
        const mode = modes[Math.floor(Math.random() * modes.length)];
        ocWrap.classList.add(mode);
        ocWrap.classList.add("comic-pop");
        playSound(mode === "bounce" ? "click" : "open");
        const modeDuration = mode === "wave" ? 1800 : mode === "squish" ? 700 : 1150;
        setTimeout(() => {
          ocWrap.classList.remove("comic-pop");
          modes.forEach((name) => ocWrap.classList.remove(name));
        }, modeDuration);
      });
    });

    site.addEventListener("click", (event) => {
      makeConfettiBurst(event.clientX, event.clientY);
    });
    intro.addEventListener("click", (event) => {
      makeConfettiBurst(event.clientX, event.clientY, "intro-confetti");
    });

    const soundToggle = $("#sound-toggle");
    soundToggle.addEventListener("click", () => {
      startAudio();
      if (!audioContext) {
        soundToggle.textContent = contentValue("ui.audioUnavailable");
        return;
      }
      if (audioContext.state === "suspended") audioContext.resume();
      const enabled = soundToggle.getAttribute("aria-pressed") !== "true";
      soundEnabled = enabled;
      soundToggle.setAttribute("aria-pressed", String(enabled));
      soundToggle.textContent = enabled ? contentValue("ui.audioOn") : contentValue("ui.audioOff");
      if (enabled) {
        startAudio();
        playSound("open");
      } else {
        musicAudio.pause();
        playSound("open");
      }
    });
    const settingsToggle = $("#settings-toggle");
    const settingsPanel = $("#settings-panel");
    settingsToggle.addEventListener("click", () => {
      const expanded = settingsToggle.getAttribute("aria-expanded") !== "true";
      settingsToggle.setAttribute("aria-expanded", String(expanded));
      settingsPanel.hidden = !expanded;
    });
    $("#bgm-volume").addEventListener("input", (event) => {
      musicAudio.volume = Number(event.target.value) / 100;
    });
    $("#particles-toggle").addEventListener("change", (event) => {
      particlesEnabled = event.target.checked;
      if (!particlesEnabled) $("#paper-rain").replaceChildren();
    });
    $("#physics-toggle").addEventListener("change", (event) => {
      setPhysicsEnabled(event.target.checked);
    });
    wireScrollParticles();
  }

  /* ---------------------------------------------------------
     Start
     --------------------------------------------------------- */
  fillContent();
  applyColorize();
  wireInteractions();
})();
