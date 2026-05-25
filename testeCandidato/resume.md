# SyncFlow — Resumo do Aplicativo

Este documento explica, de forma visual e sem muito jargão técnico, **como o aplicativo funciona por dentro**: o caminho que o usuário percorre, como o app conversa com o servidor (backend) e o que cada parte (feature) faz.

---

## Parte 1 — O Fluxo do Aplicativo

### Visão de cima

O SyncFlow é um app de registros de **compras e vendas** com fotos. Ele foi pensado para funcionar **mesmo sem internet**: tudo o que o usuário faz é salvo na hora no celular e, quando a conexão volta, o app envia para o servidor sozinho, em silêncio.

A grande sacada é simples:

> **O celular é a fonte da verdade enquanto o usuário usa. O servidor é só o lugar onde tudo se encontra depois.**

---

### O caminho que o usuário percorre

```
   ┌─────────┐
   │ SPLASH  │  Tela inicial (carregando)
   └────┬────┘
        │  decide o que fazer:
        │  • Tem token salvo?  → vai pra Home
        │  • Não tem?          → vai pro Login
        ▼
   ┌─────────┐                ┌─────────┐
   │  AUTH   │ ─── login ──► │  HOME   │ ◄──────────┐
   └─────────┘                └────┬────┘            │
                                   │                 │
                  ┌────────────────┼─────────────┐   │
                  ▼                ▼             ▼   │
            ┌──────────┐    ┌──────────┐  ┌─────────┐
            │ REGISTRO │    │ REGISTRO │  │ PROFILE │
            │   LIST   │    │   FORM   │  │         │
            └────┬─────┘    └────┬─────┘  └────┬────┘
                 │               │             │
                 ▼               │             │
            ┌──────────┐         │             │
            │ REGISTRO │ ◄───────┘             │
            │  DETAIL  │                       │
            └──────────┘                       │
                                               │
                                       logout ─┘
                                               │
                                               ▼
                                          (volta pro AUTH)
```

**Em palavras:**

1. **Splash** — Tela de "boas-vindas" que aparece por uns segundos. Enquanto o usuário vê o logo, o app faz três coisas:
   - Lê do armazenamento do celular se já existe um token de login salvo
   - Lê as preferências do usuário (tema escuro, idioma, sincronização automática)
   - Começa a "escutar" se o celular tem internet ou não
   - Decide: se tem login → vai pra **Home**. Se não tem → vai pro **Login**.

2. **Auth (Login)** — Usuário coloca e-mail e senha. O app pergunta ao servidor "esse cara é mesmo quem diz ser?". Se sim, recebe um token (um crachá digital) e guarda no celular. Pronto, está logado.

3. **Home (Dashboard)** — É o coração do app. Mostra:
   - Saudação com o nome
   - Quantos registros existem, quantos estão pendentes, quantos já foram pro servidor
   - Lista dos registros mais recentes
   - Status da sincronização (online/offline)
   - Botões para criar novo registro, ver tudo, ir pro perfil

4. **Registros (Lista, Formulário, Detalhe)** — É onde o trabalho acontece:
   - **Lista**: mostra todos os registros, com filtros (pendente, sincronizado, compra, venda)
   - **Formulário**: cria um novo ou edita um existente (tipo, data, descrição, fotos)
   - **Detalhe**: abre um registro pra ver tudo, com opção de editar ou excluir

5. **Profile (Perfil)** — Configurações do usuário: tema, idioma, sincronização, logout.

---

### Como o app conversa com o servidor (backend)

Essa é a parte mais interessante. O app **não fala com o servidor o tempo todo**. Ele guarda tudo no celular e, de tempos em tempos (ou quando o usuário faz alguma coisa importante), faz uma "conversa rápida" pra trocar novidades.

#### O banco de dados no celular

O aplicativo tem um **mini banco de dados dentro do celular** (chamado WatermelonDB, que usa SQLite por baixo). Esse banco guarda quatro coisas:

- **Empresas** — a empresa do usuário
- **Usuários** — os usuários cadastrados
- **Registros** — os registros de compra/venda
- **Fotos dos registros** — as fotos vinculadas a cada registro

Toda vez que o usuário cria, edita ou apaga algo, **isso vai pro banco do celular primeiro**. A tela responde na hora. Em paralelo, o app marca esse registro como "ainda não enviado" (pendente).

#### O motor de sincronização

Existe uma peça do app chamada **Sync Engine** (motor de sincronização). É como um carteiro silencioso que faz três coisas:

