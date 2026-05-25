# Resumo do Backend — Teste Candidato Aplicativo

API REST construída em **NestJS + TypeScript**, com **Prisma** como ORM, **MySQL** como banco e autenticação via **JWT (Passport)**. Foi projetada para servir um app mobile **offline-first** (cliente em WatermelonDB), por isso tem um módulo dedicado de sincronização (`/sync`) e usa **UUIDs** nas tabelas que o cliente pode criar offline.

---

## 1. Visão geral da estrutura

```
backend/
├── prisma/
│   ├── schema.prisma        # Modelos do banco (empresa, usuario, registro, foto_registro)
│   └── seed.ts              # Cria 2 empresas e 2 usuários de teste (senha 123456)
├── src/
│   ├── main.ts              # Bootstrap: CORS, ValidationPipe, /uploads estático
│   ├── app.module.ts        # Módulo raiz — agrega todos os outros
│   ├── prisma/              # PrismaService global (compartilhado)
│   ├── auth/                # Login JWT + Guard + Decorator @CurrentUser
│   ├── empresas/            # CRUD básico de empresas
│   ├── usuarios/            # Service auxiliar (apenas findById)
│   ├── registros/           # CRUD de registros COMPRA/VENDA (escopo por empresa)
│   ├── fotos/               # Upload multipart + serviço de fotos
│   └── sync/                # Pull / Push para WatermelonDB
├── uploads/                 # Diretório físico das fotos (servido em /uploads/*)
├── .env                     # DATABASE_URL, JWT_SECRET, PORT, UPLOAD_DIR
├── package.json
├── nest-cli.json
└── tsconfig.json
```

### Fluxo de uma requisição típica

1. Cliente envia `POST /auth/login` com `{ login, senha }`.
2. Backend valida no Prisma, compara `bcrypt`, devolve `{ token, usuario }`.
3. Cliente guarda o JWT e envia em `Authorization: Bearer <token>` em todas as outras rotas.
4. O `JwtAuthGuard` (Passport) extrai o token, a `JwtStrategy` busca o usuário no banco e injeta em `req.user`.
5. O decorator `@CurrentUser()` lê `req.user` no controller — daí em diante todo serviço filtra por `user.empresaId`, garantindo **isolamento multi-tenant**.

### Configurações base (arquivos auxiliares)

- **`package.json`** — scripts (`start:dev`, `build`, `prisma:migrate`, `prisma:seed`, `db:reset`) e dependências (NestJS 10, Prisma 5, `bcryptjs`, `passport-jwt`, `multer`, `uuid`, `class-validator`).
- **`tsconfig.json`** — target `ES2021`, decorators habilitados, `strictNullChecks: false` (mais permissivo).
- **`nest-cli.json`** — `sourceRoot: src`, limpa `dist/` a cada build.
- **`.env.example`** — modelo das variáveis (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `UPLOAD_DIR`).

---

## 2. Bootstrap — `src/main.ts`

Ponto de entrada. Responsabilidades:

- Cria a aplicação Nest como `NestExpressApplication` (precisa do Express para servir arquivos estáticos).
- **`app.enableCors()`** — libera qualquer origem (facilita testes locais; em produção deveria ser restrito).
- **`ValidationPipe` global** com:
  - `whitelist: true` → remove campos não declarados nos DTOs.
  - `transform: true` → converte tipos automaticamente (strings → numbers, etc.).
  - `forbidNonWhitelisted: false` → não lança erro se vierem campos extras, só remove.
- Garante que a pasta de upload existe (`mkdirSync recursive`) e a expõe em `/uploads/*`.
- Sobe o servidor na `PORT` (default 3000).

---

## 3. Módulo raiz — `src/app.module.ts`

Apenas agrega tudo. Usa `ConfigModule.forRoot({ isGlobal: true })` para que `process.env` esteja disponível em qualquer módulo sem precisar importar `ConfigModule` de novo.

Importa: `PrismaModule`, `AuthModule`, `EmpresasModule`, `UsuariosModule`, `RegistrosModule`, `SyncModule`, `FotosModule`.

---

## 4. Módulo Prisma — `src/prisma/`

### `prisma.service.ts`
Estende `PrismaClient` e implementa `OnModuleInit` / `OnModuleDestroy` para conectar/desconectar junto com o ciclo do Nest. É a única classe que fala diretamente com o banco.

