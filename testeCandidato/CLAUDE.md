# SyncFlow — guia para o Claude

App mobile React Native + Expo (SDK 56) para registro de atividades em campo
**offline-first**. O usuário cria "registros" (compra/venda/etc.) com fotos
anexadas mesmo sem internet; quando a rede volta, o app sincroniza tudo com
um backend NestJS + Prisma.

Stack: TypeScript estrito, React 19, Expo Dev Client, WatermelonDB (SQLite +
sync engine), AsyncStorage (sessão/preferências), Zustand (estado global),
React Hook Form + Zod (formulários), Axios (HTTP), React Navigation (rotas).

## Como rodar

- `npx expo run:android` — compila e instala o dev build no aparelho (precisa
  Android Studio + emulador/device). **Não rode `expo start` sem `--dev-client`**
  porque o app usa libs nativas (WatermelonDB) que o Expo Go não carrega.
- `npm test` — Jest com `jest-expo` + RNTL.
- `npx tsc --noEmit` — type-check (já configurado strict).

---

# Arquitetura

Padrão **MVVM** + **Repository**, com **offline-first** como restrição
arquitetural. Telas são burras, ViewModels (hooks) carregam a lógica,
Repositories fazem fronteira com HTTP/banco.

```
View (.tsx)  →  ViewModel (use…hook)  →  Repository  →  HTTP / WatermelonDB
```

Cada camada **só conhece a de baixo**. View nunca chama axios direto; ViewModel
nunca importa axios; Repository nunca toca em estado de UI.

## Regras invioláveis

1. **HTTP só via `httpClient`** (axios singleton com interceptor). Nunca usar
   `fetch` direto, nunca criar outro AxiosInstance.
2. **Toda mutação no WatermelonDB roda dentro de `database.write(async () => {})`**.
   Mutar fora joga erro em runtime.
3. **Erros que cruzam camada virão como `AppError`** (com `kind: 'network' |
   'unauthorized' | 'timeout' | 'server' | ...`). Nunca propagar `AxiosError` cru
   pra ViewModel — o interceptor já converte.
4. **Repositories devolvem entities, nunca DTOs.** Existe um Mapper (`AuthMapper`,
   etc.) entre o DTO da resposta e a entity de domínio.
5. **DTOs usam snake_case/português** (batem 1:1 com o backend NestJS); **entities
   usam camelCase/inglês** (vocabulário do domínio do app).
6. **Sync nunca é chamado direto pelo Repository.** O fluxo é
   `ViewModel → useSyncEngine.syncNow() → syncRepository.run()`. Chamar
   `syncRepository.run()` direto pula dedup, máquina de estados e reconexão
   automática.
7. **Não criar arquivo `.md` de documentação sem pedido explícito.**

---

# Estrutura de diretórios

```
src/
├── core/              ← infra compartilhada (sem feature específica)
│   ├── api/           ← httpClient + AppError
│   ├── config/        ← env (apiBaseUrl, storageKeys)
│   ├── database/      ← WatermelonDB: schema, models, migrations
│   ├── navigation/    ← React Navigation: routes, types, RootNavigator
│   ├── shared/
│   │   ├── components/  ← UI reutilizável (PrimaryButton, TextField, Toast…)
│   │   ├── data/
│   │   │   ├── dtos/       ← formato do backend + Mappers
│   │   │   └── entities/   ← formato do domínio do app
│   │   ├── hooks/      ← hooks genéricos
│   │   ├── repositories/   ← AuthRepository, RegistrosRepository,
│   │   │                     FotosRepository, SyncRepository + index.ts
│   │   └── services/   ← stores Zustand + AsyncStorageManager
│   ├── theme/         ← colors, spacing, typography
│   └── utils/         ← logger, result
├── features/          ← cada feature é uma pasta independente
│   ├── auth/
│   │   ├── hooks/         ← useAuthViewModel
│   │   ├── presentation/  ← AuthView
│   │   ├── test/          ← *.test.tsx desta feature
│   │   └── index.ts       ← barrel público da feature
│   ├── home/
│   ├── profile/
│   ├── registros/
│   ├── splash/
│   └── sync/          ← useSyncEngine (não tem View)
└── types/             ← declarações ambient (.d.ts) globais
```

Regras de organização:
- **Pasta `feature/` tem hooks + presentation + index + (opcional) test.**
  Não criar subpastas extras sem motivo.
- **Repositories são "flat"** dentro de `core/shared/repositories/`. Um arquivo
  por classe, um `index.ts` consolidado. **Não** criar subpastas
  `repositories/auth/`, `repositories/sync/` etc.
- **Testes vivem em `features/<feat>/test/`**, não junto do código.
- `core/shared/` é para o que múltiplas features usam. Se algo só serve a uma
  feature, mora dentro dela.

---

# Camadas e responsabilidades

## 1. View (`features/*/presentation/*.tsx`)

Componente React puro. **Só renderiza** o que vem do ViewModel e propaga eventos.
Sem `useState` de regra de negócio, sem chamadas a `axios`/`database`, sem
validação.

