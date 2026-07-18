/**
 * Preferência de movimento reduzido.
 *
 * O bloco CSS de `prefers-reduced-motion` cobre transitions e keyframes, mas
 * não alcança o que é animado por script (parallax, botões magnéticos, o
 * cursor glow). Antes, só as animações de scroll respeitavam a preferência —
 * o resto continuava se mexendo. Esta guarda é a mesma para todos.
 */
const query = window.matchMedia("(prefers-reduced-motion: reduce)");

export const prefersReducedMotion = () => query.matches;

/** Chama `handler(reduzido)` sempre que a preferência mudar. */
export function onMotionPreferenceChange(handler) {
  query.addEventListener("change", (e) => handler(e.matches));
}
