# Apresentacao Tecnica - Proposta 2

## 1. Objetivo do trabalho

Implementar um sistema cliente-servidor onde:

- PC1 gera chaves publica/privada RSA.
- PC2 usa a chave publica para proteger mensagens antes do envio.
- PC1 usa a chave privada para recuperar o conteudo.

---

## 2. Arquitetura

### PC1 (Backend - Node.js/Express)

Responsabilidades:

- Gerar par de chaves RSA na inicializacao.
- Expor chave publica ao cliente.
- Receber pacote criptografado.
- Descriptografar no destino.
- Calcular hash SHA-256 do conteudo final.
- Assinar digitalmente o conteudo final com chave privada.
- Retornar conteudo, hash e assinatura para validacao no cliente.

### PC2 (Frontend - HTML/CSS/JS + Forge)

Responsabilidades:

- Buscar chave publica do servidor.
- Gerar chave simetrica AES aleatoria por envio.
- Criptografar dados com AES-256-GCM.
- Criptografar chave AES com RSA-OAEP.
- Enviar pacote para o backend.
- Verificar assinatura digital do backend usando chave publica.
- Comparar hash da origem com hash do destino.

---

## 3. Mapeamento com a proposta oficial

### Requisito A - Configuracao cliente-servidor

Atendido.

- Backend escuta porta (default 3000, configuravel por `PORT`).
- Frontend pode rodar em outra porta e chama o backend por URL dinamica baseada no host atual.

### Requisito B - Geracao de chaves no PC1

Atendido.

- Chaves RSA 2048 sao geradas no startup do backend.
- Chave publica e entregue por endpoint.

### Requisito C - Troca de mensagens criptografadas

Atendido.

- Cliente recebe chave publica.
- Cliente cifra e envia.
- Servidor usa chave privada para recuperar dados.

### Requisito D - Validacao do uso correto das chaves

Atendido e expandido.

- RSA-OAEP protege a chave AES (somente PC1 consegue recuperar com chave privada).
- Conteudo e protegido por AES-256-GCM.
- Integridade validada com hash SHA-256.
- Autenticidade validada com assinatura digital.

---

## 4. Por que RSA é suficiente para este projeto

RSA com chaves de 2048 bits consegue cifrar até ~245 bytes de dados. Para a demonstração de sala, mensagens pequenas e médias são adequadas.

Características:
1. Conceito claro: 1 chave pública, 1 chave privada.
2. Fácil de explicar: qualquer um cifra, só o detentor da privada consegue ler.
3. Sem complexidade extra: sem necessidade de gerenciar chaves simétricas.

---

## 5. Fluxo completo demonstrado na tela

### Mensagem RSA

1. Origem (PC2): texto em claro.
2. Rede: pacote criptografado com RSA.
3. Destino (PC1): texto descriptografado com chave privada.
4. Confirmação: mensagem recebida com sucesso.

## 6. Endpoints e papel de cada um

- `GET /chave-publica`
  - Entrega chave publica RSA para o cliente.

- `POST /mensagem`
  - Recebe mensagem criptografada com RSA.
  - Descriptografa no servidor com chave privada.
  - Retorna confirmacao de recebimento.

- `GET /logs`
  - Exibe os logs do backend em interface web.
  - Tambem aceita `?format=json` para retorno em JSON.

---

## 7. O que foi implementado

1. `package.json` corrigido (`main: server.js`, scripts `start/dev`).
2. Criptografia RSA puro (2048 bits).
3. Logs didaticos de origem/rede/destino para apresentacao.
4. Rota `/logs` para visualizar comunicacao no navegador.
5. Chave privada nunca e exibida em logs (seguranca).
6. Interface web simples e clara.

---

## 8. Roteiro de apresentacao (fala pronta)

1. "O PC1 gera um par RSA e publica apenas a chave publica."
2. "O PC2 pega essa chave e cifra a mensagem."
3. "Qualquer um consegue cifrar com a chave publica."
4. "Mas SÓ PC1 consegue descriptografar com sua chave privada (que ninguém mais tem)."
5. "Se alguém interceptar a mensagem na rede, vai ver só lixo aleatório."
6. "PC1 abre com a chave privada e lê a mensagem original."
7. "Assim eu demonstro confidencialidade total: só o dono da chave privada consegue ler."

---

## 9. Como executar para demo

### Backend

```powershell
cd .\aulaCriptografia\trabalho-cripto-backend
npm install
npm run start
```

### Frontend

```powershell
cd .\aulaCriptografia\trabalho-cripto-frontend
npm install
npm run start
```

---

## 10. Conclusao

A proposta 2 foi atendida com criptografia RSA aplicada em um sistema real cliente-servidor:

- Geração segura de chaves (RSA 2048)
- Cifra em lado do cliente (confidencialidade)
- Descriptografa apenas com chave privada (autenticidade)
- Interface de logs para visualizar toda a comunicacao
- Deploy pronto para Railway em 2 serviços separados

Com isso, o projeto fica tecnicamente correto, demonstravel em sala e com narrativa clara de seguranca ponta a ponta.
