# Revisão UX/UI — PsiPraQueTeQuero

## Diagnóstico da versão anterior

A versão inicial tinha boa direção de arte, mas estava excessivamente orientada a impacto visual. Os principais problemas eram:

1. **Escala tipográfica muito agressiva** — títulos chegavam a 8–10rem e dominavam o conteúdo.
2. **Largura desperdiçada** — abaixo de 1050px, o container era limitado a 920px, mesmo em telas com espaço disponível.
3. **Rolagem longa para comparar produtos** — cada produto ocupava aproximadamente uma viewport completa.
4. **Ausência de visão geral imediata** — o usuário precisava percorrer os quatro blocos para compreender as diferenças.
5. **Movimento acima do necessário** — animações com scrub e deslocamentos amplos competiam com a leitura.
6. **Fonte display pesada** — DM Serif Display reforçava a sensação de títulos grandes e pouco espaço.

## Princípios adotados

### Não me faça pensar — Steve Krug

A interface deve tornar evidente onde o usuário está, quais opções existem e qual ação deve realizar. A página agora apresenta uma visão resumida dos quatro caminhos antes de aprofundá-los.

### Refactoring UI — Adam Wathan e Steve Schoger

A hierarquia passou a depender menos de tamanhos extremos e mais de contraste, agrupamento, espaçamento e peso tipográfico.

### Laws of UX — Jon Yablonski

As quatro opções foram organizadas em blocos curtos e comparáveis. O questionário mantém a apresentação progressiva, com uma decisão por etapa, reduzindo carga cognitiva.

### The Design of Everyday Things — Don Norman

Cards clicáveis agora possuem sinais mais claros de interação, estados de hover e navegação direta até o produto correspondente.

### Rocket Surgery Made Easy — Steve Krug

A próxima etapa recomendada não é adicionar mais design: é testar a página com usuários reais e observar onde eles hesitam.

## Alterações aplicadas

### Sistema tipográfico

- Substituição de **DM Serif Display + DM Sans** por **Newsreader + Manrope**.
- Redução dos títulos principais e dos títulos dos produtos.
- Aumento moderado de line-height em textos longos.
- Limites de largura para preservar legibilidade.
- Escala mobile reduzida para evitar que o título ocupe quase toda a primeira tela.

### Uso da largura

- Container desktop ampliado de 1180px para 1380px.
- Novo comportamento intermediário em 1180px e 1050px.
- Colunas mais equilibradas no hero, manifesto, produtos, seção institucional e FAQ.
- Cards laterais dos produtos deixam de ficar excessivamente estreitos.

### Comparação dos produtos

Foi adicionada uma navegação visual com os quatro produtos:

- Imersão — tema pontual.
- Travessia — constância nos estudos.
- Clínica 360º — estruturação da carreira.
- Singular — direção individual.

Cada card leva diretamente para a explicação detalhada do produto.

### Densidade e ritmo

- Produtos deixam de ocupar 100% da altura da tela.
- Altura aproximada de cada seção reduzida para cerca de 520–720px, conforme o conteúdo.
- Espaçamentos verticais padronizados com variável responsiva.
- Seções secundárias ficaram mais compactas.

### Movimento

- Animações dos produtos deixaram de acompanhar o scroll com scrub.
- Entrada ocorre apenas uma vez, com menor deslocamento.
- Rotação e flutuação do hero ficaram mais lentas e discretas.
- `prefers-reduced-motion` continua respeitado.

## O que ainda precisa ser validado

### Teste de cinco segundos

Mostre o hero por cinco segundos e pergunte:

1. Para quem é este site?
2. O que ele oferece?
3. Qual ação você faria agora?

A maioria precisa responder algo próximo de:

> É um clube de desenvolvimento para profissionais de Psicologia, com quatro formatos, e posso fazer um diagnóstico para escolher.

### Teste de escolha

Peça para três a cinco psicólogas encontrarem o produto correto nos seguintes cenários:

- Quero apenas aprender sobre um tema específico.
- Quero voltar a estudar com constância.
- Estou iniciando na clínica e preciso de uma formação completa.
- Já atuo e preciso resolver um problema particular.

Observe se usam os cards de visão geral, os blocos completos ou o questionário.

### Métricas mínimas

- Clique no CTA principal do hero.
- Início do questionário.
- Conclusão do questionário.
- Abandono por pergunta.
- Produto recomendado.
- Clique no CTA final do resultado.
- Conversão por origem do tráfego.

## Próxima prioridade

A próxima melhoria de maior impacto não é visual. É inserir:

- Fotos reais das profissionais.
- Depoimentos específicos.
- Datas, duração e formato de cada produto.
- Próxima turma ou disponibilidade.
- Preço ou faixa de investimento, quando estrategicamente viável.

Sem prova, especificidade e disponibilidade, um layout premium melhora percepção, mas não resolve sozinho a conversão.
