/**
 * Animações. Antes: GSAP + ScrollTrigger, ~70 KB baixados de um CDN de
 * terceiro (sem SRI) e no caminho crítico do LCP. Agora: IntersectionObserver
 * para os reveals e custom properties para o que segue o ponteiro. O resto
 * é @keyframes em css/animations.css.
 *
 * Os estados iniciais escondidos dependem da classe `.js` no <html>, aplicada
 * por um inline script no <head>. Sem JS, nada some.
 */
import { qs, qsa } from "../utils/dom.js";
import { prefersReducedMotion } from "../utils/motion.js";

const PARALLAX_MIN_WIDTH = 900;

/** Reveals no scroll. Dispara uma vez por elemento e desconecta. */
function initScrollReveals() {
  const targets = [...qsa(".reveal-section"), ...qsa(".path-card")];
  if (!targets.length) return;

  // Sem suporte a IntersectionObserver, mostra tudo em vez de esconder.
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -14% 0px", threshold: 0.05 },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * Parallax dos cards em órbita.
 *
 * Antes: um `window.addEventListener("mousemove")` POR elemento (4 no total),
 * cada um disparando um tween, registrados dentro de um gsap.matchMedia() que
 * não devolvia cleanup — os listeners sobreviviam ao breakpoint.
 * Agora: um handler, coalescido em requestAnimationFrame, com cleanup.
 */
function initParallax() {
  const layers = qsa("[data-parallax]");
  if (!layers.length) return;

  const mq = window.matchMedia(`(min-width: ${PARALLAX_MIN_WIDTH}px)`);
  let frame = null;
  let pointer = { x: 0, y: 0 };
  let attached = false;

  const render = () => {
    frame = null;
    for (const layer of layers) {
      const amount = Number(layer.dataset.parallax) || 12;
      layer.style.setProperty("--px", `${pointer.x * amount}px`);
      layer.style.setProperty("--py", `${pointer.y * amount}px`);
    }
  };

  const onMove = (event) => {
    pointer = {
      x: event.clientX / window.innerWidth - 0.5,
      y: event.clientY / window.innerHeight - 0.5,
    };
    frame ??= requestAnimationFrame(render);
  };

  const detach = () => {
    if (!attached) return;
    window.removeEventListener("mousemove", onMove);
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    attached = false;
    for (const layer of layers) {
      layer.style.removeProperty("--px");
      layer.style.removeProperty("--py");
    }
  };

  const sync = () => {
    const shouldRun = mq.matches && !prefersReducedMotion();
    if (shouldRun && !attached) {
      window.addEventListener("mousemove", onMove, { passive: true });
      attached = true;
    } else if (!shouldRun) {
      detach();
    }
  };

  sync();
  mq.addEventListener("change", sync);
}

/** Botões magnéticos. O JS só escreve --mx/--my; o transform fica no CSS. */
function initMagnetic() {
  for (const element of qsa(".magnetic")) {
    let frame = null;

    element.addEventListener("mousemove", (event) => {
      if (prefersReducedMotion()) return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      frame ??= requestAnimationFrame(() => {
        frame = null;
        element.style.setProperty("--mx", `${x}px`);
        element.style.setProperty("--my", `${y}px`);
      });
    });

    element.addEventListener("mouseleave", () => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      element.style.removeProperty("--mx");
      element.style.removeProperty("--my");
    });
  }
}

/** Brilho que segue o cursor. Antes movia left/top (layout por frame); agora é transform. */
function initCursorGlow() {
  const glow = qs(".cursor-glow");
  if (!glow || window.matchMedia("(pointer: coarse)").matches) return;

  let frame = null;
  let pointer = { x: 0, y: 0 };

  const render = () => {
    frame = null;
    glow.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
    glow.style.opacity = "1";
  };

  window.addEventListener(
    "mousemove",
    (event) => {
      if (prefersReducedMotion()) return;
      pointer = { x: event.clientX, y: event.clientY };
      frame ??= requestAnimationFrame(render);
    },
    { passive: true },
  );
}

/**
 * O loop contínuo (órbita e cards flutuando) só começa depois da animação de
 * entrada terminar — senão os dois brigariam pelo mesmo transform.
 */
function settleHeroLoops() {
  if (prefersReducedMotion()) return;
  const loopers = [qs(".visual-shell"), ...qsa(".orbit-card")].filter(Boolean);
  setTimeout(() => loopers.forEach((el) => el.classList.add("is-settled")), 1300);
}

export function initAnimations() {
  initScrollReveals();
  settleHeroLoops();
  initParallax();
  initMagnetic();
  initCursorGlow();
}