### `prisma.module.ts`
Marcado com `@Global()`, então o `PrismaService` fica disponível em todos os outros módulos sem precisar reimportar.

### `prisma/schema.prisma` — modelagem
- **Empresa** (`id INT autoincrement`, `nome`) → 1:N usuarios e registros.
- **Usuario** (`id INT`, `nome`, `login UNIQUE`, `senha` hash, `empresaId`).
- **Registro** (`id VARCHAR(36)` UUID, `empresaId`, `usuarioId`, `tipo ENUM(COMPRA|VENDA)`, `dataHora`, `descricao`).
- **FotoRegistro** (`id VARCHAR(36)` UUID, `registroId` cascade delete, `caminho`).

**Por que UUID em Registro/FotoRegistro?** Porque o app cliente cria esses dados **offline** (WatermelonDB) — o id precisa ser gerado no cliente e respeitado pelo servidor.

Todas as tabelas têm `createdAt`, `updatedAt` e `deletedAt` (**soft delete**) para que o WatermelonDB consiga propagar deleções no pull.

### `prisma/seed.ts`
`upsert` de 2 empresas (Alpha id=1, Beta id=2) e 2 usuários (`alpha@teste.com`, `beta@teste.com`, senha `123456` hash bcrypt). Roda com `npm run prisma:seed`.

---

## 5. Módulo Auth — `src/auth/`

Implementa login e proteção via **JWT** usando Passport.

### `auth.module.ts`
Registra:
- `PassportModule` com strategy padrão `'jwt'`.
- `JwtModule` com `secret` do env e `expiresIn` (7d default).
- Providers: `AuthService`, `JwtStrategy`.
- Exporta `AuthService`, `JwtModule`, `PassportModule` para uso em outros módulos.

### `auth.controller.ts`
- `POST /auth/login` → recebe `LoginDto`, devolve token e dados do usuário.
- `GET /auth/me` (protegido) → devolve o usuário do token atual.

### `auth.service.ts`
- **`login(dto)`**: busca usuário pelo `login` (com `include: empresa`), valida `deletedAt`, compara senha com `bcrypt.compare`, monta `payload = { sub, login, empresaId }` e assina o JWT. Retorna `{ token, usuario: {..., empresa: {...}} }`.
- **`me(usuarioId)`**: simplesmente devolve o usuário (mesmo formato do login, sem token).

### `jwt.strategy.ts`
Extends `PassportStrategy(Strategy)` da `passport-jwt`:
- Extrai token do header `Authorization: Bearer ...`.
- Não ignora expiração.
- Usa `JWT_SECRET` do env.
- No método `validate(payload)`: busca o usuário pelo `sub`, rejeita se `deletedAt`, e retorna o objeto que o Passport injeta em `req.user` (id, login, nome, empresaId, empresa).

### `jwt-auth.guard.ts`
Atalho: `extends AuthGuard('jwt')`. Usado como `@UseGuards(JwtAuthGuard)` nos controllers.

### `current-user.decorator.ts`
Decorator `@CurrentUser()` que extrai `req.user` para um parâmetro do método do controller. Tipado com a interface `AuthUser`. É o padrão para acessar o usuário logado em qualquer endpoint protegido.

### `dto/login.dto.ts`
Validação com `class-validator`: `login` obrigatório, `senha` mínima de 4 caracteres.

---

## 6. Módulo Empresas — `src/empresas/`

CRUD básico de empresas (todas as rotas protegidas pelo JWT).

### `empresas.controller.ts`
- `GET /empresas/me` → empresa do usuário logado (`user.empresaId`).
- `GET /empresas/findAll` → lista todas (não filtra por tenant — qualquer usuário logado vê todas).
- `POST /empresas/create` → cria empresa a partir de `CreateEmpresaDto`.
- `DELETE /empresas/delet/:id` → soft delete (seta `deletedAt`).

### `empresas.service.ts`
- `findAll()` → lista onde `deletedAt: null`.
- `create(dto)` → cria registro com `nome`.
- `findById(id)` / `findByIdOrFail(id)` → busca respeitando soft delete; a versão `OrFail` lança `NotFoundException`.
- `delet(id)` → marca `deletedAt = now()`.

