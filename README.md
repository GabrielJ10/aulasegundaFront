# Trabalho de Criptografia - Proposta 2

Sistema cliente-servidor com criptografia assimetrica RSA puro, pronto para deploy em dois servicos separados no Railway (frontend e backend).

## O que este projeto faz

- PC1 (backend) gera par de chaves RSA (publica/privada).
- PC2 (frontend) busca a chave publica do PC1.
- PC2 cifra a mensagem com RSA usando a chave publica.
- PC1 usa chave privada para descriptografar a mensagem.
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

3. Abra a URL publica do frontend. No arquivo `trabalho-cripto-frontend/index.html`, altere a variavel `BACKEND_URL` com a URL publica do seu servico backend.

## O que esperar na demonstracao

### Fluxo: Mensagem RSA

1. Digite uma mensagem.
2. Clique em `Criptografar e Enviar`.
3. Veja no log:
   - Conteudo original (origem)
   - Pacote cifrado com RSA (rede - primeiros caracteres)
   - Resposta do backend (sucesso)

## Endpoints principais

- `GET /chave-publica` - Entrega a chave publica RSA
- `POST /mensagem` - Recebe e descriptografa mensagem com RSA
- `GET /logs` - Exibe logs do backend em interface web

## Observacoes

- Criptografia RSA puro com chaves de 2048 bits.
- A chave privada nao e exibida em logs.
- Limite pratico: mensagens com tamanho maximo ~245 bytes (limitacao do RSA 2048).
