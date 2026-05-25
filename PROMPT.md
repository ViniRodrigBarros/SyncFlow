# Teste Candidato Aplicativo — Frontend (React Native + WatermelonDB)

> **Prompt-spec** consolidado para guiar o desenvolvimento incremental do app mobile, em sintonia com o backend NestJS + Prisma + MySQL já implementado em [../backend](../backend) e com o design system do Stitch **SyncFlow SaaS Mobile Experience** (`projects/14964823542222255798`).

---

## 1. Visão geral

Aplicativo mobile para registrar **lançamentos** de COMPRA e VENDA, com fotos, **funcionando 100% offline** e sincronizando automaticamente com o backend quando há conexão. Cada usuário só vê os dados da empresa a que pertence.

### Personas

| Persona | Usuário | Empresa | Cenário |
|---|---|---|---|
| Alpha | `alpha@teste.com` / `123456` | Empresa Alpha | Operador em campo, conexão instável |
| Beta  | `beta@teste.com`  / `123456` | Empresa Beta  | Operador em campo, conexão instável |

---

## 2. Stack técnica

| Camada | Escolha |
|---|---|
| Runtime | **React Native 0.74+** (TypeScript) |
| Navegação | `@react-navigation/native` + `native-stack` |
| Banco local | **WatermelonDB** (LokiJS no Expo / SQLite no bare) |
| Estado de servidor | TanStack Query (`@tanstack/react-query`) — opcional |
| HTTP | `axios` |
| Sessão | `@react-native-async-storage/async-storage` + token JWT |
| Câmera/galeria | `expo-image-picker` (ou `react-native-image-picker` no bare) |
| Conectividade | `@react-native-community/netinfo` |
| Forms | `react-hook-form` + `zod` |
| UI | Componentes próprios estilizados conforme o design system SyncFlow |

---

## 3. Design system — SyncFlow (Stitch)

Identidade: **"calm control"** — minimalismo SaaS, espaços generosos, tipografia precisa, status de sincronização sempre visíveis. Light mode por padrão.

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#0F172A` | Texto principal, headers estruturais |
| `secondary` | `#7C3AED` | Botão primário, foco, marca |
| `success` | `#10B981` | Badge "Sincronizado" |
| `warning` | `#F59E0B` | Badge "Pendente" |
| `error` | `#BA1A1A` | Erros, validação |
| `surface` | `#F7F9FB` | Background |
| `surface-elevated` | `#FFFFFF` | Cards, inputs |
| `outline` | `#E2E8F0` | Bordas |
| `on-surface` | `#191C1E` | Texto |
| `on-surface-variant` | `#45464D` | Texto secundário |

### Tipografia

| Token | Família | Tamanho | Peso | Uso |
|---|---|---|---|---|
| `display` | Hanken Grotesk | 32 / 40 | 700 | Hero / Splash |
| `headline-lg` | Hanken Grotesk | 24 / 32 | 600 | Títulos de tela |
| `headline-md` | Hanken Grotesk | 20 / 28 | 600 | Seções |
| `body-lg` | Inter | 16 / 24 | 400 | Corpo |
| `body-md` | Inter | 14 / 20 | 400 | Corpo denso |
| `label-md` | Geist | 13 / 18 | 500 | Labels, metadados |
| `label-sm` | Geist | 11 / 16 | 600 | Badges, timestamps |

### Espaçamento (grid 4 / 8 px)

`xs=4, sm=8, md=16, lg=24, xl=32`, margem mobile = 16, gutter = 16.

### Forma

- Inputs/botões: `radius 8px`
- Cards: `radius 16px`
- Badges/pills: `radius 999px`

### Componentes-chave

- **PrimaryButton**: fundo `#7C3AED`, texto branco, sem gradiente.
- **SecondaryButton**: ghost, borda `#0F172A` @ 10%, texto `#0F172A`.
- **Input**: outlined, borda `#E2E8F0`. Foco: borda `#7C3AED` + halo 2px @ 10%.
- **SyncStatusBadge**: pill com `label-sm`. Synced = verde 10% bg / verde text. Pending = âmbar 10% / âmbar.
- **SyncToast**: bottom-aligned, barra de progresso na borda inferior.
- **Card**: branco, 16px padding, borda 1px sutil, sombra `0 4px 12px rgba(15,23,42,.03)`.
- **List row**: separador 1px `#F1F5F9`, body-md no primário, label-md cinza no metadado.

---

## 4. Arquitetura do app (feature-based, espelhando o backend)

