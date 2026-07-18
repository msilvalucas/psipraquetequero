/** Header: estado de scroll e menu mobile. */
import { qs, qsa } from "../utils/dom.js";

const DESKTOP_BREAKPOINT = 1050;

export function initHeader() {
  const header = qs("[data-header]");
  const menuButton = qs("[data-menu-button]");
  const menu = qs("[data-mobile-menu]");

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menu || !menuButton) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    header?.classList.remove("is-menu-open");
    document.body.classList.remove("menu-open", "is-locked");
    if (restoreFocus) menuButton.focus();
  };

  const openMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Fechar menu");
    header?.classList.add("is-menu-open");
    document.body.classList.add("menu-open", "is-locked");
    setTimeout(() => qs("a, button", menu)?.focus(), 50);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuButton?.addEventListener("click", () => {
    if (menu?.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  qsa("a, button", menu).forEach((item) =>
    item.addEventListener("click", () => closeMenu()),
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.classList.contains("is-open")) {
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > DESKTOP_BREAKPOINT && menu?.classList.contains("is-open")) {
      closeMenu();
    }
  });

  return { closeMenu };
}