```
       ┌──────────────────────────────────────────┐
       │            MOTOR DE SINC                 │
       │                                          │
       │  1️⃣  Liga quando o app abre              │
       │  2️⃣  Liga quando volta a internet        │
       │  3️⃣  Liga quando o usuário salva algo   │
       │      (e está online)                     │
       └──────────────────┬───────────────────────┘
                          │
                          ▼
       ┌──────────────────────────────────────────┐
       │  Passo A — Manda as fotos                │
       │  (são arquivos pesados, vão separadas)   │
       │                                          │
       │  Passo B — Manda as mudanças             │
       │  (tudo que o usuário criou/editou/apagou)│
       │                                          │
       │  Passo C — Pega as novidades             │
       │  (o que outras pessoas mudaram)          │
       └──────────────────────────────────────────┘
```

#### Fluxo visual da sincronização

```
   CELULAR                                      SERVIDOR
   ─────────                                    ─────────

   Usuário cria registro
   "Compra de pneus"
        │
        ▼
   Salva no banco local
   marca como PENDENTE  ──┐
        │                 │
        ▼                 │  (sem internet por enquanto,
   Tela mostra registro   │   nada vai pro servidor)
   com etiqueta "Pendente"│
                          │
   ... usuário continua usando o app ...
                          │
   Internet volta!        │
        │                 │
        ▼                 │
   Sync Engine acorda     │
        │                 ▼
        ├─► Upload das fotos ──────────────────► /fotos/registro/:id
        │                                       (recebe arquivo, devolve URL)
        │                                            │
        │   ◄─────────────────────────────────────── │
        │                                            
        ├─► Envia mudanças ────────────────────► /sync/push
        │   (criou X, editou Y, apagou Z)            │
        │                                            │
        │   ◄─────────────────────────────────────── │
        │                                            
        └─► Pede novidades ────────────────────► /sync/pull
                                                (manda só o que mudou
            ◄─────────────────────────────────── desde a última vez)
        │
        ▼
   Marca registros como SINCRONIZADO
        │
        ▼
   Etiqueta "Pendente" desaparece
   Toast: "1 registro sincronizado"
```

#### Os endereços que o app chama no servidor

| Endereço (rota) | Para que serve |
|---|---|
| `POST /auth/signin` | Login (envia e-mail/senha, recebe token) |
| `GET /auth/me` | Confirma se o token ainda é válido (renovar sessão) |
| `POST /fotos/registro/:id` | Sobe um arquivo de foto |
| `POST /sync/push` | Envia as mudanças locais pro servidor |
| `GET /sync/pull` | Baixa as novidades do servidor |

Toda chamada leva junto o **token de login** no cabeçalho (como se fosse um crachá que precisa ser apresentado em toda porta).

#### O que o usuário vê durante tudo isso

O usuário **não vê tela de carregamento, não aperta botão "sincronizar agora", não espera nada**. Ele só percebe:

- Um pequeno ícone de nuvem no topo (que muda de cor conforme o estado: tudo certo, sincronizando, offline, com erro)
- Uma etiqueta sutil em cada registro pendente
- Um toast discreto quando a sincronização termina

Se quiser forçar uma sincronização, há um botão no perfil — mas é opcional.

---

## Parte 2 — As Features (o que cada parte faz)

### 1. Splash (a tela de abertura)

**O que o usuário vê:** Logo do SyncFlow numa tela bonita por uns 600 milissegundos.

**O que acontece por trás:**
- Conecta com o observador de internet (pra saber se está online)
- Carrega o token salvo, as preferências e a data da última sincronização
- Se tem token e tem internet, pergunta ao servidor "esse token ainda vale?" (em segundo plano, sem travar)
- Decide pra onde mandar o usuário (Login ou Home)

**Por que existe:** dar um respiro pro app se preparar sem mostrar tela vazia ou piscadas.

---

### 2. Auth (Login)

**O que o usuário vê:** Tela de login com campos de e-mail e senha.

**O que acontece por trás:**
- Usuário digita credenciais e aperta "Entrar"
- O app manda os dados pro servidor
- Se der certo, recebe um token e os dados do usuário (nome, e-mail, empresa)
- Guarda tudo no celular
- Manda o usuário pra Home

**Erros que pode mostrar:**
- "E-mail ou senha incorretos" (inline, com borda vermelha)
- Toast "Sem conexão" se estiver offline

---

### 3. Home (Dashboard)

**O que o usuário vê:**
- Cabeçalho com saudação e ícone de status de sincronização
- 4 cards com números: Compras, Vendas, Pendentes, Sincronizados
- Lista de registros recentes
- Banner discreto se estiver offline
- Botão flutuante "+" pra criar registro novo
- Barra inferior pra navegar pra Profile

