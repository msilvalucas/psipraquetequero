/**
 * Entrypoint. Só orquestra — nenhuma lógica mora aqui.
 *
 * Módulos ES nativos, sem bundler: nessa escala o custo de manutenção de um
 * build não se paga, e o navegador resolve o grafo de imports sozinho.
 */
import { assertConfig } from "./config.js";
import { qs } from "./utils/dom.js";
import { initHeader } from "./modules/header.js";
import { initQuiz } from "./modules/quiz.js";
import { initAnimations } from "./modules/animations.js";

function initMisc() {
  const year = qs("[data-current-year]");
  if (year) year.textContent = new Date().getFullYear();
}

function boot() {
  assertConfig();
  initHeader();
  initQuiz();
  initAnimations();
  initMisc();
}

// type="module" já é adiado, mas readyState pode ser "interactive" ou "complete"
// dependendo do cache — checar evita um boot que nunca acontece.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
