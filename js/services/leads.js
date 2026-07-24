/**
 * Envio do lead.
 *
 * A versão anterior gravava nome, e-mail, telefone e todas as respostas dos
 * últimos 30 visitantes no `localStorage` do dispositivo — dado pessoal, sem
 * criptografia, sem prazo, com um checkbox de consentimento LGPD na mesma
 * tela. Isso saiu inteiro.
 *
 * E, sem endpoint, ela retornava `{ localOnly: true }`, que o formulário
 * tratava como sucesso: o visitante via a tela de resultado achando que seria
 * contatado, e o lead nunca saía do navegador. Agora lança.
 */
import { SITE_CONFIG, LEAD_TIMEOUT_MS } from "../config.js";

export class LeadError extends Error {
  constructor(message, { kind = "network" } = {}) {
    super(message);
    this.name = "LeadError";
    this.kind = kind; // "config" | "timeout" | "network" | "server"
  }
}

/**
 * @param {object} payload
 * @returns {Promise<object>}
 * @throws {LeadError}
 */
export async function saveLead(payload) {
  if (!SITE_CONFIG.leadEndpoint) {
    throw new LeadError("leadEndpoint não configurado em js/config.js.", { kind: "config" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LEAD_TIMEOUT_MS);

  try {
    // text/plain em vez de application/json: o Web App do Google Apps Script
    // não trata o preflight OPTIONS do CORS. text/plain é "simple request" e
    // não dispara preflight — o corpo continua sendo JSON, e o doPost() do
    // script faz JSON.parse(e.postData.contents) normalmente.
    const response = await fetch(SITE_CONFIG.leadEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LeadError(`Endpoint respondeu ${response.status}.`, { kind: "server" });
    }

    const result = await response.json().catch(() => ({}));
    // O Apps Script sempre responde 200, mesmo em erro — o status real vem
    // no corpo (ver doPost() -> jsonResponse() no script da planilha).
    if (result.status === "error") {
      throw new LeadError(result.message || "O CRM recusou o cadastro.", { kind: "server" });
    }
    return result;
  } catch (error) {
    if (error instanceof LeadError) throw error;
    if (error.name === "AbortError") {
      throw new LeadError("O envio excedeu o tempo limite.", { kind: "timeout" });
    }
    throw new LeadError("Falha de rede ao enviar o lead.", { kind: "network" });
  } finally {
    clearTimeout(timeout);
  }
}

/** Mensagem para o usuário. Distingue timeout de falha de rede — antes era tudo "confira sua conexão". */
export function messageFor(error) {
  switch (error?.kind) {
    case "timeout":
      return "O envio demorou mais que o esperado. Tente novamente em instantes.";
    case "config":
    case "server":
      return "Tivemos um problema ao registrar seus dados. Tente novamente em instantes.";
    default:
      return "Não conseguimos enviar seus dados agora. Confira sua conexão e tente novamente.";
  }
}