```
mobile-app/
├── src/
│   ├── app/                      # bootstrap, providers, navegação raiz
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthStack.tsx
│   │   │   └── AppStack.tsx
│   │   └── providers/
│   │       ├── DatabaseProvider.tsx
│   │       ├── AuthProvider.tsx
│   │       └── SyncProvider.tsx
│   │
│   ├── shared/                   # design system + utils transversais
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   └── index.ts
│   │   ├── ui/                   # PrimaryButton, Input, Card, SyncBadge, Toast
│   │   ├── http/
│   │   │   └── api.ts            # axios instance + interceptor JWT
│   │   ├── storage/
│   │   │   └── session.ts        # AsyncStorage de token + user
│   │   └── utils/
│   │       ├── date.ts
│   │       └── validators.ts
│   │
│   ├── database/                 # WatermelonDB
│   │   ├── index.ts              # new Database({ adapter, modelClasses })
│   │   ├── schema.ts             # appSchema (version 1)
│   │   ├── migrations.ts
│   │   └── models/
│   │       ├── Empresa.ts
│   │       ├── Usuario.ts
│   │       ├── Registro.ts
│   │       └── FotoRegistro.ts
│   │
│   └── features/                 # uma pasta por feature (espelha backend)
│       ├── auth/
│       │   ├── api/authApi.ts
│       │   ├── hooks/useAuth.ts
│       │   ├── screens/SplashScreen.tsx
│       │   └── screens/LoginScreen.tsx
│       ├── registros/
│       │   ├── api/registrosApi.ts
│       │   ├── hooks/useRegistros.ts
│       │   ├── components/RegistroListItem.tsx
│       │   ├── components/TipoPicker.tsx
│       │   ├── screens/RegistrosListScreen.tsx
│       │   ├── screens/RegistroFormScreen.tsx
│       │   └── screens/RegistroDetailScreen.tsx
│       ├── fotos/
│       │   ├── api/fotosApi.ts
│       │   ├── components/FotoPicker.tsx
│       │   └── components/FotoGrid.tsx
│       ├── sync/
│       │   ├── api/syncApi.ts
│       │   ├── service/sync.ts   # pullChanges / pushChanges (WatermelonDB)
│       │   ├── hooks/useSync.ts
│       │   └── components/SyncBanner.tsx
│       └── perfil/
│           └── screens/PerfilScreen.tsx
│
├── App.tsx                       # entry-point (delega para src/app/App.tsx)
├── index.js
├── package.json
├── tsconfig.json
└── README.md
```

**Princípios** (alinhados com o backend):
1. **Cada feature isolada**, com `api/`, `hooks/`, `components/`, `screens/`.
2. **Modelos WatermelonDB centralizados** em `src/database/models/` (snake_case nas tabelas igual ao backend).
3. **`shared/` somente para o que é genuinamente transversal** (tema, HTTP, storage, utils, UI primitives).
4. **Navegação compõe stacks**: `AuthStack` (Splash + Login) vs `AppStack` (Lista + Form + Detail + Perfil).
5. **JWT armazenado em AsyncStorage** + replicado para WatermelonDB no model `Usuario` (sessão sobrevive ao reload).

---

## 5. Mapa de APIs do backend (NestJS, `http://<host>:3000`)

| Método | Rota | Autenticação | Body / Query | Resposta | Feature |
|---|---|---|---|---|---|
| `POST` | `/auth/login` | — | `{ login, senha }` | `{ token, usuario: { id, nome, login, empresaId, empresa } }` | auth |
| `GET`  | `/auth/me` | Bearer | — | `{ id, nome, login, empresaId, empresa }` | auth |
| `GET`  | `/empresas/me` | Bearer | — | `{ id, nome, ... }` | empresas |
| `GET`  | `/registros` | Bearer | — | `Registro[]` (com `fotos`) | registros |
| `GET`  | `/registros/:id` | Bearer | — | `Registro` | registros |
| `POST` | `/registros` | Bearer | `{ id?, tipo, dataHora, descricao }` | `Registro` | registros |
| `PATCH`| `/registros/:id` | Bearer | `{ tipo?, dataHora?, descricao? }` | `Registro` | registros |
| `DELETE`| `/registros/:id` | Bearer | — | `{ ok: true }` (soft delete) | registros |
| `GET`  | `/fotos/registro/:registroId` | Bearer | — | `FotoRegistro[]` | fotos |
| `POST` | `/fotos/registro/:registroId` | Bearer | `multipart`: `fotos[]`, `ids[]?` | `FotoRegistro[]` | fotos |
| `DELETE`| `/fotos/:id` | Bearer | — | `{ ok: true }` | fotos |
| `GET`  | `/sync/pull?lastPulledAt=<ts_ms>` | Bearer | — | `{ changes: { empresas, usuarios, registros, foto_registros }, timestamp }` | sync |
| `POST` | `/sync/push` | Bearer | `{ changes: { ... } }` | `{ ok, timestamp }` | sync |
| `GET`  | `/uploads/<arquivo>` | — | — | binário (imagem) | fotos |

