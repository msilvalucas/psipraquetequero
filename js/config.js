/**
 * CONFIGURAÇÃO OBRIGATÓRIA ANTES DE PUBLICAR
 *
 * Este é o único arquivo que precisa ser editado para o site entrar no ar.
 *
 * - leadEndpoint: endpoint POST do CRM (Make, n8n, Supabase, backend próprio).
 * - productUrls: URL real de inscrição ou WhatsApp de cada produto.
 *
 * Enquanto estiverem vazios, `assertConfig()` avisa no console e o envio do
 * lead FALHA de forma visível. O site nunca finge sucesso: um lead que não
 * chega ao CRM é um lead perdido, e o pior cenário é ninguém perceber.
 */
export const SITE_CONFIG = {
  // Web App do Google Apps Script — grava cada lead numa linha da planilha.
  leadEndpoint:
    "https://script.google.com/macros/s/AKfycbxl6EkJoNOR0WDCxaXAhmbx_hZZ68egTzu5x9I7mvQakvG2t5v1l1hsziu3NNmlfEqL/exec",
  productUrls: {
    imersao: "https://pay.kiwify.com.br/FVX8D6Q",
    // Travessia tem 3 turmas por abordagem — o quiz pede pra escolher antes de ir pro checkout.
    travessia: {
      sistemica: "https://pay.kiwify.com.br/YNBqtyp",
      psicanalise: "https://pay.kiwify.com.br/tk1I7lD",
      infancia: "https://pay.kiwify.com.br/JCsU2bf",
    },
    clinica360: "https://pay.kiwify.com.br/Bn58O9i",
    singular: "https://pay.kiwify.com.br/AJgQv38",
  },
};

export const LEAD_TIMEOUT_MS = 10_000;
export const TOTAL_QUESTIONS = 6;

/** Falha alto: um funil quebrado em silêncio é pior que um erro no console. */
export function assertConfig() {
  const missing = [];
  if (!SITE_CONFIG.leadEndpoint) missing.push("leadEndpoint");
  for (const [key, url] of Object.entries(SITE_CONFIG.productUrls)) {
    if (typeof url === "object" && url !== null) {
      for (const [trackKey, trackUrl] of Object.entries(url)) {
        if (!trackUrl) missing.push(`productUrls.${key}.${trackKey}`);
      }
    } else if (!url) {
      missing.push(`productUrls.${key}`);
    }
  }

  if (missing.length) {
    console.error(
      `[PsiPraQueTeQuero] Configuração incompleta em js/config.js: ${missing.join(", ")}. ` +
        `O site NÃO está pronto para receber tráfego real.`,
    );
  }
  return missing;
}
