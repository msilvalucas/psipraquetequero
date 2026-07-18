# Landing page — Clube PsiPraQueTeQuero

Site estático em HTML, CSS e JavaScript puro. Sem build, sem bundler, sem
dependências de terceiros — os módulos ES nativos dão conta nesta escala.

## Estrutura

```text
index.html
robots.txt · sitemap.xml
assets/favicon.svg

css/
  tokens.css       :root único — cores, fontes, espaçamentos, container
  base.css         reset, elementos, foco visível, movimento reduzido
  layout.css       header, menu mobile, rodapé
  components.css   .button, .accordion, .round-link
  sections.css     hero, manifesto, caminhos, decisão, sobre, FAQ, CTA final
  quiz.css         o modal inteiro
  animations.css   @keyframes e estados de reveal

js/
  main.js                    entrypoint — só orquestra
  config.js                  SITE_CONFIG (o único arquivo a editar p/ publicar)
  data/products.js           produtos, pesos e pontuação das respostas
  modules/
    header.js                scroll + menu mobile
    quiz.js                  máquina de estados do modal
    recommendation.js        lógica pura, testável
    animations.js            IntersectionObserver + parallax
  services/leads.js          envio do lead (fetch, timeout, erros)
  utils/
    dom.js                   qs, qsa, on, setText
    motion.js                prefersReducedMotion()
    phone.js                 maskWhatsApp() — puro, testável
```

Cada arquivo CSS carrega os próprios breakpoints. **Não crie um bloco de media
query solto no fim de um arquivo para "corrigir" algo** — foi assim que o CSS
anterior chegou a 12 media queries brigando por ordem de declaração, com regras
de mobile que nunca chegavam a aplicar.

## Executar localmente

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`. Precisa ser servido por HTTP —
os módulos ES não carregam via `file://`.

## Configurações obrigatórias antes de publicar

O site **não está pronto para tráfego real** enquanto estes itens estiverem pendentes.
Ele avisa no console do navegador enquanto faltar configuração.

### 1. `js/config.js` → `SITE_CONFIG`

- `leadEndpoint`: endpoint POST do CRM (Make, n8n, Supabase, backend próprio).
  Sem ele o envio do lead **falha visivelmente** — o site nunca finge sucesso, porque
  um lead que não chega ao CRM é um lead perdido.
- `productUrls`: URL real de inscrição ou WhatsApp de cada um dos quatro produtos.
  Sem URL, o CTA do resultado fica oculto em vez de apontar para lugar nenhum.

### 2. `index.html` → trocar `SEU-DOMINIO.com.br`

Aparece no `canonical`, nas tags Open Graph e no JSON-LD. Também em `robots.txt` e `sitemap.xml`.

### 3. Assets e páginas que faltam

- `assets/og-image.jpg` (1200×630). Sem ela, links compartilhados no WhatsApp e no
  Instagram — o canal de venda do negócio — aparecem sem preview.
- Página `/politica-de-privacidade`. **Obrigatória**: o quiz coleta nome, e-mail e
  telefone com consentimento LGPD explícito.
- URL real do Instagram no rodapé.

## Recomendações para produção

- Configurar domínio próprio, Analytics e eventos do quiz (hoje não há **nenhuma** medição
  de conversão: não dá para saber quantas pessoas abrem, abandonam ou concluem o diagnóstico).
- Validar os textos e critérios do algoritmo com as profissionais do Clube.
- Não armazenar dados sensíveis de saúde no quiz.
- Nenhum dado pessoal é gravado no navegador do visitante — manter assim.


## Correções v4 (auditoria pré-produção)

- **Funil de leads**: `saveLead()` não grava mais PII no `localStorage` e lança erro quando
  não há endpoint, em vez de retornar sucesso silencioso. `fetch` com timeout de 10 s.
- **Máscara de WhatsApp**: telefone fixo de 10 dígitos virava `(11) 33334-444`. Corrigido.
- **Foco visível**: os 24 cartões de resposta do quiz não tinham nenhum indicador de foco
  (WCAG 2.4.7). Adicionado, junto com um anel consistente em tudo que é operável.