**O que acontece por trás:**
- Liga o motor de sincronização (que faz a primeira sincronização automaticamente)
- "Escuta" o banco de dados local: toda vez que algo muda lá, a lista atualiza sozinha
- Calcula os números dos cards a partir do banco local
- Quando registros saem de "pendente" pra "sincronizado", mostra toast
- Se o servidor responder "seu token expirou", desloga o usuário automaticamente

**Por que é especial:** esta tela é "reativa". Não precisa apertar refresh — qualquer mudança no banco aparece na hora.

---

### 4. Registros — Lista

**O que o usuário vê:** Todos os registros em formato de cards, com filtros no topo (Todos / Pendentes / Sincronizados / Compras / Vendas) e campo de busca.

**O que acontece por trás:**
- Lê do banco local (não conversa com servidor)
- Filtra na hora, sem requisição nenhuma
- Mostra contadores ao lado de cada filtro

---

### 5. Registros — Formulário (criar/editar)

**O que o usuário vê:** Tela que sobe de baixo pra cima com:
- Botões "Compra" ou "Venda"
- Seletor de data e hora (já vem com a hora atual)
- Campo de descrição (mínimo 10 caracteres)
- Grid pra adicionar fotos (câmera ou galeria)
- Botões "Cancelar" e "Salvar"

**O que acontece por trás (criação):**
1. Usuário aperta "Salvar"
2. Registro é salvo no banco local na hora
3. WatermelonDB marca como "criado, ainda não foi pro servidor"
4. Se tem internet → dispara sincronização na hora (envia fotos + mudanças)
5. Toast: "Salvo e sincronizado" (online) ou "Salvo localmente" (offline)
6. Tela fecha, registro aparece na Home

**O que acontece por trás (edição):**
- Carrega o registro do banco local pra preencher os campos
- Permite adicionar fotos novas e remover antigas
- Ao salvar, marca como "editado, precisa subir"
- Mesma lógica de sincronização

---

### 6. Registros — Detalhe

**O que o usuário vê:** Página completa de um registro: tipo, data, descrição inteira, galeria de fotos (com zoom), botões "Editar" e "Excluir".

**O que acontece por trás:**
- Busca o registro pelo ID no banco local
- Quando o usuário volta dessa tela do formulário, ela recarrega pra mostrar as alterações
- "Excluir" mostra alerta de confirmação; se confirmado, marca o registro como "apagado" no banco e sincroniza

---

### 7. Profile (Perfil)

**O que o usuário vê:**
- Avatar grande com inicial do nome
- Nome, papel, empresa, e-mail
- Seção de Sincronização (status, hora da última, toggle "auto-sync", botão "sincronizar agora")
- Botão "Logout"

**O que acontece por trás:**
- Lê os dados do usuário guardados no celular
- Toggles salvam direto nas preferências (que ficam guardadas mesmo fechando o app)
- "Sincronizar agora" dispara o motor de sincronização manualmente
- "Logout" apaga o banco local inteiro + apaga o token e manda pro Login

---

### 8. Sync (o motor invisível)

Essa não é uma tela — é o **motor** que faz tudo acontecer nos bastidores. Ele tem cinco estados:

| Estado | O que significa |
|---|---|
| `idle` | Parado, sem fazer nada |
| `syncing` | Sincronizando agora |
| `success` | Última sincronização deu certo |
| `error` | Última sincronização deu erro |
| `offline` | Tentou sincronizar, mas sem internet |
| `unauthorized` | Token expirou (vai disparar logout automático) |

Ele liga sozinho em três momentos:
1. Quando o app abre (se estiver online)
2. Quando a internet volta depois de estar offline
3. Quando o usuário salva, edita ou apaga um registro (se estiver online)

---

## Parte 3 — As "caixinhas" que guardam o estado do app

O app tem algumas "caixinhas" pequenas que guardam informações compartilhadas entre todas as telas. Pense nelas como gavetas de uma cômoda:

| Caixinha | O que guarda |
|---|---|
| **AuthTokenStore** | Token de login + dados do usuário |
| **NetworkStore** | Se o celular tá online ou não |
| **SyncMetaStore** | Data da última sincronização bem-sucedida |
| **PreferencesStore** | Idioma, tema escuro, auto-sync |
| **ThemeStore** | Modo claro ou escuro |
| **AppStateStore** | Mensagens toast que aparecem na tela |

Essas caixinhas ficam atualizadas no banco do celular também, então mesmo fechando o app, na próxima vez que abrir tudo está lá.

---

## Resumo em uma frase

> **O usuário usa o app sem perceber que existe um servidor. Tudo é rápido, tudo fica salvo, tudo aparece na hora — e quando a internet volta, o app cuida sozinho de mandar pra nuvem o que ficou pendente.**

Essa é a essência do SyncFlow.