Exemplo: [src/features/auth/presentation/AuthView.tsx](src/features/auth/presentation/AuthView.tsx)

```tsx
export const AuthView = () => {
  const vm = useAuthViewModel();   // ← única fonte de tudo
  return (
    <View>
      <Controller control={vm.control} name="login" render={...} />
      <PrimaryButton label="Entrar" onPress={vm.onSubmit}
                     loading={vm.isSubmitting} />
    </View>
  );
};
```

Estado local **é permitido** apenas para coisas puramente visuais (`showPassword`,
`keepConnected` no AuthView são OK). Qualquer estado que toca regra de negócio
vai pro ViewModel.

## 2. ViewModel (`features/*/hooks/use*ViewModel.ts`)

Hook React que **expõe um objeto único** com tudo que a View precisa: dados,
flags, callbacks. Concentra: validação, side-effects, navegação, tradução de
erros.

Convenções:
- Nome: `use<Feature><Tela>ViewModel` (ex.: `useAuthViewModel`,
  `useRegistroFormViewModel`).
- Retorna uma interface tipada `<Tela>ViewModel`.
- Formulários sempre via `react-hook-form` + `zodResolver` (schema declarado
  acima do hook).
- Erros caem em `try/catch` e viram `AppError.from(error)`; daí o `kind`
  decide se mostra `submissionError` inline ou toast global.

Exemplo: [src/features/auth/hooks/useAuthViewModel.ts](src/features/auth/hooks/useAuthViewModel.ts)

## 3. Repository (`core/shared/repositories/*Repository.ts`)

Classes em flat layout, cada uma uma porta de entrada para um domínio. Devolvem
entities, nunca DTOs. Singletons exportados em lowerCamelCase:

```ts
export class AuthRepository { ... }
export const authRepository = new AuthRepository();
```

| Repository | HTTP | Banco local | Responsabilidade |
|---|---|---|---|
| [AuthRepository](src/core/shared/repositories/AuthRepository.ts) | sim | sim (só logout) | login, refreshSession, signOut |
| [RegistrosRepository](src/core/shared/repositories/RegistrosRepository.ts) | **não** | sim | CRUD offline-first em `registros` + `foto_registros` |
| [FotosRepository](src/core/shared/repositories/FotosRepository.ts) | sim | sim | upload dos binários `is_local_only=true` |
| [SyncRepository](src/core/shared/repositories/SyncRepository.ts) | sim | sim | engine `synchronize()` (pull + push) |

Imports relativos: a partir de um repository, o core/api fica em `'../../api'`,
o database em `'../../database'`, services em `'../services/...'`, data em
`'../data/...'`.

## 4. HTTP — `core/api/`

- [httpClient.ts](src/core/api/httpClient.ts) — única `AxiosInstance` do app.
  Interceptor de request injeta `Authorization: Bearer <token>` lendo
  `AuthTokenStore`. Interceptor de response converte `AxiosError` em `AppError`.
- [AppError.ts](src/core/api/AppError.ts) — erro de domínio com `kind`
  (`network`, `timeout`, `unauthorized`, ...). Use `AppError.from(error)` para
  normalizar qualquer throw.

## 5. Banco — `core/database/`

WatermelonDB sobre SQLite (JSI habilitado).

- [schema.ts](src/core/database/schema.ts) — **versão 1**. Tabelas: `empresas`,
  `usuarios`, `registros`, `foto_registros`.
- [migrations.ts](src/core/database/migrations.ts) — array vazio é intencional
  (estamos na v1). O objeto `schemaMigrations(...)` precisa existir para o sync
  funcionar.
- [models/](src/core/database/models/) — um arquivo por tabela, com `@field`,
  `@date`, `@readonly`.
- [index.ts](src/core/database/index.ts) — exporta `database` singleton.

**Sempre que alterar `schema.ts`, suba `version` e adicione step em
`migrations.ts`.**

## 6. Sincronização — `features/sync/`

- [useSyncEngine](src/features/sync/hooks/useSyncEngine.ts) — hook que wrappa
  `syncRepository.run()` com:
  - máquina de estados (`idle | syncing | success | error | offline | unauthorized`),
  - auto-sync no mount (opção `autoOnMount`, default `true`),
  - auto-sync na reconexão (assina `NetworkStore` e detecta transição
    offline→online),
  - dedup de chamadas concorrentes (`inflightRef`).

Quem dispara sync na prática:
- **Home**: `useSyncEngine()` — agressivo.
- **Profile, Registro Form, Registro Detail**: `useSyncEngine({ autoOnMount: false })`
  — só `syncNow()` sob demanda + reconexão.

## 7. Estado global — `core/shared/services/`

Cada arquivo é um Zustand store ou utilitário, com escopo único:

| Service | O que guarda | Persiste? |
|---|---|---|
| AppStateStore | toast, isReady | não |
| ThemeStore | mode (light/dark) | não |
| AuthTokenStore | token JWT + user | AsyncStorage |
| PreferencesStore | autoSync, language | AsyncStorage |
| NetworkStore | isOnline, isInternetReachable | não (vem do NetInfo) |
| SyncMetaStore | lastSyncedAt | AsyncStorage |
| QueryClientProvider | container do TanStack Query | n/a |
| storage/AsyncStorageManager | wrapper de AsyncStorage com JSON | n/a |

