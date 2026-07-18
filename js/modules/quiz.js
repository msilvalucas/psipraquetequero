/** Quiz: máquina de estados do modal, do intro ao resultado. */
import { SITE_CONFIG, TOTAL_QUESTIONS } from "../config.js";
import { products } from "../data/products.js";
import { qs, qsa, on, setText } from "../utils/dom.js";
import { prefersReducedMotion } from "../utils/motion.js";
import { maskWhatsApp } from "../utils/phone.js";
import { calculateRecommendation, isCloseCall } from "./recommendation.js";
import { saveLead, messageFor } from "../services/leads.js";

const state = {
  currentQuestion: 0,
  answers: {},
  ranking: [],
  interest: null,
  lastFocusedElement: null,
};

/**
 * O modal é filho direto do <body>: marcar os irmãos como `inert` confina o
 * Tab sem focus trap manual. Antes, `aria-modal="true"` orientava o leitor de
 * tela, mas o Tab de quem enxerga escapava para a página atrás.
 */
function setBackgroundInert(isInert) {
  const modal = qs("[data-quiz-modal]");
  if (!modal) return;
  for (const child of document.body.children) {
    if (child === modal || child.tagName === "SCRIPT") continue;
    child.inert = isInert;
  }
}

// As 6 perguntas + a tela de dados formam 7 etapas até o resultado.
const progressFor = (screen) =>
  ({
    intro: 0,
    questions: ((state.currentQuestion + 1) / (TOTAL_QUESTIONS + 1)) * 100,
    lead: 90,
    result: 100,
  })[screen] ?? 0;

const labelFor = (screen) =>
  ({
    intro: "Introdução",
    questions: `Pergunta ${state.currentQuestion + 1} de ${TOTAL_QUESTIONS}`,
    lead: "Seus dados",
    result: "Resultado",
  })[screen] ?? "";

function showScreen(name) {
  qsa("[data-screen]").forEach((screen) =>
    screen.classList.toggle("is-active", screen.dataset.screen === name),
  );
  setText("[data-progress-label]", labelFor(name));

  const bar = qs("[data-progress-bar]");
  if (bar) bar.style.width = `${progressFor(name)}%`;

  qs("[data-quiz-body]")?.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function openQuiz(interest = null) {
  const modal = qs("[data-quiz-modal]");
  if (!modal) return;

  // Fecha o menu mobile, caso o quiz tenha sido aberto por ele.
  const mobileMenu = qs("[data-mobile-menu]");
  mobileMenu?.classList.remove("is-open");
  mobileMenu?.setAttribute("aria-hidden", "true");
  qs("[data-menu-button]")?.setAttribute("aria-expanded", "false");
  qs("[data-menu-button]")?.setAttribute("aria-label", "Abrir menu");
  qs("[data-header]")?.classList.remove("is-menu-open");
  document.body.classList.remove("menu-open");

  state.lastFocusedElement = document.activeElement;
  state.interest = interest;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  setBackgroundInert(true);

  showScreen("intro");
  setTimeout(() => qs("[data-start-quiz]")?.focus(), 80);
}

function closeQuiz() {
  const modal = qs("[data-quiz-modal]");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
  // O inert precisa sair ANTES do focus(): focar um elemento inert é no-op.
  setBackgroundInert(false);
  state.lastFocusedElement?.focus?.();
}

function updateQuestion() {
  const slides = qsa("[data-question]");
  const current = slides[state.currentQuestion];
  if (!current) return;

  slides.forEach((slide, index) => {
    slide.hidden = index !== state.currentQuestion;
  });

  const selected = qs("input:checked", current);
  const isLast = state.currentQuestion === slides.length - 1;

  const prev = qs("[data-prev-question]");
  if (prev) prev.disabled = state.currentQuestion === 0;

  const next = qs("[data-next-question]");
  if (next) next.disabled = !selected;

  setText("[data-next-label]", isLast ? "Ver resultado" : "Continuar");
  setText(
    "[data-quiz-hint]",
    selected
      ? "Resposta selecionada. Você pode continuar."
      : "Selecione uma alternativa para continuar.",
  );
  setText("[data-progress-label]", labelFor("questions"));

  const bar = qs("[data-progress-bar]");
  if (bar) bar.style.width = `${progressFor("questions")}%`;
}

function renderResult() {
  const [primary, secondary] = state.ranking;
  const product = products[primary?.[0]];
  if (!product) return;

  setText("[data-result-number]", product.number);
  setText("[data-result-title]", product.title);
  setText("[data-result-headline]", product.headline);
  setText("[data-result-description]", product.description);

  // createElement em vez de innerHTML: o padrão anterior era seguro só
  // porque os dados eram hardcoded. Deixa de ser na primeira API.
  const reasons = qs("[data-result-reasons]");
  reasons?.replaceChildren(
    ...product.reasons.map((reason) => {
      const span = document.createElement("span");
      span.textContent = reason;
      return span;
    }),
  );

  const cta = qs("[data-result-cta]");
  const url = SITE_CONFIG.productUrls[primary[0]];
  if (cta) {
    cta.textContent = product.cta;
    // Sem URL configurada, o CTA some em vez de fingir que leva a algum lugar.
    if (url) {
      cta.href = url;
      cta.hidden = false;
    } else {
      cta.removeAttribute("href");
      cta.hidden = true;
    }
  }

  const secondaryBox = qs("[data-secondary-result]");
  if (secondaryBox) {
    const close = isCloseCall(state.ranking);
    secondaryBox.hidden = !close;
    if (close) setText("[data-secondary-title]", products[secondary[0]].title);
  }

  showScreen("result");
}

async function handleLeadSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const error = qs("[data-form-error]");
  if (error) error.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const button = qs('button[type="submit"]', form);
  const originalLabel = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "Preparando sua recomendação...";
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    ...data,
    consent: Boolean(data.consent),
    recommendation: state.ranking[0]?.[0],
    secondaryRecommendation: state.ranking[1]?.[0],
    answers: state.answers,
    createdAt: new Date().toISOString(),
    source: "landing-page-quiz",
  };

  try {
    await saveLead(payload);
    renderResult();
  } catch (leadError) {
    console.error(leadError);
    if (error) error.textContent = messageFor(leadError);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel ?? "Ver minha recomendação";
    }
  }
}

