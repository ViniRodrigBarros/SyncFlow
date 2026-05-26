# SyncFlow — Teste Candidato Aplicativo

**SyncFlow** é um aplicativo mobile de gestão de registros com suporte completo a operações **offline-first**. Construído com **React Native (Expo SDK 56)** no frontend e **NestJS + Prisma + MySQL** no backend, ele permite que equipes criem, editem e visualizem registros mesmo sem conexão com a internet — tudo sincroniza automaticamente em background assim que a rede é restabelecida.

### Principais características

- **Offline-first real**: dados são persistidos localmente via **WatermelonDB + SQLite** e sincronizados com o servidor usando o protocolo de sync delta do WatermelonDB (`/sync/pull` e `/sync/push`).
- **Multi-tenant por empresa**: cada usuário autenticado acessa exclusivamente os dados da sua própria empresa — isolamento garantido em todas as camadas (JWT, backend e banco).
- **Sincronização inteligente**: na primeira conexão baixa tudo; nas seguintes só o delta desde o último pull (`lastPulledAt`), mantendo a transferência mínima.
- **Indicador de status de rede**: o app exibe em tempo real se está online ou offline, com sincronização manual disponível a qualquer momento.
- **Upload de fotos**: registros suportam anexo de múltiplas fotos via upload multipart.

---

## Estrutura do repositório

```
TesteCadidatoAplicativo/
├── backend/                       # API REST NestJS + Prisma + MySQL
└── mobile/testeCandidato/         # App React Native (Expo)
```

