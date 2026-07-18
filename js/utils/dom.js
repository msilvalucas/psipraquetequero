/** Helpers de DOM. Todos toleram seletor sem match. */

export const qs = (selector, scope = document) => scope?.querySelector(selector) ?? null;

export const qsa = (selector, scope = document) => [...(scope?.querySelectorAll(selector) ?? [])];

/** Registra um listener só se o elemento existir. Devolve o elemento (ou null). */
export function on(selector, event, handler, scope = document) {
  const el = qs(selector, scope);
  el?.addEventListener(event, handler);
  return el;
}

/** Define textContent só se o elemento existir. */
export function setText(selector, value, scope = document) {
  const el = qs(selector, scope);
  if (el) el.textContent = value;
  return el;
}
