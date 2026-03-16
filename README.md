# Trabalho de Criptografia - Proposta 2

Sistema cliente-servidor com criptografia assimetrica e fluxo hibrido para mensagens longas, pronto para deploy em dois servicos separados no Railway (frontend e backend).

## O que este projeto faz

- PC1 (backend) gera par de chaves RSA (publica/privada).
- PC2 (frontend) busca a chave publica do PC1.
- PC2 cifra mensagem com AES-256-GCM e cifra a chave AES com RSA-OAEP.
- PC1 usa chave privada para recuperar a chave AES e descriptografar os dados.
- PC1 calcula hash SHA-256 e assina digitalmente o conteudo com sua chave privada.
- PC2 verifica assinatura digital com a chave publica e compara hash origem x destino.
- Backend possui rota de visualizacao de logs em `/logs`.

## Estrutura

- `trabalho-cripto-backend/`: API Node.js (PC1)
- `trabalho-cripto-frontend/`: web app cliente (PC2) com servidor HTTP proprio

## Requisitos

- Node.js 18+
- Navegador moderno (Chrome/Edge/Firefox)

## Como executar localmente

### 1. Subir backend (PC1)

```powershell
cd .\aulaCriptografia\trabalho-cripto-backend
npm install
npm run start
```

Saida esperada no terminal:

- `Servidor do PC1 (Backend) rodando na porta 3000`
- `Fingerprint da chave publica ...`
- Logs de recebimento, descriptografia, hash e assinatura ao enviar mensagem.
- Interface de logs: `http://localhost:3000/logs`

### 2. Abrir frontend (PC2)

```powershell
cd .\aulaCriptografia\trabalho-cripto-frontend
npm run start
```

Depois abra:

- `http://localhost:5500`
- Defina no campo "URL do Backend" a URL do backend (local ou Railway).

## Deploy no Railway (2 servicos separados)

### Servico 1: Backend

1. Crie um projeto/servico no Railway apontando para a pasta `trabalho-cripto-backend`.
2. Comandos:

```bash
npm install
npm run start
```

3. Acesse:
   - API: `https://SEU-BACKEND.up.railway.app/chave-publica`
   - Logs: `https://SEU-BACKEND.up.railway.app/logs`

### Servico 2: Frontend

1. Crie outro servico no Railway apontando para a pasta `trabalho-cripto-frontend`.
2. Comandos:

```bash
npm install
npm run start
```

3. Abra a URL publica do frontend e informe, no campo de configuracao, a URL publica do backend.

## O que esperar na demonstracao

### Fluxo 1: Mensagem longa

1. Digite uma mensagem grande.
2. Clique em `Criptografar e Enviar Mensagem`.
3. Veja no log:
   - Conteudo original (origem)
   - Pacote cifrado (rede)
   - Conteudo descriptografado (destino)
   - Hash SHA-256 origem e destino
   - Verificacao da assinatura digital

## Endpoints principais

- `GET /chave-publica`
- `POST /mensagem-hibrida`
- `GET /logs`

## Observacoes

- O fluxo `POST /mensagem` (RSA direto) foi mantido apenas para comparacao didatica.
- Para dados grandes, use sempre fluxo hibrido (AES + RSA).
- A chave privada nao e exibida em logs.