### `dto/create-empresa.dto.ts`
`nome` obrigatório, entre 2 e 255 caracteres.

> Observação: o endpoint `POST /empresas/create` está livre para qualquer usuário autenticado — não há controle de "admin". Se a regra exigir restrição, seria preciso adicionar role/guard.

---

## 7. Módulo Usuarios — `src/usuarios/`

Módulo muito enxuto.

### `usuarios.service.ts`
Apenas `findById(id)` retornando o usuário com `include: empresa`. **Não tem controller**, é um service auxiliar exportado para uso futuro/outros módulos.

### `usuarios.module.ts`
Declara o service e exporta. Não expõe nenhuma rota.

---

## 8. Módulo Registros — `src/registros/`

Coração do negócio: CRUD de movimentações **COMPRA/VENDA** com **escopo por empresa**.

### `registros.controller.ts`
Todas protegidas por `JwtAuthGuard`. Sempre lê `@CurrentUser()`:
- `GET /registros` → lista os registros da empresa do usuário.
- `GET /registros/:id` → detalhe, valida se pertence à mesma empresa.
- `POST /registros` → cria; aceita `id` opcional (vindo do cliente offline).
- `PATCH /registros/:id` → atualização parcial.
- `DELETE /registros/:id` → soft delete.

### `registros.service.ts`
- `listByEmpresa(empresaId)` → traz registros + fotos não deletadas, ordenado por `dataHora desc`.
- `findById(id, user)` → busca registro; lança `NotFoundException` se não existe ou está deletado, `ForbiddenException` se `empresaId` diferente do usuário.
- `create(dto, user)` → usa `dto.id` se enviado (importante para sync offline) ou gera `uuidv4()`. Força `empresaId = user.empresaId` e `usuarioId = user.id` (cliente não pode forjar).
- `update(id, dto, user)` → revalida ownership via `findById` e aplica só os campos enviados (spread condicional).
- `remove(id, user)` → soft delete, devolve `{ ok: true }`.

### DTOs
- **`CreateRegistroDto`**: `id?` UUID opcional, `tipo` enum `COMPRA|VENDA`, `dataHora` ISO 8601, `descricao` mínimo 10 caracteres.
- **`UpdateRegistroDto`**: mesmos campos, todos opcionais.

---

## 9. Módulo Fotos — `src/fotos/`

Upload e listagem de fotos vinculadas a um registro. Os arquivos físicos vão para `./uploads`, servidos em `/uploads/<arquivo>` (configurado no `main.ts`).

### `fotos.controller.ts`
- `GET /fotos/registro/:registroId` → lista fotos não deletadas do registro.
- `POST /fotos/registro/:registroId` → **upload multipart** (`FilesInterceptor('fotos', 20)`).
  - Usa `multer.diskStorage`, nome único `Date.now()-uuid + extensão`.
  - **Limite de 15 MB** por arquivo.
  - `fileFilter` aceita só `image/*`.
  - Aceita opcional `body.ids` (string ou JSON array) para usar IDs vindos do cliente offline — mantém consistência com WatermelonDB.
  - Em caso de erro depois de salvar no disco, faz `cleanupFiles` (best-effort `unlink`).
- `DELETE /fotos/:id` → soft delete.

### `fotos.service.ts`
- `addFoto(registroId, caminho, user, fotoId?)` → valida que o registro existe, não está deletado, e pertence à empresa do usuário. Cria a foto (id do cliente ou `uuidv4()`).
- `listByRegistro(registroId, user)` → mesma checagem, retorna fotos ativas.
- `remove(fotoId, user)` → carrega a foto com `include: registro` para checar `empresaId`, depois soft delete.

---

## 10. Módulo Sync — `src/sync/`

O módulo mais específico: implementa o protocolo de sincronização do **WatermelonDB** (offline-first). Sempre filtra tudo pela `empresaId` do JWT.

### `sync.controller.ts`
- `GET /sync/pull?lastPulledAt=<ms>` → cliente diz quando sincronizou pela última vez.
- `POST /sync/push` → cliente envia `{ changes: { ... } }` para persistir.

### `sync.service.ts`