> **Formato do sync** segue o contrato do WatermelonDB: cada tabela tem `{ created, updated, deleted }`; timestamps em ms; campos em **snake_case**. IDs de empresa/usuario são INT no servidor → enviados como string no payload.

---

## 6. Modelagem WatermelonDB

`src/database/schema.ts`

```ts
appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'empresas',
      columns: [
        { name: 'nome', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'usuarios',
      columns: [
        { name: 'nome', type: 'string' },
        { name: 'login', type: 'string' },
        { name: 'empresa_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'registros',
      columns: [
        { name: 'empresa_id', type: 'string', isIndexed: true },
        { name: 'usuario_id', type: 'string', isIndexed: true },
        { name: 'tipo', type: 'string' },
        { name: 'data_hora', type: 'number' },
        { name: 'descricao', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'foto_registros',
      columns: [
        { name: 'registro_id', type: 'string', isIndexed: true },
        { name: 'caminho', type: 'string' },
        { name: 'is_local_only', type: 'boolean' }, // arquivo ainda no device, não enviado
        { name: 'local_uri', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
})
```

> **`is_local_only` + `local_uri`** permitem armazenar a foto no device antes do upload e exibi-la na UI mesmo offline; após o sync, `caminho` recebe a URL do servidor.

---

## 7. Fluxo de sincronização

```ts
// src/features/sync/service/sync.ts
import { synchronize } from '@nozbe/watermelondb/sync';

await synchronize({
  database,
  pullChanges: async ({ lastPulledAt }) => {
    const { data } = await api.get('/sync/pull', { params: { lastPulledAt } });
    return { changes: data.changes, timestamp: data.timestamp };
  },
  pushChanges: async ({ changes }) => {
    await api.post('/sync/push', { changes });
  },
});
```

**Gatilhos**:
1. **Automático** quando o NetInfo detecta `isConnected = true && isInternetReachable = true` (debounced 2s).
2. **Manual** via botão "Sincronizar" na tela de Lista/Perfil.
3. **Após cada save local** se online (otimização opcional).

**Upload de fotos** segue um passo dedicado *antes* do `pushChanges`:
- Para cada `foto_registro` com `is_local_only = true`, fazer `POST /fotos/registro/:registroId` em multipart (passando o `id` da foto local).
- No sucesso, marcar `is_local_only = false` e atualizar `caminho` com a URL retornada.
- Só então rodar `synchronize()` (o push de metadados das fotos pega o `caminho` final).

---

## 8. Mapa de telas

| # | Tela | Stack | Rota | Stitch (ref.) | Status |
|---|---|---|---|---|---|
| 1 | **Splash** | Auth | `Splash` | `b31fc4d55f6a42d394bb9572908fa6a7` | 🟢 implementar agora |
| 2 | **Login** | Auth | `Login` | `95548807f9534825a71322dac853a556` | 🟢 implementar agora |
| 3 | **Lista de Registros** (home) | App | `RegistrosList` | `db33254d8c4442a7b627f5d1155e0283` | ⏳ próxima etapa |
| 4 | **Novo Registro** | App (modal) | `RegistroForm` | `f24e9ea727204ed9953cd2b591183421` | ⏳ |
| 5 | **Editar Registro** | App (modal) | `RegistroForm?id=` | `c0125518667c4cfc9915b1f42871122b` | ⏳ |
| 6 | **Detalhe do Registro** | App | `RegistroDetail` | `a222782206d14574b81c5161ba069d7e` | ⏳ |
| 7 | **Estado Offline** (banner/tela) | App | `OfflineState` | `c39f1af325c44337990bb9bb27f9a055` | ⏳ |
| 8 | **Perfil e Configurações** | App | `Perfil` | `51d81b792bdc469195885114df64231e` | ⏳ |

### Detalhamento por tela

#### 1) Splash
- **Objetivo**: enquanto carrega DB local + verifica token JWT em AsyncStorage.
- **Layout**: logo SyncFlow centralizado (200×200, SVG), indicador de loading discreto abaixo, fundo `surface`.
- **Lógica**: ao montar → abre o DB → lê `@session_token` e `@session_user` → se válidos, navega para `RegistrosList`; senão, `Login`.
- **Mínimo de exibição**: 600 ms para evitar flash.