function resetQuiz() {
  state.currentQuestion = 0;
  state.answers = {};
  state.ranking = [];
  state.interest = null;
  qs("[data-quiz-form]")?.reset();
  qs("[data-lead-form]")?.reset();
  showScreen("intro");
}

export function initQuiz() {
  qsa("[data-open-quiz]").forEach((button) =>
    button.addEventListener("click", () =>
      openQuiz(button.dataset.productInterest || null),
    ),
  );
  qsa("[data-close-quiz]").forEach((button) =>
    button.addEventListener("click", closeQuiz),
  );

  on("[data-start-quiz]", "click", () => {
    state.currentQuestion = 0;
    showScreen("questions");
    updateQuestion();
  });

  qsa("[data-question] input").forEach((input) =>
    input.addEventListener("change", () => {
      state.answers[input.name] = input.value;
      const next = qs("[data-next-question]");
      if (next) next.disabled = false;
      setText("[data-quiz-hint]", "Resposta selecionada. Você pode continuar.");
    }),
  );

  on("[data-next-question]", "click", () => {
    const slides = qsa("[data-question]");
    const selected = qs("input:checked", slides[state.currentQuestion]);
    if (!selected) return;
    state.answers[selected.name] = selected.value;

    if (state.currentQuestion < slides.length - 1) {
      state.currentQuestion += 1;
      updateQuestion();
      return;
    }

    state.ranking = calculateRecommendation(state.answers, state.interest);
    showScreen("lead");
    setTimeout(() => qs("[data-lead-form] input")?.focus(), 80);
  });

  on("[data-prev-question]", "click", () => {
    if (state.currentQuestion === 0) return;
    state.currentQuestion -= 1;
    updateQuestion();
  });

  on('input[name="whatsapp"]', "input", (event) => {
    event.target.value = maskWhatsApp(event.target.value);
  });

  on("[data-lead-form]", "submit", handleLeadSubmit);
  on("[data-restart-quiz]", "click", resetQuiz);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (qs("[data-quiz-modal]")?.classList.contains("is-open")) closeQuiz();
  });
}
