# SyncFlow

Aplicativo mobile (React Native) para cadastro de registros de **compras e vendas** com experiência **offline-first** e sincronização invisível.

O usuário usa o app sem se preocupar com conexão: tudo funciona offline, e a sincronização acontece em silêncio, sem telas técnicas, sem botões manuais, sem fricção. A interface comunica o estado da sincronização através de pequenos sinais visuais — não através de telas dedicadas.

---

## Índice

1. [Visão do Produto](#visão-do-produto)
2. [Princípios de Experiência](#princípios-de-experiência)
3. [Fluxo Completo do Usuário](#fluxo-completo-do-usuário)
4. [Como a Sincronização Aparece para o Usuário](#como-a-sincronização-aparece-para-o-usuário)
5. [Telas](#telas)
6. [Estados Especiais](#estados-especiais)
7. [Componentes Reutilizáveis](#componentes-reutilizáveis)
8. [Direção de Arte](#direção-de-arte)
9. [Identidade Visual](#identidade-visual)
10. [Microinterações](#microinterações)

---

## Visão do Produto

**SyncFlow** é um produto pensado para profissionais que precisam registrar operações de compra e venda no campo, com fotos como evidência, e que não podem depender de conexão constante.

A proposta é entregar uma experiência que:

- **Funciona instantaneamente**, mesmo sem internet
- **Sincroniza sozinha** quando a conexão volta
- **Comunica o estado** de cada registro de forma visual e discreta
- **Parece um produto SaaS premium** (referências: Notion, Stripe, Linear, Slack)

O usuário **nunca precisa pensar em sincronização**. Ele simplesmente registra, edita e visualiza. O app se encarrega do resto.

---

## Princípios de Experiência

Estes princípios guiam toda decisão de design e fluxo:

### 1. Local-first sempre
Toda ação do usuário (criar, editar, excluir) é **respondida instantaneamente** pela interface. Nada de spinners esperando o servidor. Se o app está aberto, ele responde — com ou sem internet.

### 2. Sincronização invisível
Não existe "tela de sincronização", "botão sincronizar" em destaque, ou modal "aguarde". A sincronização acontece em background e se manifesta apenas como:
- Pequenos ícones de status nos itens
- Toasts discretos quando relevante
- Um indicador sutil no header
- Um banner pequeno quando offline

### 3. Estado sempre claro
Em qualquer momento o usuário consegue saber, com um olhar:
- Se está online ou offline
- Quais registros já foram enviados ao servidor
- Quais ainda estão pendentes
- Se algum deu erro

### 4. Zero fricção
Nenhuma confirmação desnecessária. Nenhum popup técnico. Nenhuma mensagem do tipo "erro de rede, tente novamente" — o app simplesmente tenta de novo depois, sem incomodar.

### 5. Visual premium
Espaçamento generoso, tipografia hierárquica, sombras suaves, bordas arredondadas, animações curtas (150–250ms). Sensação de produto pago, não de protótipo.

---

## Fluxo Completo do Usuário

### Primeira abertura

```
Splash (1–2s) → Login → Dashboard
```

1. **Splash**: logo SyncFlow + gradiente + frase "Preparando sua experiência…"
2. **Login**: usuário entra com e-mail e senha. Token é salvo de forma segura.
3. Após login bem-sucedido, o app faz a **primeira sincronização** em background enquanto o Dashboard já é exibido com skeletons.
4. Conforme os dados chegam, os skeletons são substituídos pelo conteúdo real.

### Aberturas seguintes

```
Splash (instantâneo) → Dashboard
```

Como o token e os dados locais já existem, o app entra direto no Dashboard. A sincronização roda em background sem bloquear a interface.

### Criando um novo registro

1. Usuário toca no **FAB (botão flutuante)** "+"
2. Tela "Novo Registro" abre com animação suave de baixo para cima
3. Usuário preenche: **tipo** (Compra/Venda), **data/hora**, **descrição** e anexa **fotos**
4. Ao tocar em "Salvar":
   - **Resposta imediata**: toast "Salvo localmente" aparece e desaparece
   - A tela fecha e o registro já aparece no Dashboard com badge **"Pendente"**
5. Em background, o app:
   - Faz upload das fotos
   - Envia o registro ao servidor
   - Quando termina, a badge muda de "Pendente" para **"Sincronizado"**
   - Toast discreto: "1 registro sincronizado"

> **Importante**: se o usuário estiver offline, o passo 5 não acontece agora — ele acontece automaticamente quando a conexão voltar. O usuário **não percebe diferença** no fluxo.

### Editando um registro

1. Usuário toca em um registro na lista ou abre o detalhe
2. Toca em "Editar" → tela de edição abre
3. Altera campos → toca em "Salvar"
4. **Resposta imediata**: alteração aparece no detalhe e na lista
5. Badge volta a "Pendente" até a próxima sincronização

### Excluindo um registro

1. Usuário toca em "Excluir" (com confirmação discreta via bottom sheet)
2. **Resposta imediata**: registro some da lista
3. Em background, a deleção é propagada ao servidor

### Visualizando offline

- Toda a lista, todos os detalhes e todas as fotos **já baixadas** continuam disponíveis
- Banner discreto no topo: "Você está offline. Seus dados serão enviados automaticamente."
- Novas ações (criar/editar/excluir) continuam funcionando normalmente
- Quando a conexão volta, o banner desaparece e um toast informa: "X registros sincronizados"

---

## Como a Sincronização Aparece para o Usuário

A sincronização **nunca tem tela própria**. Ela se manifesta em quatro lugares:

### 1. Header do Dashboard (indicador global)

Um pequeno ícone ao lado da saudação que muda conforme o estado:

| Ícone | Significado |
|---|---|
| Nuvem com check verde | Tudo sincronizado |
| Nuvem com setas circulares (animadas) | Sincronizando agora |
| Nuvem com traço (linha cortada) | Offline — dados serão enviados quando voltar |
| Nuvem com alerta laranja | Alguns registros pendentes |
| Nuvem com X vermelho suave | Erro na última sincronização |

Ao tocar nesse ícone, abre um **bottom sheet** com resumo: "X sincronizados, Y pendentes, última sincronização há Z minutos" + botão discreto "Sincronizar agora".

### 2. Badge em cada item da lista

Cada registro na lista tem uma badge minúscula:

- **Sincronizado** — sem badge ou badge cinza muito sutil
- **Pendente** — badge amarelo/laranja claro, ponto + texto "Pendente"
- **Erro** — badge vermelho suave, "Erro ao enviar" (com retry automático)

### 3. Toasts discretos

Aparecem na parte inferior, somem em 2–3 segundos:

- "Salvo localmente"
- "3 registros sincronizados"
- "Conectado novamente"
- "Sem conexão — continuamos salvando localmente"

### 4. Banner offline

Apenas quando o app detecta que está offline:

- Barra fina no topo (abaixo do header), fundo neutro escuro com texto claro
- Texto: "Você está offline. Seus dados serão enviados automaticamente."
- Aparece e desaparece com fade suave

---

## Telas

### Splash / Boas-vindas

**Objetivo**: preparar o app sem deixar o usuário olhando para uma tela vazia.

**Elementos**:
- Logo SyncFlow centralizada
- Nome do app abaixo
- Fundo com gradiente sutil (azul escuro → roxo profundo)
- Loader minimalista (3 pontos pulsando ou círculo fino)
- Texto: "Preparando sua experiência…"

**Sensação**: tecnologia, velocidade, confiabilidade.

---

### Login

**Objetivo**: autenticação simples, premium, sem fricção.

**Elementos**:
- Card centralizado com sombra suave
- Logo pequena no topo
- Campo "E-mail" com ícone outline
- Campo "Senha" com ícone outline + botão olho para mostrar/ocultar
- Checkbox "Manter conectado"
- Botão primário "Entrar" (ocupa toda a largura do card)
- Link secundário discreto abaixo

**Estados**:

| Estado | Comportamento |
|---|---|
| Normal | Botão habilitado, campos limpos |
| Validando | Botão mostra spinner pequeno + texto "Entrando…" |
| Erro de credencial | Inputs ganham borda vermelha suave + texto "E-mail ou senha incorretos" abaixo |
| Sem conexão | Toast: "Sem conexão — verifique sua internet" |

**Microinterações**:
- Inputs ganham borda colorida (azul/roxo) ao receber foco
- Label flutua para cima quando o campo é preenchido
- Erro animado com pequeno shake horizontal

---

### Dashboard / Home

**Objetivo**: centro do app — visão geral + acesso rápido a tudo.

**Estrutura vertical (de cima para baixo)**:

1. **Header**
   - Avatar pequeno (toca para abrir Perfil)
   - "Olá, [Nome]" — tipografia grande e leve
   - Indicador de sincronização (ver seção anterior)

2. **Cards de resumo** (carrossel horizontal ou grid 2×2)
   - **Compras**: total de registros do tipo Compra
   - **Vendas**: total de registros do tipo Venda
   - **Pendentes**: quantos ainda não sincronizaram
   - **Sincronizados**: quantos já estão no servidor
   
   Cada card tem ícone outline, número grande, label discreto e cor sutil de destaque.

3. **Seção "Registros recentes"**
   - Título "Registros recentes" + link "Ver todos"
   - Lista de itens (ver formato abaixo)

4. **FAB (Floating Action Button)**
   - Posicionado bottom-right
   - Ícone "+" 
   - Cor primária (azul/roxo)
   - Sombra suave
   - Animação de pulse muito sutil ao ficar idle por muitos segundos

**Formato do item da lista**:

```
┌────────────────────────────────────────────────┐
│  [ícone tipo]   Compra de insumos              │
│                 22 de mai • 14h30      ● Pendente │
│                 "Material para o pedido #42…"  │
└────────────────────────────────────────────────┘
```

- Ícone à esquerda indica tipo (Compra = ícone outline de sacola; Venda = ícone outline de etiqueta)
- Título em peso médio
- Data e badge de status à direita
- Descrição truncada em 1 linha, cor secundária
- Toque rápido → abre detalhe
- Swipe lateral → revela ações rápidas (Editar / Excluir)
- Toque longo → bottom sheet com opções

---

### Novo Registro

**Objetivo**: cadastrar em segundos, sem atrito.

**Apresentação**: tela cobre 90% da altura, deslizando de baixo para cima. Bordas superiores arredondadas.

**Campos (na ordem)**:

1. **Tipo** — segmented control com duas opções: "Compra" | "Venda"
2. **Data e hora** — picker nativo com visual customizado, default = agora
3. **Descrição** — textarea com placeholder "O que aconteceu?"
4. **Fotos** — grid de upload (ver abaixo)

**Upload de fotos**:

```
┌────┬────┬────┬────┐
│ +  │ 📷 │ 📷 │ 📷 │
└────┴────┴────┴────┘
```

- Primeiro slot é o botão "Adicionar" (ícone + ou câmera outline)
- Demais slots mostram preview das fotos selecionadas
- Cada preview tem:
  - Cantinho com ícone X para remover
  - Indicador discreto se ainda não fez upload
- Toque no botão "+" abre bottom sheet: "Tirar foto" / "Escolher da galeria"
- Múltipla seleção permitida

**Rodapé fixo**:
- Botão secundário "Cancelar" (à esquerda, texto + borda)
- Botão primário "Salvar" (à direita, preenchido)

**Estados**:

| Estado | Comportamento |
|---|---|
| Vazio | Botão "Salvar" desabilitado |
| Preenchendo | Validações aparecem inline (texto pequeno abaixo do campo) |
| Salvando | Botão "Salvar" vira spinner + texto "Salvando…" — mas isso é apenas para feedback, dura milissegundos pois é local |
| Salvo | Toast "Salvo localmente" + tela fecha |

---

### Detalhe do Registro

**Objetivo**: ver tudo sobre o registro de forma elegante.

**Estrutura**:

1. **Header** com botão voltar + título "Detalhes" + menu (...)
2. **Bloco principal**:
   - Tipo (com ícone grande)
   - Data e hora
   - Badge de status grande e clara
3. **Descrição completa** (sem truncar)
4. **Galeria de fotos**
   - Grid 2 ou 3 colunas
   - Toque em uma foto abre modal fullscreen com swipe horizontal entre elas, pinch-to-zoom, e botão fechar no topo
5. **Rodapé** com dois botões:
   - "Editar" (secundário, borda)
   - "Excluir" (primário em vermelho suave — abre bottom sheet de confirmação)

---

### Edição

**Objetivo**: alterar registros existentes sem complicação.

**Estrutura**: idêntica ao "Novo Registro", mas com os campos pré-preenchidos.

**Diferença**:
- Botão de salvar é "Salvar alterações"
- No header, indicador discreto "Editando" próximo ao título
- Ao salvar, toast "Alterações salvas" + badge volta para "Pendente" até nova sincronização

**Gerenciamento de fotos**:
- Fotos antigas têm o ícone X para remover
- Pode adicionar novas com o botão "+"
- Mudanças em fotos seguem o mesmo modelo: aparecem imediatamente, sincronizam depois

---

### Perfil / Configurações

**Objetivo**: área pessoal, configurações simples.

**Estrutura**:

1. **Bloco de identidade**
   - Avatar grande (com inicial se não houver foto)
   - Nome em destaque
   - Empresa em texto secundário
   - E-mail abaixo

2. **Seção "Aparência"**
   - Toggle "Tema escuro" (com auto/claro/escuro)

3. **Seção "Sincronização"**
   - Linha "Sincronização automática" + toggle (sempre ligado por padrão)
   - Linha "Última sincronização" + horário relativo ("há 5 min")
   - Botão discreto "Sincronizar agora" (não chamativo — sincronização já é automática)

4. **Seção "Conta"**
   - Botão "Sair" (texto vermelho suave, sem fundo)

---

## Estados Especiais

### Sem internet

- Banner discreto persistente no topo do Dashboard
- Texto: "Você está offline. Seus dados serão enviados automaticamente."
- Cor de fundo: neutro escuro (em modo claro) ou neutro claro (em modo escuro), nada agressivo
- Ícone outline de nuvem cortada à esquerda
- App continua 100% funcional

### Sem registros (empty state)

- Ilustração moderna centralizada (linha fina, monocromática)
- Título grande: "Nenhum registro ainda"
- Texto secundário: "Comece criando seu primeiro registro tocando no botão +"
- Seta sutil apontando para o FAB (opcional)

### Erro inesperado

- Toast discreto com mensagem amigável
- **Nunca** mostrar stack trace, código de erro técnico ou jargão
- Exemplos: "Não foi possível salvar agora. Tentaremos novamente em instantes." | "Algo deu errado. Já estamos cuidando disso."

### Carregando (primeira vez ou ações longas)

- **Skeleton loading** em vez de spinners genéricos
- Cards e listas mostram blocos cinzas com animação shimmer suave
- O esqueleto tem o mesmo layout do conteúdo real, evitando layout shift

### Sincronizando

- Ícone de nuvem no header com animação de rotação suave (setas circulares)
- Toast quando termina: "X registros sincronizados"
- **Nunca** bloqueia a interface

---

## Componentes Reutilizáveis

Todos os componentes devem seguir a mesma identidade visual:

- **Botões** — primário (preenchido), secundário (borda), texto (sem fundo); tamanhos sm/md/lg; estados normal/hover/active/disabled/loading
- **Inputs** — texto, e-mail, senha, textarea; com label flutuante, ícones opcionais, mensagem de erro inline
- **Selects** — com bottom sheet em mobile, ícone chevron, opções com check ao selecionar
- **Cards** — com sombra suave, borda arredondada (16–20px), padding generoso
- **Modais** — centralizados, com backdrop blur sutil, fechamento por toque fora ou botão X
- **Toasts** — bottom, fundo escuro/translúcido, ícone + texto, auto-dismiss em 2.5s
- **Snackbars** — variante de toast com ação ("Desfazer", "Tentar de novo")
- **Bottom sheets** — para confirmações, ações secundárias, seleções
- **FAB** — flutuante, com sombra projetada, animação de toque
- **Status badges** — pílula pequena (cor + ícone + texto curto)
- **Upload de imagens** — grid com preview, indicador de progresso por foto

---

## Direção de Arte

### Sensação geral

Premium · Tecnológica · Moderna · Inteligente · Fluida · Corporativa · Elegante

### Princípios visuais

- **Espaçamento consistente**: múltiplos de 4 (4, 8, 12, 16, 24, 32, 48)
- **Tipografia hierárquica**: 3 a 4 níveis claros (título grande, subtítulo, corpo, secundário)
- **Sombras suaves**: baixo opacity, blur generoso — sensação de elevação delicada
- **Bordas arredondadas**: cards 16–20px, inputs e botões 12px, badges 999px (pill)
- **Cores com propósito**: cada cor tem um significado consistente em todo o app
- **Microinterações sutis**: 150–250ms, easing natural (não linear)
- **Densidade equilibrada**: nem muito vazio, nem entulhado — respiração visual

### Referências

- **Notion** — tipografia limpa, espaçamento generoso
- **Stripe** — gradientes sutis, sensação premium, microinterações
- **Linear** — organização visual, badges, indicadores de status
- **Slack** — sidebar, lista de itens, indicadores de presença
- **Trello moderno** — cards, drag-and-drop visual, cores funcionais

---

## Identidade Visual

### Paleta — Modo claro

| Token | Uso | Sugestão |
|---|---|---|
| **Primary** | Botões principais, links, foco | Azul profundo (#2D5BFF ou similar) |
| **Primary Variant** | Hover, ênfase | Roxo escuro (#5B3DF5) |
| **Background** | Fundo principal | Branco quase puro (#FAFAFB) |
| **Surface** | Cards, modais | Branco puro (#FFFFFF) |
| **Text Primary** | Títulos, conteúdo principal | Cinza muito escuro (#0F172A) |
| **Text Secondary** | Labels, secundários | Cinza médio (#64748B) |
| **Border** | Divisores, contornos | Cinza claro (#E2E8F0) |
| **Success** | Sincronizado, confirmação | Verde sóbrio (#10B981) |
| **Warning** | Pendente | Amarelo/laranja (#F59E0B) |
| **Error** | Erros | Vermelho suave (#EF4444) |

### Paleta — Modo escuro

| Token | Uso | Sugestão |
|---|---|---|
| **Primary** | Botões principais | Azul vibrante (#4D7AFF) |
| **Primary Variant** | Hover, ênfase | Roxo claro (#7C5CFF) |
| **Background** | Fundo principal | Quase preto (#0A0B14) |
| **Surface** | Cards, modais | Cinza escuro (#16182A) |
| **Text Primary** | Títulos, conteúdo | Branco quase puro (#F1F5F9) |
| **Text Secondary** | Labels, secundários | Cinza claro (#94A3B8) |
| **Border** | Divisores | Cinza escuro (#1E2138) |
| **Success** | Sincronizado | Verde claro (#34D399) |
| **Warning** | Pendente | Amarelo claro (#FBBF24) |
| **Error** | Erros | Vermelho suave (#F87171) |

### Tipografia

- **Família**: Inter, SF Pro, ou Manrope (todas modernas, geometricamente equilibradas)
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Escala**:
  - Display: 28–32px / 700
  - Title: 20–24px / 600
  - Body: 15–16px / 400
  - Small: 13–14px / 400
  - Label: 12px / 500 (geralmente uppercase com letter-spacing)

### Ícones

- Estilo **outline** (linha fina, 1.5–2px)
- Tamanho padrão 20–24px
- Bibliotecas sugeridas: Lucide, Phosphor, Tabler Icons

---

## Microinterações

Todas as microinterações devem ter duração entre **150ms e 250ms**, com easing natural (ease-out ou cubic-bezier suave). Lista das principais:

| Onde | O que acontece |
|---|---|
| Botão primário ao tocar | Pequeno scale-down (0.97) + leve mudança de cor |
| Card ao tocar | Sombra "afunda" levemente |
| FAB ao tocar | Pequeno bounce ao soltar |
| Input ao focar | Borda muda de cor com transição suave; label sobe |
| Toast aparecendo | Slide-up + fade-in |
| Toast saindo | Fade-out + slide-down sutil |
| Bottom sheet abrindo | Slide-up com inércia natural |
| Mudança de aba | Crossfade rápido |
| Skeleton loading | Shimmer horizontal lento |
| Ícone de sincronização ativo | Rotação contínua suave (não acelerada) |
| Badge "Pendente" → "Sincronizado" | Fade entre cores + check aparecendo |
| Swipe revelando ações | Acompanha o dedo com leve resistência |
| Pull-to-refresh | Loader minimalista + feedback háptico curto |

---

## Resumo do que o usuário sente

Ao usar o SyncFlow, o usuário deve sentir que:

1. **O app é rápido** — toda interação responde instantaneamente
2. **Nada se perde** — qualquer ação que ele toma fica salva, mesmo offline
3. **Não precisa pensar em sincronização** — ela simplesmente acontece
4. **A interface é bonita** — espaçamento, cores e tipografia comunicam profissionalismo
5. **Cada estado é claro** — ele sempre sabe o que está acontecendo com seus dados
6. **Tudo é coerente** — botões, cores, ícones e animações seguem o mesmo padrão em todo lugar

Esse é o produto que queremos entregar.

---

# Arquitetura Técnica

A partir daqui, o README deixa de falar do produto e passa a documentar **como o código está organizado** e **por que** ele está organizado dessa forma. Esta seção é o guia para quem vai escrever, revisar ou estender o app.

## Stack

| Camada | Tecnologia | Papel |
|---|---|---|
| Runtime | **Expo SDK 56** + React Native **0.85.3** + React **19.2.3** | Bootstrap nativo, build, OTA |
| Linguagem | **TypeScript** (modo `strict`) | Tipagem ponta-a-ponta, contratos entre camadas |
| Navegação | **@react-navigation/native** + **native-stack** | Stack tipada com `RootStackParamList` |
| Estado de UI | **Zustand** | Stores pequenos, sem boilerplate, sem Provider |
| Estado de servidor | **@tanstack/react-query** | Cache, retry, deduplicação, invalidação |
| HTTP | **Axios** (instância única) + interceptors | Normaliza erros em `AppError` |
| Persistência | **@react-native-async-storage/async-storage** | Token, preferências, cache offline |
| Gestos / SafeArea | `react-native-gesture-handler`, `react-native-safe-area-context` | Pré-requisitos nativos do Expo |
| Status bar | `expo-status-bar` | Reage ao tema (light/dark) |

> ⚠️ Expo SDK 56 introduziu mudanças importantes. **Sempre consulte os docs versionados** em https://docs.expo.dev/versions/v56.0.0/ antes de adicionar libs nativas.

---

## Visão geral da arquitetura

O projeto segue dois eixos complementares:

```
┌───────────────────────────────────────────────────────────────┐
│                         FEATURES                              │
│  (verticais, uma pasta por domínio — splash, auth, …)         │
│                                                               │
│   feature/                                                    │
│     ├── presentation/   ← View (React Native, sem regra)      │
│     ├── hooks/          ← ViewModel (estado + ações)          │
│     └── index.ts        ← barrel público da feature           │
└───────────────────────────────────────────────────────────────┘
                              │ consome
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                           CORE                                │
│  (transversal, compartilhado entre todas as features)         │
│                                                               │
│   core/                                                       │
│     ├── api/           ← httpClient + AppError                │
│     ├── config/        ← env (URL base, timeouts)             │
│     ├── navigation/    ← RootNavigator + rotas tipadas        │
│     ├── theme/         ← paletas, spacing, typography         │
│     ├── utils/         ← logger, Result<T,E>                  │
│     └── shared/                                               │
│         ├── components/  ← UI building blocks (Gap, …)        │
│         ├── hooks/       ← hooks reutilizáveis                │
│         ├── services/    ← stores Zustand, QueryProvider,     │
│         │                  AsyncStorage                       │
│         ├── repositories/← acesso a dados (Auth, …)           │
│         └── data/                                             │
│             ├── dtos/      ← contratos do servidor + mappers  │
│             └── entities/  ← modelos de domínio               │
└───────────────────────────────────────────────────────────────┘
```

**Regras de dependência:**

1. `features/*` pode importar de `core/*`.
2. `core/*` **nunca** importa de `features/*`.
3. Uma `feature` **não** importa de outra `feature`. Se precisar compartilhar, sobe para `core/shared`.
4. `presentation/` só sabe da `hooks/` da própria feature e do `core/theme`. Nunca toca em `httpClient`, `Axios`, repositórios ou DTOs diretamente.

---

## Padrão MVVM por feature

Cada feature separa três responsabilidades — **View / ViewModel / Model** — em arquivos distintos:

```
features/auth/
├── presentation/
│   └── AuthView.tsx              ← VIEW: só JSX + styles, "burra"
├── hooks/
│   └── useAuthViewModel.ts       ← VIEW MODEL: estado + ações + título/labels
└── index.ts                      ← barrel: re-exporta como AuthScreen
```

E o **Model** (regras de domínio + acesso a dados) vive em `core/shared`:

```
core/shared/
├── data/
│   ├── entities/authEntities.ts  ← MODEL de domínio (Credentials, LoginResult…)
│   └── dtos/authDto.ts           ← contrato HTTP + AuthMapper (DTO ⇄ Entity)
└── repositories/auth/
    └── AuthRepository.ts         ← orquestra httpClient + mapper + token store
```

### Por que essa separação?

| Camada | Responsabilidade | O que **não** pode |
|---|---|---|
| **View** (`*.tsx` em `presentation/`) | Renderizar JSX, ler `theme`, chamar `useXxxViewModel()` | Saber sobre HTTP, navegação imperativa complexa, regras de negócio |
| **ViewModel** (`useXxxViewModel.ts`) | Estado local da tela, ações do usuário, navegação, copy/labels, chamar repositórios | Renderizar JSX, conhecer estilos |
| **Repository** (`core/shared/repositories/`) | Falar com o `httpClient`, aplicar `AuthMapper`, devolver **Entity** ao ViewModel | Conhecer React, navegação ou tema |
| **DTO + Mapper** (`core/shared/data/dtos/`) | Espelhar o JSON do servidor; converter para Entity (camada anti-corrupção) | Vazar para a View ou ViewModel |
| **Entity** (`core/shared/data/entities/`) | Modelo limpo do domínio (`Credentials`, `LoginResult`) | Conhecer formato do servidor |

Exemplo concreto, fluxo de login:

```
AuthView.tsx
    └─ useAuthViewModel()                       (hooks/)
            └─ authRepository.signIn(creds)     (core/shared/repositories/auth/)
                    ├─ httpClient.post(...)     (core/api/)
                    ├─ setAuthToken(...)        (core/shared/services/AuthTokenStore)
                    └─ AuthMapper.loginToDomain (core/shared/data/dtos/)
                            ⇣
                       LoginResult              (core/shared/data/entities/)
```

A View só vê o que o ViewModel devolve. O ViewModel só vê a **Entity** que o repositório devolve. O contrato com o servidor (`LoginResponseDto: { access_token, user: { nome, … } }`) fica isolado dentro de `authDto.ts` — se o backend renomear `nome` para `name`, **só o mapper muda**.

---

## Navegação

Implementada em [src/core/navigation/](src/core/navigation/), com três arquivos:

| Arquivo | Papel |
|---|---|
| [RootNavigator.tsx](src/core/navigation/RootNavigator.tsx) | `NavigationContainer` + `createNativeStackNavigator` configurado com `screenOptions` derivado do tema (header e content reagem a light/dark) |
| [routes.ts](src/core/navigation/routes.ts) | `Routes` como `as const` — uma fonte única para nomes de rota, evita string mágica |
| [types.ts](src/core/navigation/types.ts) | `RootStackParamList` + `declare global { namespace ReactNavigation { interface RootParamList … }}` para **autocomplete global** em `navigation.navigate(…)` |

Por que `native-stack` (e não `stack`):
- Usa as APIs nativas (`UINavigationController` / `Fragment`), o que dá animações de transição reais do SO e melhor performance.
- Recomendado pela equipe do React Navigation para fluxos lineares (Splash → Auth → Dashboard).

Como adicionar uma nova tela:

1. Criar `src/features/<feature>/presentation/<Feature>View.tsx` + `hooks/use<Feature>ViewModel.ts`.
2. Exportar `<Feature>View as <Feature>Screen` no `index.ts` da feature.
3. Adicionar a rota em `core/navigation/routes.ts` (`Routes.Dashboard: 'Dashboard'`).
4. Adicionar o tipo de parâmetros em `core/navigation/types.ts` (`Dashboard: undefined` ou `{ id: string }`).
5. Registrar `<Stack.Screen>` em `RootNavigator.tsx`.

Tipagem de navegação dentro de um ViewModel:

```ts
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
navigation.replace(Routes.Auth); // 100% tipado, autocomplete em Routes.*
```

---

## Gerência de estado

O app usa **três stores complementares**, cada um com um propósito claro. Quando você for adicionar estado, escolha primeiro o lugar certo antes de escrever a linha.

### 1. Estado local da tela → `useState` dentro do **ViewModel**

Coisas que só existem enquanto a tela está montada (form em rascunho, "está enviando?", índice da foto atual no carrossel) ficam no hook do ViewModel. **Não promova para Zustand sem motivo.**

### 2. Estado global de UI/cliente → **Zustand** (em `core/shared/services/`)

Já existem três stores, cada um com um escopo bem definido:

| Store | Arquivo | Conteúdo |
|---|---|---|
| **AppStateStore** | [AppStateStore.ts](src/core/shared/services/AppStateStore.ts) | `isReady`, `toast` global, ações `showToast` / `dismissToast` |
| **ThemeStore** | [ThemeStore.ts](src/core/shared/services/ThemeStore.ts) | `mode: 'light' \| 'dark'`, `setMode`, `toggle` — consumido por `useTheme()` |
| **AuthTokenStore** | [AuthTokenStore.ts](src/core/shared/services/AuthTokenStore.ts) | `token`, `UserName`, `setToken`, `clearToken` — lido pelo `httpClient` via `getAuthToken()` |

Padrão de uso:

```ts
// Em qualquer componente / hook:
const mode = useThemeStore(s => s.mode);          // só re-renderiza quando mode muda
const toggle = useThemeStore(s => s.toggle);

// Fora do React (ex.: interceptor do httpClient):
const token = useAuthTokenStore.getState().token;
```

**Por que Zustand e não Context API?**
- Sem `Provider` por store → menos aninhamento.
- Selectors evitam re-renders em cascata.
- Acessível fora do React (`getState()`) — fundamental para interceptors e código não-reativo.

### 3. Estado de servidor → **React Query**

Tudo que vem do backend (lista de registros, detalhe, perfil) **não** vai para Zustand. Vai para React Query, configurado uma vez em [QueryClientProvider.tsx](src/core/shared/services/QueryClientProvider.tsx):

```ts
new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});
```

O `QueryProvider` envolve toda a árvore em [App.tsx](App.tsx). ViewModels usam `useQuery` / `useMutation` chamando os repositórios:

```ts
// dentro de hooks/useRecordsViewModel.ts
const { data, isLoading } = useQuery({
  queryKey: ['records'],
  queryFn: () => recordsRepository.list(),
});
```

**Regra prática:** se a fonte da verdade é o backend → React Query. Se é o usuário/dispositivo → Zustand. Se é só a tela → `useState`.

---

## Camada de rede

Implementada em [src/core/api/](src/core/api/). Dois arquivos centrais:

### [httpClient.ts](src/core/api/httpClient.ts)

Instância **única** do Axios, exportada como `httpClient`. Não exportamos o `axios` cru — assim ninguém consegue criar um cliente paralelo que pule os interceptors.

- **Request interceptor** (espaço reservado): onde token de auth, locale e trace IDs são injetados.
- **Response interceptor**: converte qualquer falha (timeout, sem rede, 4xx, 5xx) num `AppError` tipado. **Nenhum repositório vê `AxiosError`.**

### [AppError.ts](src/core/api/AppError.ts)

Tipo único de erro consumido por toda a aplicação:

```ts
type AppErrorKind =
  | 'network' | 'timeout' | 'unauthorized' | 'forbidden'
  | 'not_found' | 'validation' | 'server' | 'unknown';
```

Repositórios sempre fazem `throw appError;`. ViewModels podem capturar com `try/catch` ou usar o helper `Result<T, E>` em [src/core/utils/result.ts](src/core/utils/result.ts) quando o erro é esperado e faz parte do fluxo (ex.: credencial inválida).

### Configuração

URL base e timeout vivem em [src/core/config/env.ts](src/core/config/env.ts) — único lugar a editar para apontar para staging/produção.

---

## Persistência local

Wrapper fino em [AsyncStorageManager.ts](src/core/shared/services/storage/AsyncStorageManager.ts) com API tipada:

```ts
asyncStorageManager.getString(key)
asyncStorageManager.setObject<T>(key, value)
asyncStorageManager.remove(key)
asyncStorageManager.clear()
```

Centralizar aqui permite trocar a engine (ex.: para `expo-secure-store` no caso do token) sem caçar `AsyncStorage.getItem` por toda parte.

---

## Tema (design system tokens)

Em [src/core/theme/](src/core/theme/):

| Arquivo | Conteúdo |
|---|---|
| [colors.ts](src/core/theme/colors.ts) | `lightPalette` + `darkPalette`, mesmo `Palette` shape — flipar tema **só troca valores, nunca chaves** |
| [spacing.ts](src/core/theme/spacing.ts) | Escala `xs..xxxl` em múltiplos de 4 + raios (`sm`, `md`, `lg`, `pill`) |
| [typography.ts](src/core/theme/typography.ts) | `size`, `weight`, `lineHeight`, `fontFamily` |
| [index.ts](src/core/theme/index.ts) | `buildTheme`, `lightTheme`, `darkTheme` e o hook `useTheme()` |

`useTheme()` lê o `ThemeStore` via Zustand — basta `useThemeStore.getState().toggle()` para o app inteiro re-renderizar com a outra paleta. Componentes **nunca** referenciam hex literal; sempre `theme.colors.primary`, `theme.spacing.lg`, etc.

---

## Estrutura de pastas completa

```
testeCandidato/
├── App.tsx                          ← Providers raiz: GestureHandler → SafeArea → Query → AppShell
├── index.ts                         ← registerRootComponent(App)
├── app.json                         ← config Expo (nome, ícone, splash)
├── tsconfig.json                    ← extends expo/tsconfig.base + strict:true
├── package.json
├── assets/                          ← ícones e splash do app
│
└── src/
    ├── core/                                          ← código transversal (não-feature)
    │   │
    │   ├── api/                                       ← Camada HTTP
    │   │   ├── httpClient.ts                          ← instância Axios + interceptors
    │   │   ├── AppError.ts                            ← erro de domínio normalizado
    │   │   └── index.ts
    │   │
    │   ├── config/
    │   │   ├── env.ts                                 ← URL base, timeouts
    │   │   └── index.ts
    │   │
    │   ├── navigation/                                ← React Navigation
    │   │   ├── RootNavigator.tsx                      ← Stack raiz, screenOptions vindas do tema
    │   │   ├── routes.ts                              ← enum-like de nomes de rota
    │   │   ├── types.ts                               ← RootStackParamList + augment global
    │   │   └── index.ts
    │   │
    │   ├── theme/                                     ← Design tokens
    │   │   ├── colors.ts                              ← light + dark palette
    │   │   ├── spacing.ts                             ← escala + radius
    │   │   ├── typography.ts                          ← size, weight, lineHeight
    │   │   └── index.ts                               ← useTheme(), lightTheme, darkTheme
    │   │
    │   ├── utils/
    │   │   ├── logger.ts                              ← wrapper de console com níveis
    │   │   ├── result.ts                              ← Result<T, E> = Ok | Err
    │   │   └── index.ts
    │   │
    │   └── shared/                                    ← compartilhado entre features
    │       │
    │       ├── components/                            ← UI atômica reutilizável
    │       │   ├── Gap.tsx
    │       │   └── index.ts
    │       │
    │       ├── hooks/                                 ← hooks transversais (placeholder)
    │       │   └── index.ts
    │       │
    │       ├── services/                              ← stores Zustand + providers
    │       │   ├── AppStateStore.ts                   ← isReady, toast global
    │       │   ├── AuthTokenStore.ts                  ← token + userName
    │       │   ├── ThemeStore.ts                      ← mode light/dark
    │       │   ├── QueryClientProvider.tsx            ← QueryProvider (React Query)
    │       │   ├── storage/
    │       │   │   ├── AsyncStorageManager.ts         ← wrapper tipado de AsyncStorage
    │       │   │   └── index.ts
    │       │   └── index.ts
    │       │
    │       ├── repositories/                          ← acesso a dados
    │       │   ├── auth/
    │       │   │   ├── AuthRepository.ts              ← signIn, register
    │       │   │   └── index.ts
    │       │   └── index.ts
    │       │
    │       └── data/                                  ← contratos
    │           ├── entities/
    │           │   └── authEntities.ts                ← Credentials, LoginResult, …
    │           └── dtos/
    │               └── authDto.ts                     ← DTOs do servidor + AuthMapper
    │
    └── features/                                      ← uma pasta por domínio funcional
        │
        ├── splash/
        │   ├── presentation/
        │   │   ├── SplashView.tsx                     ← View pura
        │   │   └── components/
        │   │       ├── SplashBrand.tsx                ← subcomponente da feature
        │   │       └── index.ts
        │   ├── hooks/
        │   │   └── useSplashViewModel.ts              ← ViewModel: timer + navigation.replace
        │   └── index.ts                               ← exporta SplashScreen
        │
        └── auth/
            ├── presentation/
            │   └── AuthView.tsx                       ← View (login/registro)
            ├── hooks/
            │   └── useAuthViewModel.ts                ← ViewModel
            └── index.ts                               ← exporta AuthScreen
```

---

## Como adicionar uma nova feature (checklist)

Suponha que vamos adicionar a feature **Registros** (lista + detalhe + criação).

1. **Domínio** — criar entities em [core/shared/data/entities/](src/core/shared/data/entities/) (`recordEntities.ts`: `Record`, `RecordType`, `RecordStatus`).
2. **Contrato** — criar DTOs + Mapper em [core/shared/data/dtos/](src/core/shared/data/dtos/) (`recordDto.ts`).
3. **Repositório** — `core/shared/repositories/records/RecordsRepository.ts` consumindo `httpClient`.
4. **Feature** — criar `src/features/records/`:
   - `presentation/RecordsListView.tsx`
   - `hooks/useRecordsListViewModel.ts` (usa `useQuery` chamando `recordsRepository`)
   - `index.ts` exportando `RecordsListScreen`
5. **Navegação** — adicionar rota em [routes.ts](src/core/navigation/routes.ts), tipo em [types.ts](src/core/navigation/types.ts), `<Stack.Screen>` em [RootNavigator.tsx](src/core/navigation/RootNavigator.tsx).
6. **Estado global** (se necessário) — só se algo precisar ser observado fora da feature; caso contrário fica no ViewModel.

Nunca crie atalhos: `AuthView.tsx` chamando `httpClient.post(...)` direto é violação de camada e bloqueia revisão.

---

## Pontos de extensão previstos

- **Sincronização offline-first**: fila local persistida em `AsyncStorage`, drenada quando `NetInfo` reporta online. Repositórios continuam com a mesma assinatura — a fila é um detalhe interno deles.
- **Secure storage para token**: trocar `AuthTokenStore` + persistência por `expo-secure-store` sem mexer em call-sites.
- **Tema persistido**: `ThemeStore` ganha hidratação a partir do `AsyncStorageManager` no boot do Splash.
- **Observabilidade**: o [logger](src/core/utils/logger.ts) é o único ponto a substituir para mandar para Sentry/Datadog.
