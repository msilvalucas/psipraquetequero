/**
 * Formata um telefone brasileiro a partir dos dígitos crus.
 *
 * A versão anterior media o comprimento da string JÁ FORMATADA e cortava
 * sempre no índice 10, o que só funciona para celular. Um fixo de São Paulo
 * (`1133334444`) virava `(11) 33334-444`.
 *
 * Aqui a decisão vem da contagem de dígitos, não da string formatada:
 *   10 dígitos (fixo)    -> (11) 3333-4444
 *   11 dígitos (celular) -> (11) 99999-8888
 *
 * @param {string} raw  Valor bruto do input (pode já estar formatado).
 * @returns {string}    Valor formatado, seguro para reentrada.
 */
export function maskWhatsApp(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  const split = digits.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}
