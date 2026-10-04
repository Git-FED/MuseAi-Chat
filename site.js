(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.querySelector(".scroll-progress");
  const cursor = document.querySelector(".cursor-glow");
  const canvas = document.getElementById("particleCanvas");
  const context = canvas?.getContext("2d", { alpha: true });
  let width = 0;
  let height = 0;
  let particles = [];
  let pointer = { x: -999, y: -999 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (!canvas || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(76, Math.floor(width / 18)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + .35,
      vx: (Math.random() - .5) * .17,
      vy: (Math.random() - .5) * .17,
      a: Math.random() * .55 + .15
    }));
  }

  function drawParticles() {
    if (!context || reduced) return;
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const glow = distance < 170 ? (1 - distance / 170) * .45 : 0;
      context.beginPath();
      context.fillStyle = `rgba(116, 232, 247, ${Math.min(1, particle.a + glow)})`;
      context.arc(particle.x, particle.y, particle.r + glow * 1.5, 0, Math.PI * 2);
      context.fill();
    }
    requestAnimationFrame(drawParticles);
  }

  function updateProgress() {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: .14, rootMargin: "0px 0px -40px" });
    items.forEach((item) => observer.observe(item));
  }

  function setupTilt() {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (cursor && !reduced && window.innerWidth > 520) {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = "1";
    }
  }, { passive: true });
  resize();
  updateProgress();
  setupReveal();
  setupTilt();
  drawParticles();
})();