> **Nota Windows:** ao buildar o Android no Windows é comum estourar o limite de 260 caracteres em paths longos. Veja **[Setup Mobile (Android)](#3-mobile---android)** abaixo para a recomendação de copiar o projeto para um diretório curto (`D:\m`).

---

## Pré-requisitos

| Componente | Versão | Notas |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 10+ | vem com Node |
| Docker Desktop | qualquer | só pra subir o MySQL fácil; alternativa: MySQL nativo na porta 3306 |
| Android Studio + SDK 36 | mais recente | precisa de um emulador AVD configurado |
| JDK | 17 | já vem com Android Studio |

Variáveis de ambiente que o Gradle precisa:
- `ANDROID_HOME` apontando para `%LOCALAPPDATA%\Android\Sdk` (Windows) ou `~/Library/Android/sdk` (macOS).

---

## 1. Banco de dados (MySQL)

Mais simples via Docker:

```bash
docker run -d --name teste-candidato-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=teste_candidato \
  -p 3306:3306 \
  mysql:8.0
```

Verifique:
```bash
docker ps --filter name=teste-candidato-mysql
```

> Tem MySQL nativo? Crie o database manualmente: `CREATE DATABASE teste_candidato CHARACTER SET utf8mb4;`

---

## 2. Backend (NestJS)

```bash
cd backend
cp .env.example .env       # ajuste DATABASE_URL se seu MySQL não for root:root
npm install
npx prisma migrate deploy  # cria as tabelas
npm run prisma:seed        # popula com 2 empresas + 2 usuários
npm run start:dev          # API em http://localhost:3000
```

### Credenciais de teste

| Login | Senha | Empresa |
|---|---|---|
| `alpha@teste.com` | `123456` | Empresa Alpha |
| `beta@teste.com` | `123456` | Empresa Beta |

Cada usuário só enxerga os dados da própria empresa.

### Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Autenticação (retorna JWT) |
| `GET` | `/auth/me` | Usuário logado |
| `GET` | `/empresas/me` | Empresa do usuário logado |
| `GET` | `/registros` | Lista registros da empresa |
| `POST` | `/registros` | Cria registro |
| `PATCH` | `/registros/:id` | Atualiza registro |
| `DELETE` | `/registros/:id` | Soft delete |
| `GET` | `/fotos/registro/:registroId` | Lista fotos |
| `POST` | `/fotos/registro/:registroId` | Upload multipart de várias fotos |
| `DELETE` | `/fotos/:id` | Remove foto |
| `GET` | `/sync/pull?lastPulledAt=<ts>` | Pull WatermelonDB |
| `POST` | `/sync/push` | Push WatermelonDB |

Todas as rotas exceto `/auth/login` exigem `Authorization: Bearer <jwt>`.

---

## 3. Mobile — Android

> **Importante — Windows + path longo:** o build CMake do React Native gera caminhos C++ que estouram facilmente o limite de 260 caracteres do Windows. Se o seu repositório está em `D:\fullstack_projects\TesteCadidatoAplicativo\...` ou similar, o build vai falhar com `Filename longer than 260 characters`. A solução mais simples é **copiar a pasta `mobile/testeCandidato` para um path curto** como `D:\m` antes de buildar.

### Passo a passo (Windows)

```powershell
# 1. Copiar o app para um path curto (uma vez)
New-Item -ItemType Directory -Force -Path D:\m | Out-Null
robocopy D:\fullstack_projects\TesteCadidatoAplicativo\mobile\testeCandidato D:\m /E /XD node_modules android ios .expo .gradle build

# 2. Instalar dependências
cd D:\m
npm install

# 3. Garantir env vars do Android SDK
$env:ANDROID_HOME = 'C:\Users\<seu-usuario>\AppData\Local\Android\Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

# 4. Abrir um emulador Android pelo Android Studio (ou conectar celular via USB)
adb devices    # deve listar pelo menos 1 device

# 5. Buildar e instalar (primeira vez: ~10 min)
npx expo run:android
```

### Passo a passo (macOS / Linux)

Não precisa do truque do path curto:

```bash
cd mobile/testeCandidato
npm install
export ANDROID_HOME=$HOME/Library/Android/sdk     # ou /Android/Sdk no Linux
npx expo run:android
```

### Erro `JSIModulePackage` no `MainApplication.kt`?

O plugin `@morrowdigital/watermelondb-expo-plugin` injeta imports que não existem na New Architecture do RN 0.85. Se aparecer:
```
e: .../MainApplication.kt:6:34 Unresolved reference 'JSIModulePackage'.
```
Edite [`android/app/src/main/java/com/syncflow/testecandidato/MainApplication.kt`](mobile/testeCandidato/android/app/src/main/java/com/syncflow/testecandidato/MainApplication.kt) e remova as 2 linhas:
```kotlin
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage
import com.facebook.react.bridge.JSIModulePackage
```
Rode `npx expo run:android` de novo. O WatermelonDB JSI é autolinkado pelo Expo com `newArchEnabled: true` em [app.json](mobile/testeCandidato/app.json).

### Rodando depois (sem rebuild nativo)

Mudanças de JS/TS não exigem rebuild — basta:
```powershell
cd D:\m
npx expo start --dev-client
```
E o app no emulador recarrega automaticamente.

Só precisa rodar `expo run:android` de novo se:
- Adicionar uma lib com código nativo
- Mudar [app.json](mobile/testeCandidato/app.json) (plugins, permissions)
- Mudar [babel.config.js](mobile/testeCandidato/babel.config.js)

---

## 4. Configuração da URL do backend no app

Por padrão o app aponta para:
- **Android emulator** → `http://10.0.2.2:3000` (o `10.0.2.2` é o IP que o emulador usa pra alcançar o host)
- **iOS simulator** → `http://localhost:3000`

Para **celular físico** ou um IP diferente, exporte antes de iniciar o Metro:
```powershell
$env:EXPO_PUBLIC_API_BASE_URL = "http://192.168.0.42:3000"
npx expo start --dev-client
```

Pegue o IP da sua máquina com `ipconfig` (Windows) ou `ifconfig` (Unix).

---

## 5. Testando offline / online

1. Faça login com `alpha@teste.com` / `123456`. O app entra na **Home** já mostrando os registros que vieram do backend.
2. **Sincronização automática**: ao abrir a Home, o app dispara `/sync/pull`. Na primeira vez vem tudo; nas seguintes só o delta (com `lastPulledAt`).
3. **Offline**: ative o modo avião no emulador (Settings → Network) ou desligue o backend (`Ctrl+C`). O app mostra **"Offline"** no badge do topo + banner no header. Os dados em cache continuam disponíveis.
4. **Reconectou?** O hook `useSyncEngine` observa o NetInfo e dispara o sync automaticamente. Você também pode tocar em **"Sincronizar agora"** manualmente.
5. **Trocar de empresa**: clique em "Sair", entre com `beta@teste.com` / `123456`. Você verá apenas registros da Empresa Beta — isolamento garantido pelo backend.

---

## 6. Arquitetura

- **Backend**: NestJS modular, feature-based (`auth`, `empresas`, `registros`, `fotos`, `sync`). Soft delete para tudo, sync compatível com formato WatermelonDB. Isolamento por `empresa_id` em todos os endpoints.
- **Mobile**: MVVM + Clean Architecture. `core/` (transversal: api, theme, navigation, database, shared services) + `features/` (verticais: splash, auth, home, sync). WatermelonDB com SQLiteAdapter + JSI. Sessão JWT persistida em AsyncStorage. Splash sempre vai pra Home se há token (offline-first); refresh do token em background quando online.

Detalhes do produto e direção visual (SyncFlow): [mobile/testeCandidato/README.md](mobile/testeCandidato/README.md).

---

## 7. Troubleshooting rápido

| Sintoma | Causa | Solução |
|---|---|---|
| `Filename longer than 260 characters` no build | Path do projeto muito longo no Windows | Copiar para `D:\m` (seção 3) |
| `Unresolved reference 'JSIModulePackage'` | Plugin morrow injetou import incompatível | Editar `MainApplication.kt` (seção 3) |
| `SDK location not found` no Gradle | `ANDROID_HOME` não setado | `$env:ANDROID_HOME = 'C:\Users\...\Android\Sdk'` |
| App abre mas não conecta no backend | Aparelho físico ou emulador iOS | Setar `EXPO_PUBLIC_API_BASE_URL` (seção 4) |
| `Cannot find module 'babel-preset-expo'` | Deps de Babel faltando | `npm install --save-dev babel-preset-expo @babel/plugin-proposal-decorators` |
| Build trava ou MySQL não conecta | Container parado | `docker start teste-candidato-mysql` |
