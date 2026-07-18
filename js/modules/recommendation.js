/**
 * Motor de recomendação. Função pura: entra um objeto de respostas, sai um
 * ranking. Sem DOM, sem estado global — é a parte testável do quiz e a que
 * carrega a regra de negócio.
 */
import { products, weights, answerScores } from "../data/products.js";

const PRODUCT_KEYS = Object.keys(products);

/**
 * @param {Record<string,string>} answers  { professionalMoment: "student", ... }
 * @param {string|null} interest  Produto do card clicado, se houver.
 * @returns {Array<[string, number]>}  Ranking, do maior score para o menor.
 */
export function calculateRecommendation(answers = {}, interest = null) {
  const scores = Object.fromEntries(PRODUCT_KEYS.map((k) => [k, 0]));

  for (const [question, answer] of Object.entries(answers)) {
    const scoresForAnswer = answerScores[question]?.[answer];
    if (!scoresForAnswer) continue;
    const weight = weights[question] ?? 1;
    for (const [product, points] of Object.entries(scoresForAnswer)) {
      scores[product] += points * weight;
    }
  }

  // Uma intenção explícita vinda do card adiciona apenas um leve contexto,
  // sem sequestrar o diagnóstico.
  if (interest && scores[interest] !== undefined) scores[interest] += 2;

  let ranking = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // Regras de alta confiança: quando as duas respostas centrais concordam,
  // o resultado é evidente e o somatório não deve poder contrariá-lo.
  const { mainNeed, preferredExperience } = answers;
  const decisive = {
    individualDirection: ["individualMentoring", "singular"],
    specificTopic: ["oneOffMeeting", "imersao"],
    studyRoutine: ["recurringStudyGroup", "travessia"],
    completeDevelopment: ["structuredProgram", "clinica360"],
  }[mainNeed];

  if (decisive && preferredExperience === decisive[0]) {
    ranking = forceFirst(ranking, decisive[1]);
  }

  return ranking;
}

/** Move `product` para o topo do ranking, preservando o score dele. */
export function forceFirst(ranking, product) {
  const entry = ranking.find(([key]) => key === product);
  return [
    [product, entry?.[1] ?? 0],
    ...ranking.filter(([key]) => key !== product),
  ];
}

/** O segundo colocado só é mostrado quando a disputa foi apertada. */
export function isCloseCall(ranking, threshold = 8) {
  const [primary, secondary] = ranking;
  if (!primary || !secondary) return false;
  return primary[1] - secondary[1] <= threshold;
}
