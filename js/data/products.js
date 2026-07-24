/**
 * Dados do diagnóstico. Puro conteúdo — nenhuma lógica, nenhum DOM.
 *
 * `weights` define quanto cada pergunta pesa; `answerScores` define quantos
 * pontos cada alternativa dá a cada produto. Ajustar a recomendação é
 * mexer aqui, não em recommendation.js.
 */

export const products = {
  imersao: {
    number: "01",
    title: "Imersão",
    headline:
      "Um encontro intensivo para aprofundar o tema que precisa de atenção agora.",
    description:
      "Pelas suas respostas, você está buscando resolver uma questão específica sem assumir, neste momento, o compromisso com uma formação completa.",
    reasons: ["Tema pontual", "Encontro ao vivo", "Aplicação imediata"],
    cta: "Conhecer as próximas Imersões",
  },
  travessia: {
    number: "02",
    title: "Travessia",
    headline:
      "Um percurso coletivo para transformar estudo solitário em constância e aprofundamento.",
    description:
      "Pelas suas respostas, você valoriza o aprofundamento teórico, mas deseja mais ritmo, mediação e troca durante o processo.",
    reasons: ["Rotina de estudos", "Mediação especializada", "Troca em grupo"],
    cta: "Conhecer os grupos da Travessia",
  },
  clinica360: {
    number: "03",
    title: "Clínica 360º",
    headline:
      "Uma formação estruturada para construir uma base completa para viver da clínica.",
    description:
      "Pelas suas respostas, você não está buscando resolver apenas uma dificuldade isolada. Precisa integrar competências clínicas, relacionais e estratégicas em um percurso completo.",
    reasons: ["Formação completa", "Carreira clínica", "Percurso em turma"],
    cta: "Conhecer o Clínica 360º",
  },
  singular: {
    number: "04",
    title: "Singular",
    headline:
      "Um acompanhamento individual para desafios que não cabem em soluções genéricas.",
    description:
      "Pelas suas respostas, o seu desafio está profundamente ligado ao seu momento, à sua trajetória e às decisões que precisa tomar.",
    reasons: [
      "Diagnóstico individual",
      "Plano personalizado",
      "Acompanhamento próximo",
    ],
    cta: "Conhecer o Singular",
  },
};

export const weights = {
  professionalMoment: 1,
  mainNeed: 4,
  preferredExperience: 3,
  currentSituation: 3,
  supportLevel: 2,
  availability: 1,
};

export const answerScores = {
  professionalMoment: {
    student: { imersao: 2, travessia: 3, clinica360: 1, singular: 0 },
    newlyGraduated: { imersao: 1, travessia: 1, clinica360: 4, singular: 1 },
    structuringCareer: { imersao: 1, travessia: 1, clinica360: 4, singular: 2 },
    experiencedWithSpecificChallenges: { imersao: 1, travessia: 1, clinica360: 1, singular: 4 },
  },
  mainNeed: {
    specificTopic: { imersao: 5, travessia: 0, clinica360: 1, singular: 1 },
    studyRoutine: { imersao: 0, travessia: 5, clinica360: 1, singular: 0 },
    completeDevelopment: { imersao: 0, travessia: 1, clinica360: 5, singular: 1 },
    individualDirection: { imersao: 0, travessia: 0, clinica360: 1, singular: 5 },
  },
  preferredExperience: {
    oneOffMeeting: { imersao: 5, travessia: 0, clinica360: 0, singular: 0 },
    recurringStudyGroup: { imersao: 0, travessia: 5, clinica360: 1, singular: 0 },
    structuredProgram: { imersao: 0, travessia: 1, clinica360: 5, singular: 1 },
    individualMentoring: { imersao: 0, travessia: 0, clinica360: 1, singular: 5 },
  },
  currentSituation: {
    specificQuestion: { imersao: 5, travessia: 0, clinica360: 1, singular: 1 },
    noStudyConsistency: { imersao: 0, travessia: 5, clinica360: 1, singular: 0 },
    theoryWithoutStructure: { imersao: 1, travessia: 1, clinica360: 5, singular: 1 },
    genericSolutionsDoNotWork: { imersao: 0, travessia: 0, clinica360: 1, singular: 5 },
  },
  supportLevel: {
    singleSession: { imersao: 5, travessia: 0, clinica360: 0, singular: 0 },
    mediatedGroup: { imersao: 1, travessia: 5, clinica360: 1, singular: 0 },
    completeJourney: { imersao: 0, travessia: 1, clinica360: 5, singular: 1 },
    individualAttention: { imersao: 0, travessia: 0, clinica360: 1, singular: 5 },
  },
  availability: {
    oneOff: { imersao: 5, travessia: 0, clinica360: 0, singular: 1 },
    fortnightly: { imersao: 0, travessia: 5, clinica360: 2, singular: 1 },
    fullProgram: { imersao: 0, travessia: 1, clinica360: 5, singular: 1 },
    customSchedule: { imersao: 0, travessia: 0, clinica360: 1, singular: 5 },
  },
};

/**
 * Texto de cada alternativa, igual ao que aparece nos `<label>` do
 * index.html. Usado só pra deixar o lead legível no CRM — o cálculo da
 * recomendação usa as chaves acima (`student`, `studyRoutine` etc.), nunca
 * este texto.
 */
export const answerLabels = {
  professionalMoment: {
    student: "Sou estudante de Psicologia.",
    newlyGraduated: "Sou recém-formado e estou iniciando os atendimentos.",
    structuringCareer: "Já atuo, mas preciso estruturar melhor minha carreira.",
    experiencedWithSpecificChallenges: "Já tenho trajetória e enfrento desafios específicos.",
  },
  mainNeed: {
    specificTopic: "Aprofundar um tema específico.",
    studyRoutine: "Criar uma rotina consistente de leitura e estudo.",
    completeDevelopment: "Desenvolver diferentes competências para construir minha clínica.",
    individualDirection: "Receber orientação para um desafio particular.",
  },
  preferredExperience: {
    oneOffMeeting: "Um encontro pontual e intensivo.",
    recurringStudyGroup: "Um grupo recorrente de estudos e troca.",
    structuredProgram: "Uma formação estruturada com começo, meio e fim.",
    individualMentoring: "Um acompanhamento individual e personalizado.",
  },
  currentSituation: {
    specificQuestion: "Existe um assunto que preciso entender melhor.",
    noStudyConsistency: "Tenho dificuldade para manter constância nos estudos.",
    theoryWithoutStructure: "Conheço a teoria, mas ainda não estruturei minha carreira.",
    genericSolutionsDoNotWork: "Meu problema é particular e soluções genéricas não funcionam.",
  },
  supportLevel: {
    singleSession: "Orientação concentrada em um único encontro.",
    mediatedGroup: "Mediação profissional dentro de um grupo.",
    completeJourney: "Um percurso completo de desenvolvimento em turma.",
    individualAttention: "Atenção individual voltada à minha realidade.",
  },
  availability: {
    oneOff: "Uma atividade pontual.",
    fortnightly: "Encontros quinzenais contínuos.",
    fullProgram: "Compromisso com uma formação completa.",
    customSchedule: "Uma agenda de acompanhamento individual.",
  },
};
