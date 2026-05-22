# Teste Candidato Aplicativo

Projeto do teste técnico: aplicativo mobile (React Native + WatermelonDB) com sincronização offline contra um backend NestJS + Prisma + MySQL.

## Estrutura do repositório

```
TesteCadidatoAplicativo/
├── backend/   # API REST em NestJS + TypeScript + Prisma + MySQL
└── README.md  # este arquivo
```

> O frontend React Native (com WatermelonDB) consome a API exposta pelo backend descrito abaixo.

## Requisitos

- Node.js 18+ e npm
- MySQL 8.0+ rodando localmente (porta 3306)
- (Para o app) React Native CLI, Android Studio / Xcode

## Backend — passo a passo

Consulte também o [backend/README.md](backend/README.md) para detalhes.

```bash
cd backend
cp .env.example .env       # ajuste DATABASE_URL se necessário
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

## Credenciais de teste (seed)

| Login              | Senha    | Empresa        |
|--------------------|----------|----------------|
| `alpha@teste.com`  | `123456` | Empresa Alpha  |
| `beta@teste.com`   | `123456` | Empresa Beta   |

Cada usuário só enxerga os registros da própria empresa.

## Endpoints principais

| Método | Rota                              | Descrição                                  |
|--------|-----------------------------------|--------------------------------------------|
| POST   | `/auth/login`                     | Autenticação (retorna JWT)                 |
| GET    | `/auth/me`                        | Usuário logado                             |
| GET    | `/empresas/me`                    | Empresa do usuário logado                  |
| GET    | `/registros`                      | Lista registros da empresa                 |
| POST   | `/registros`                      | Cria registro                              |
| PATCH  | `/registros/:id`                  | Atualiza registro                          |
| DELETE | `/registros/:id`                  | Remove (soft delete)                       |
| GET    | `/fotos/registro/:registroId`     | Lista fotos                                |
| POST   | `/fotos/registro/:registroId`     | Upload de múltiplas fotos (multipart)      |
| DELETE | `/fotos/:id`                      | Remove foto                                |
| GET    | `/sync/pull?lastPulledAt=ts`      | Pull WatermelonDB                          |
| POST   | `/sync/push`                      | Push WatermelonDB                          |

Todas as rotas (exceto `/auth/login`) exigem `Authorization: Bearer <jwt>`.

## Testando offline/online

1. Suba o backend e faça login no app.
2. Crie registros enquanto o app está com a rede ativa — eles ficarão pendentes (não sincronizados) caso o servidor esteja indisponível.
3. Desligue a rede (modo avião) e siga criando registros + anexando fotos: tudo é gravado no WatermelonDB local.
4. Ao restabelecer a conexão, toque em **Sincronizar** (ou aguarde a sincronização automática) — o app chama `/sync/push` e depois `/sync/pull`.
5. A lista deve atualizar com o ícone de sincronização confirmando que os dados foram enviados.
