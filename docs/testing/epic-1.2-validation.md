# EPIC-1.2 - Guia de Validacao Manual (Knowledge CRUD)

Este guia documenta o fluxo de validacao manual do EPIC-1.2 para reproducao local por qualquer pessoa do projeto.

## 1. Objetivo

Validar o comportamento dos endpoints de Knowledge (CRUD + regras de dominio) com autenticacao JWT local.

## 2. Pre-requisitos

- Estar na raiz do repositorio (`C:\Labs\knowhub`)
- Node.js 22+
- Dependencias instaladas (`npm install`)
- Ambiente configurado (`npm run env:setup`)
- API buildada (`npm run build -w @knowhub/api`)

## 3. Subir API local

```powershell
npm run dev -w @knowhub/api
```

Healthcheck:

```powershell
curl.exe -s http://localhost:3001/api/v1/health
```

## 4. Obter credenciais e token

```powershell
$cfg = Get-Content "$HOME/.knowhub/config.json" | ConvertFrom-Json
$clientId = $cfg.clientId

$clientSecret = node -e "const fs=require('fs');const path=require('path');const os=require('os');(async()=>{const keytar=require('keytar');const cfg=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.knowhub','config.json'),'utf8'));const secret=await keytar.getPassword('knowhub',cfg.clientId);if(!secret){process.exit(2)}process.stdout.write(secret)})().catch(()=>process.exit(1));"
$clientSecret = $clientSecret.Trim()

$authBody = @{ clientId = $clientId; clientSecret = $clientSecret } | ConvertTo-Json
$auth = curl.exe -s -X POST "http://localhost:3001/api/v1/auth/token" -H "Content-Type: application/json" -d $authBody | ConvertFrom-Json
$token = $auth.accessToken
```

## 5. Fluxo de validacao manual

### 5.1 Criar entrada NOTE

```powershell
$createBody = '{"type":"NOTE","content":"Estudo de Inteligencia Artificial aplicada com NestJS.","tags":["nestjs","ia"]}'
$created = curl.exe -s -X POST "http://localhost:3001/api/v1/knowledge" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $createBody | ConvertFrom-Json
$entryId = $created.data.id
$created
```

Esperado: `201` com `status: PENDING`.

### 5.2 Listar com filtro + busca

```powershell
curl.exe -s "http://localhost:3001/api/v1/knowledge?page=1&limit=10&type=NOTE&q=inteligencia" -H "Authorization: Bearer $token"
```

Esperado: `200` com `meta` de paginacao e entrada retornada.

### 5.3 Detalhar entrada

```powershell
curl.exe -s "http://localhost:3001/api/v1/knowledge/$entryId" -H "Authorization: Bearer $token"
```

Esperado: `200` com `accessedAt`, `relatedConnectionCount` e `contentChunkCount`.

### 5.4 Atualizar metadados (sem reindex)

```powershell
$patchMeta = '{"title":"Nota IA revisada","tags":["nestjs","arquitetura"]}'
curl.exe -s -X PATCH "http://localhost:3001/api/v1/knowledge/$entryId" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $patchMeta
```

Esperado: `200` e status mantido.

### 5.5 Atualizar conteudo (reindex inteligente)

```powershell
$patchContent = '{"content":"Conteudo alterado para disparar pendencia de reindex."}'
curl.exe -s -X PATCH "http://localhost:3001/api/v1/knowledge/$entryId" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $patchContent
```

Esperado: `200` com `status: PENDING`.

### 5.6 Validar sanitizacao de `filePath`

```powershell
$badPdf = '{"type":"PDF","filePath":"..\\..\\windows\\system32\\secret.pdf"}'
curl.exe -i -X POST "http://localhost:3001/api/v1/knowledge" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $badPdf
```

Esperado: `400 Bad Request`.

### 5.7 Validar conflito em reindex

```powershell
curl.exe -i -X POST "http://localhost:3001/api/v1/knowledge/$entryId/reindex" -H "Authorization: Bearer $token"
```

Esperado: `409 Conflict` se entrada estiver `PENDING` ou `INDEXING`.

### 5.8 Soft delete

```powershell
curl.exe -i -X DELETE "http://localhost:3001/api/v1/knowledge/$entryId" -H "Authorization: Bearer $token"
```

Esperado: `204 No Content`.

### 5.9 Reindex de entrada arquivada

```powershell
curl.exe -i -X POST "http://localhost:3001/api/v1/knowledge/$entryId/reindex" -H "Authorization: Bearer $token"
```

Esperado: `422 Unprocessable Entity`.

### 5.10 Restauracao via PATCH

```powershell
$restoreBody = '{"title":"Entrada restaurada"}'
curl.exe -s -X PATCH "http://localhost:3001/api/v1/knowledge/$entryId" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $restoreBody
```

Esperado:

- `INDEXED` quando ha chunks associados
- `PENDING` quando nao ha chunks (reprocessamento necessario)

## 6. Evidencia da validacao atual

Execucao manual realizada em `2026-03-08` com os seguintes resultados:

- Healthcheck OK
- Auth token OK
- Create/list/detail/update/archive/restore OK
- Erros esperados confirmados: `400`, `409`, `422`
- `npm run lint` OK

## 7. Qualidade final

Executar antes de concluir PR:

```powershell
npm run lint
```