- **Modal**: o fundo fica `inert` enquanto o quiz está aberto — o Tab não escapa mais.
- **FAQ**: virou `<details>`/`<summary>` nativo. `initAccordion()` deixou de existir.
- **Perguntas**: viraram `<fieldset>`/`<legend>`, associando o enunciado às alternativas.
- **Parallax**: registrava 4 listeners de `mousemove` no `window` sem cleanup. Agora é um
  handler com `requestAnimationFrame` e cleanup no `matchMedia`.
- **`prefers-reduced-motion`**: era respeitado só pelas animações de scroll. Agora cobre
  cursor glow, botões magnéticos, modal e transição entre perguntas.
- **Safari**: os 5 `backdrop-filter` não tinham `-webkit-`; o header em scroll ficava ilegível.
- **SEO**: canonical, Open Graph, Twitter Card, favicon, JSON-LD, `robots.txt`, `sitemap.xml`.

### Layout mobile quebrado (o achado mais grave)

`body { overflow-x: hidden }` escondia **253px** de overflow horizontal em telas de
390px. Por baixo dele, três seções renderizavam em duas colunas com mínimos de
300–380px dentro de um container de 362px:

| Elemento a 390px | Antes | Agora |
|---|---|---|
| `.accordion-item summary` | **26px** de largura | 362px |
| `.decision-grid` | colunas `6px 320px` | coluna única |
| `.about-grid` | colunas `380px 0px` | coluna única |
| `.result-layout` | `220px minmax(0,1fr)` | coluna única |

Causa: as regras de `@media (max-width: 760px)` existiam, mas vinham **antes** dos
`grid-template-columns` de duas colunas no arquivo. Mesma especificidade → a regra
posterior vencia, inclusive no mobile. A consolidação do CSS resolve por construção.

### Arquitetura

- **GSAP + ScrollTrigger removidos** (~116 KB de CDN de terceiro, sem SRI, no caminho
  crítico do LCP). Substituídos por `IntersectionObserver` + `@keyframes`. O `<h1>` —
  elemento de LCP — pintava invisível até o CDN responder; agora anima no primeiro frame.
- **CSS consolidado**: dois blocos `:root` viraram um; 12 media queries viraram
  breakpoints co-localizados; CSS morto (`.title-line*`) e tokens de fontes que a página
  nem carregava foram removidos; o `!important` do `.consent` saiu.
- **JS em módulos ES**: `script.js` (502 linhas, tudo num escopo) virou 10 módulos com
  responsabilidade única. `maskWhatsApp()` e `calculateRecommendation()` são funções
  puras — é por elas que os testes devem começar.

### Medidas (Fast 3G, mobile, cache frio)

LCP 1,42 s · CLS 0,020 · 336 KB em 23 requests. Overflow horizontal: 0 em todos os
breakpoints.

### Mudança visual proposital

`.button--small` estava **morto**: `.button { min-height: 54px }` do bloco v2 vinha
depois dele no arquivo e vencia por ordem. Consolidado, a classe voltou a funcionar e
o botão do header passou de 54px para 42px (header de 82px → 70px). Se o design pedia
54px, remova a classe `button--small` do botão em vez de reintroduzir a sobrescrita.


## Refinamento UX/UI v2

A segunda versão amplia o container desktop, reduz a escala tipográfica, troca a combinação de fontes por Newsreader + Manrope, compacta as seções dos produtos, reduz o excesso de movimento e adiciona uma comparação rápida dos quatro caminhos.

Consulte `UX-UI-REVIEW.md` para o diagnóstico completo e o plano de validação com usuários.

## Refinamento UX/UI v3

- Remove a seção de princípios que interrompia a narrativa entre o diagnóstico e a apresentação do Clube.
- Faz o título principal ocupar melhor a largura disponível com quebra natural e equilibrada.
- Corrige o menu mobile: camada, bloqueio de rolagem, botão em estado de fechar, foco e adaptação a redimensionamento.
- Corrige o questionário em telas pequenas: modal em `100dvh`, navegação sempre acessível, cartões mais compactos e rolagem interna segura.
