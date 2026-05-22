# Backend — Teste Candidato Aplicativo

API REST em **NestJS + TypeScript**, usando **Prisma** como ORM e **MySQL** como banco de dados.

## Requisitos

- Node.js 18+ e npm
- MySQL 8.0+ acessível (default: `mysql://root:root@localhost:3306`)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo `.env`:

   ```bash
   cp .env.example .env
   ```

   Ajuste a variável `DATABASE_URL` para apontar para o seu MySQL e, opcionalmente, `JWT_SECRET`, `PORT`, `UPLOAD_DIR`.

3. Crie o banco no MySQL (caso não exista):

   ```sql
   CREATE DATABASE teste_candidato CHARACTER SET utf8mb4;
   ```

4. Rode as migrations e o seed:

   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

5. Inicie o servidor em modo desenvolvimento:

   ```bash
   npm run start:dev
   ```

   A API ficará em `http://localhost:3000`.

## Scripts

| Script             | Descrição                                |
|--------------------|------------------------------------------|
| `npm run start:dev`| Modo dev com hot reload                  |
| `npm run build`    | Compila para `dist/`                     |
| `npm run start:prod` | Roda o build de produção               |
| `npm run prisma:migrate` | `prisma migrate dev`               |
| `npm run prisma:deploy`  | `prisma migrate deploy` (prod)     |
| `npm run prisma:seed`    | Roda o seed (`prisma/seed.ts`)     |
| `npm run db:reset` | Reseta o banco e roda seed (cuidado!)    |

## Modelagem

- **empresa** (`id`, `nome`)
- **usuario** (`id`, `nome`, `login` único, `senha` hashada, `empresa_id`)
- **registro** (`id` UUID, `empresa_id`, `usuario_id`, `tipo` `COMPRA|VENDA`, `data_hora`, `descricao`)
- **foto_registro** (`id` UUID, `registro_id`, `caminho`)

Todas as tabelas têm `created_at`, `updated_at` e `deleted_at` (soft delete) para suportar a sincronização do WatermelonDB.

> Registros e fotos usam **UUID** como PK porque são criados no cliente (offline-first). Empresas e usuários usam INT auto-increment, conforme requisito.

## Seed inicial

- 2 empresas: *Empresa Alpha* (id=1) e *Empresa Beta* (id=2).
- 2 usuários (senha em todos: `123456`):
  - `alpha@teste.com` → Empresa Alpha
  - `beta@teste.com` → Empresa Beta

## Autenticação

`POST /auth/login`

```json
{ "login": "alpha@teste.com", "senha": "123456" }
```

Resposta:

```json
{
  "token": "<jwt>",
  "usuario": {
    "id": 1, "nome": "Usuário Alpha", "login": "alpha@teste.com",
    "empresaId": 1, "empresa": { "id": 1, "nome": "Empresa Alpha" }
  }
}
```

Use o token em `Authorization: Bearer <jwt>` para as demais rotas.

## Endpoints

### Registros (escopo da empresa do usuário logado)

```
GET    /registros            → lista
GET    /registros/:id        → detalhe
POST   /registros            → cria { id?, tipo, dataHora, descricao }
PATCH  /registros/:id        → atualiza
DELETE /registros/:id        → soft delete
```

### Fotos

```
GET    /fotos/registro/:registroId
POST   /fotos/registro/:registroId   (multipart, campo "fotos", aceita várias imagens)
DELETE /fotos/:id
```

Os arquivos são armazenados em `./uploads` e servidos em `/uploads/<arquivo>`.

### Sync (WatermelonDB)

**Pull** — `GET /sync/pull?lastPulledAt=<timestamp_ms>`

```json
{
  "changes": {
    "empresas":       { "created": [...], "updated": [...], "deleted": [...] },
    "usuarios":       { "created": [...], "updated": [...], "deleted": [...] },
    "registros":      { "created": [...], "updated": [...], "deleted": [...] },
    "foto_registros": { "created": [...], "updated": [...], "deleted": [...] }
  },
  "timestamp": 1716393600000
}
```

**Push** — `POST /sync/push` com body no mesmo formato `{ changes: { ... } }`.

O backend filtra todos os dados pelo `empresa_id` do JWT — um usuário nunca recebe nem grava em registros de outra empresa.

## Boas práticas adotadas

- Validação via `class-validator` + `ValidationPipe` global.
- Senhas hashadas com `bcryptjs`.
- CORS habilitado (qualquer origem) para facilitar testes locais.
- Soft delete via `deleted_at` para o WatermelonDB processar deleções no pull.
- Upload de múltiplas imagens com filtro de mimetype e limite de 15 MB por arquivo.
