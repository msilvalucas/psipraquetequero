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
    const response = await fetch(SITE_CONFIG.leadEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LeadError(`Endpoint respondeu ${response.status}.`, { kind: "server" });
    }
    return await response.json().catch(() => ({}));
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
