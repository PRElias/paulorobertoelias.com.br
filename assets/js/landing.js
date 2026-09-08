const root = document.documentElement;
const aura = document.querySelector(".cursor-aura");
const canvas = document.querySelector(".particle-field");
const ctx = canvas.getContext("2d");
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let particles = [];
let rafId = null;

function setPointerPosition(event) {
  root.style.setProperty("--x", `${event.clientX}px`);
  root.style.setProperty("--y", `${event.clientY}px`);
  if (aura) aura.style.opacity = "1";
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(88, Math.max(38, Math.floor(window.innerWidth / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - .5) * .28,
    vy: (Math.random() - .5) * .28,
    r: Math.random() * 1.7 + .5,
    hue: Math.random() > .65 ? 18 : 184
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${particle.hue}, 88%, 64%, .72)`;
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 125) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(70, 215, 220, ${.16 * (1 - distance / 125)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  rafId = requestAnimationFrame(drawParticles);
}

function startParticles() {
  if (mediaQuery.matches) return;
  resizeCanvas();
  cancelAnimationFrame(rafId);
  drawParticles();
}

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: .15 });

document.querySelectorAll("[data-reveal]").forEach((element) => {
  revealObserver.observe(element);
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - .5) * -8;
    const rotateY = ((x / rect.width) - .5) * 8;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

window.addEventListener("pointermove", setPointerPosition, { passive: true });
window.addEventListener("resize", startParticles);
mediaQuery.addEventListener("change", () => {
  if (mediaQuery.matches) {
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  } else {
    startParticles();
  }
});

startParticles();