**Regra de divisão**: WatermelonDB = dados de negócio que sincronizam.
AsyncStorage = sessão/preferências/metadados (poucas chaves, leitura no boot).

## 8. DTO ↔ Entity (`core/shared/data/`)

- **DTOs** (`dtos/`): formato exato do backend (snake_case, português:
  `nome`, `senha`, `empresa_id`). Têm um `Mapper` static.
- **Entities** (`entities/`): vocabulário do app (camelCase, inglês:
  `name`, `password`, `empresaId`).
- A camada Repository é quem chama o Mapper. ViewModels e Views só veem entity.

Exemplo: [authDto.ts](src/core/shared/data/dtos/authDto.ts) define
`UsuarioDto + AuthMapper.userToDomain`, que devolve `AuthenticatedUser`
(de [authEntities.ts](src/core/shared/data/entities/authEntities.ts)).

---

# Testes

Stack: `jest-expo`, `@testing-library/react-native`, `react-test-renderer`.
Setup global em [jest.setup.js](jest.setup.js) com mocks de AsyncStorage,
NetInfo, SafeArea e `@expo/vector-icons`.

**Localização**: `src/features/<feature>/test/<Nome>.test.tsx`.

**Padrões importantes:**

- Variáveis usadas dentro de `jest.mock(...)` **devem ter prefixo `mock`**
  (`mockSignIn`, `mockShowToast`) — exigência do Babel ao içar mocks.
- **Teste de View** mocka o ViewModel inteiro e o `Controller` do RHF:

  ```ts
  jest.mock('../hooks/useAuthViewModel', () => ({
    useAuthViewModel: () => mockCurrentVm,
  }));
  jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    Controller: ({ render, name }) => render({ field: { value: '', ... }}),
  }));
  ```

- **Teste de ViewModel** usa um `Harness` mínimo que monta `Controller`s reais
  ligados a `vm.control`, e expõe o VM via callback `onVm`. Mocka apenas as
  fronteiras externas (`authRepository`, `useAppStateStore`, `useNavigation`,
  `logger`).

Exemplos: [AuthView.test.tsx](src/features/auth/test/AuthView.test.tsx) e
[useAuthViewModel.test.tsx](src/features/auth/test/useAuthViewModel.test.tsx).

---

# Como adicionar coisas comuns

## Nova feature

1. Crie `src/features/<feat>/` com `hooks/`, `presentation/`, `index.ts`.
2. ViewModel: `use<Feat>ViewModel` retornando interface `<Feat>ViewModel`.
3. View: consome só o VM, sem lógica.
4. Se precisa de dados de backend/banco: estenda um Repository existente ou
   crie um novo em `core/shared/repositories/`.
5. Adicione rota em `core/navigation/routes.ts` + tipo em `types.ts`.

## Nova chamada HTTP

1. **Não** crie cliente axios novo. Use `httpClient`.
2. Defina o endpoint num arquivo de DTO (`*_ROUTES = { ... } as const`).
3. Crie request/response DTOs no mesmo arquivo + Mapper para a entity.
4. Adicione método no Repository: `try/catch` + `AppError.from` + log.

## Nova tabela no banco

1. Atualize `schema.ts`: incrementa `version`, adiciona `tableSchema`.
2. Adicione step em `migrations.ts` (`addColumns`, `createTable`...).
3. Crie model em `core/database/models/`, registre em
   `database/index.ts > modelClasses`.
4. Repository: leituras via `database.get<Model>('tabela').query(...)`;
   mutações dentro de `database.write(async () => {...})`.

## Persistir algo pequeno (token, preferência)

Use AsyncStorage via `asyncStorageManager`, não WatermelonDB. Crie um Zustand
store em `core/shared/services/` que hidrata no boot e replica setters no
disco. Adicione a chave em `core/config/env.ts > storageKeys`.

---

# O que NÃO fazer

- Não criar Repositories em subpastas (`repositories/auth/AuthRepository.ts`).
  Tudo flat: `repositories/AuthRepository.ts`.
- Não importar `axios` fora de `httpClient.ts`.
- Não chamar `AsyncStorage` direto; use `asyncStorageManager`.
- Não chamar `syncRepository.run()` direto de ViewModel; use `useSyncEngine`.
- Não criar `index.ts` por componente quando o arquivo único já basta.
- Não adicionar comentários óbvios. Comentário só quando o **porquê** não é
  óbvio (invariante escondida, workaround, decisão contraintuitiva).
- Não criar mock services genéricos (ex.: `DatabaseManager`). Os Repositories
  já são a abstração.

---

# Estilo e tom

- Respostas em **português** (do Brasil).
- Mensagens de erro **mostradas ao usuário** em português; mensagens de log
  em inglês ou português, mas curtas.
- Código em **inglês** para nomes; comentários podem ser em português quando
  ajudar contexto local.
- Em testes, descrições de `it(...)` podem ser em português.