#### `pull(lastPulledAt, user)`
1. Define `since` (data do último pull ou epoch).
2. Busca **apenas** dados da empresa do usuário: empresas (só a dele), usuarios da empresa, registros, e fotos cujos `registroId` estão na lista.
3. Para cada coleção, chama `splitChanges()` que classifica cada item em:
   - `created` se `createdAt > since`
   - `updated` se `updatedAt > since` (e não foi criado nesse intervalo)
   - `deleted` se `deletedAt > since` (lista de IDs apenas)
4. Retorna `{ changes: {...}, timestamp: now }` — formato esperado pelo WatermelonDB.

Os IDs são convertidos para string (`String(e.id)`) porque o WatermelonDB trabalha com IDs string. Datas viram timestamps em ms.

#### `push(body, user)`
Roda dentro de uma **transação Prisma** (`$transaction`), processando duas coleções:

- **`registros`** (created / updated / deleted):
  - Em create/update: faz `findUnique` por id. Se existe e é de outra empresa → ignora silenciosamente (não estoura erro de segurança). Se existe e é da mesma empresa → `update`. Se não existe → `create` com `empresaId` e `usuarioId` forçados do JWT.
  - Em delete: soft delete (`deletedAt = now()`) se for da mesma empresa.
  - Validação por `validateRegistroPayload` (campos obrigatórios) e `parseTipo` (normaliza maiúscula/minúscula).

- **`foto_registros`** (created / updated / deleted): mesma lógica, mas valida que o `registroId` da foto pertence à empresa antes de qualquer operação.

Retorna `{ ok: true, timestamp: Date.now() }`.

> Segurança: usuário **nunca** consegue ler nem gravar dados de outra empresa, mesmo forjando payloads. O `empresaId` é tirado do JWT e usado como filtro/override.

---

## 11. Resumo dos endpoints

| Método | Rota                              | Auth | Função                                    |
|--------|-----------------------------------|------|-------------------------------------------|
| POST   | `/auth/login`                     |  —   | Login → JWT                               |
| GET    | `/auth/me`                        |  ✅  | Usuário logado                            |
| GET    | `/empresas/me`                    |  ✅  | Empresa do usuário                        |
| GET    | `/empresas/findAll`               |  ✅  | Lista todas as empresas                   |
| POST   | `/empresas/create`                |  ✅  | Cria empresa                              |
| DELETE | `/empresas/delet/:id`             |  ✅  | Soft delete empresa                       |
| GET    | `/registros`                      |  ✅  | Lista registros da empresa                |
| GET    | `/registros/:id`                  |  ✅  | Detalhe                                   |
| POST   | `/registros`                      |  ✅  | Cria registro                             |
| PATCH  | `/registros/:id`                  |  ✅  | Atualiza                                  |
| DELETE | `/registros/:id`                  |  ✅  | Soft delete                               |
| GET    | `/fotos/registro/:registroId`     |  ✅  | Lista fotos do registro                   |
| POST   | `/fotos/registro/:registroId`     |  ✅  | Upload multipart (até 20 imagens, 15 MB)  |
| DELETE | `/fotos/:id`                      |  ✅  | Soft delete foto                          |
| GET    | `/sync/pull?lastPulledAt=...`     |  ✅  | Pull WatermelonDB                         |
| POST   | `/sync/push`                      |  ✅  | Push WatermelonDB                         |
| GET    | `/uploads/<arquivo>`              |  —   | Servir foto estática                      |

---

## 12. Pontos arquiteturais importantes

1. **Multi-tenant por JWT**: todo filtro/escrita usa `user.empresaId`, que vem do token. Cliente não consegue enxergar outras empresas.
2. **Offline-first com UUIDs**: `Registro` e `FotoRegistro` aceitam id do cliente, permitindo criar offline e sincronizar depois sem conflito.
3. **Soft delete em tudo**: campo `deletedAt` em todas as tabelas, necessário para o WatermelonDB propagar deleções via pull.
4. **Validação centralizada**: `ValidationPipe` global + DTOs com `class-validator` em todos os inputs HTTP. O `push` do sync valida manualmente porque o payload é dinâmico/genérico.
5. **Senha sempre hash**: `bcrypt` com salt 10 no seed e na verificação.
6. **Upload com segurança básica**: filtro de mimetype, limite de tamanho, nomes únicos, cleanup em caso de erro.
7. **PrismaService global**: evita boilerplate em cada módulo.
8. **Transação no push** garante consistência: se algo falhar no meio, nada é persistido.