#### 2) Login
- **Campos**: `login` (e-mail), `senha`.
- **Validação inline** (react-hook-form + zod): obrigatório, mínimo 4 chars na senha.
- **Botão "Entrar"**: `PrimaryButton`, disabled durante request.
- **Erros**: toast com `error-container` para credencial inválida (vindo do 401 do backend).
- **Lógica**: `POST /auth/login` → grava `token` e `usuario` em AsyncStorage → grava registro do `Usuario` (com `empresa`) no WatermelonDB → dispara `synchronize()` em background → navega para `RegistrosList`.
- **Footer**: pequena linha em `label-sm` mencionando "Conectado a `<API_BASE_URL>`" para auxílio em testes.

#### 3) Lista de Registros (Home)
- **Header**: título "Lançamentos", subheader com nome da empresa do usuário.
- **Banner de sync** no topo: estado (Sincronizado / Sincronizando / Pendente / Offline) + botão "Sincronizar".
- **Lista**: cada item = `Card` com tipo (badge), data formatada, descrição (2 linhas max) e `SyncStatusBadge`.
- **FAB**: `+` no canto inferior direito → `RegistroForm`.
- **Empty state**: ilustração simples + CTA "Criar primeiro lançamento".
- **Pull-to-refresh**: dispara `synchronize()`.

#### 4) Novo Registro / 5) Editar Registro (mesmo `RegistroFormScreen`)
- **Campos**:
  - `TipoPicker` — segmented control (Compra/Venda) em `label-md`.
  - `DateTimePicker` — modal nativo, mostra valor formatado `DD/MM/YYYY HH:mm`.
  - `Descricao` — multiline, contador de chars, min 10.
  - `FotoPicker` — grid 3xN, botões `Galeria` e `Câmera`, miniaturas com botão "X".
- **Validação**: obrigatórios; descrição ≥ 10 chars; ao menos 0 fotos (não obrigatório, mas se houver, todas válidas).
- **Botão "Salvar"**: cria no WatermelonDB local (offline-first) e enfileira fotos para upload no próximo sync.
- **Botão "Excluir"** (modo editar): confirma e marca `markAsDeleted()` no WatermelonDB.

#### 6) Detalhe do Registro
- **Header**: tipo (badge grande) + data.
- **Body**: descrição completa, grid de fotos (clique → fullscreen).
- **Metadados** em `label-md`: criado em / atualizado em / status de sync.
- **Ações**: Editar, Excluir.

#### 7) Estado Offline
- Implementar como **banner persistente** acima da lista quando NetInfo reporta offline + tela dedicada caso o usuário tente uma ação que exige conexão (ex.: visualizar foto remota que ainda não está em cache).

#### 8) Perfil e Configurações
- Card com nome, login, empresa.
- Item "Sincronizar agora" (com timestamp do último pull).
- Toggle "Sincronização automática".
- Botão "Sair" (limpa AsyncStorage + WatermelonDB local + navega para Login).

---

## 9. Plano incremental

| Etapa | Escopo | Status |
|---|---|---|
| **E0** | Bootstrap do projeto (init RN + TS + libs + theme) | 🟡 em andamento |
| **E1** | Splash + Login + AuthProvider + AsyncStorage | 🟢 nesta entrega |
| **E2** | DB WatermelonDB + Lista de Registros + Sync básico | ⏳ |
| **E3** | Novo/Editar Registro + FotoPicker + upload | ⏳ |
| **E4** | Detalhe + Perfil + refinamento offline | ⏳ |
| **E5** | Polimento visual + README + screenshots | ⏳ |

---

## 10. Variáveis de ambiente do app

```bash
# .env
API_BASE_URL=http://10.0.2.2:3000   # Android emulator → host machine
# iOS simulator: http://localhost:3000
# Device físico: http://<IP_DA_MAQUINA>:3000
```

Tratar via `react-native-config` (bare) ou `expo-constants` (Expo).

---

## 11. Critérios de aceite (todos do PDF)

- ✅ Login validado contra backend (MySQL via API)
- ✅ Sessão persistida; pula login se token válido
- ✅ Isolamento por empresa (já garantido pelo backend; UI só consome)
- ✅ WatermelonDB com models Empresa, Usuario, Registro, FotoRegistro
- ✅ pullChanges + pushChanges funcionais
- ✅ Funciona offline (criar, editar, anexar fotos)
- ✅ Botão "Sincronizar" manual + automático
- ✅ Tela de input com TipoPicker, DateTimePicker, descricao (≥10), múltiplas fotos
- ✅ Lista de registros com tipo, data/hora, descrição e indicador de sync
- ✅ README com requisitos e passos de execução
