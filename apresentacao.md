# Apresentacao Tecnica - Proposta 2

## 1. Objetivo do trabalho

Implementar um sistema cliente-servidor onde:

- PC1 gera chaves publica/privada.
- PC2 usa a chave publica para proteger informacoes antes do envio.
- PC1 usa a chave privada para recuperar o conteudo.

Este projeto implementa isso de duas formas:

- Fluxo base (RSA direto): para entender o conceito.
- Fluxo recomendado (hibrido): para operar com mensagens longas e arquivos.

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

## 4. Por que usar criptografia hibrida

RSA puro possui limite de tamanho de mensagem. Em RSA 2048 com OAEP-SHA256, a carga util maxima e limitada. Para dados maiores, o padrao de mercado e:

1. Gerar chave AES aleatoria.
2. Criptografar payload com AES (rapido e sem limite pratico para esse uso).
3. Criptografar a chave AES com RSA (troca segura da chave).

Essa combinacao resolve o limite do RSA e melhora performance.

---

## 5. Fluxo completo demonstrado na tela

## 5.1 Mensagem longa

1. Origem (PC2): texto em claro.
2. Rede: pacote com:
   - chave AES criptografada em RSA
   - IV
   - TAG GCM
   - dados criptografados em AES
3. Destino (PC1): texto descriptografado.
4. Integridade: hash SHA-256 origem e destino.
5. Autenticidade: assinatura digital verificada no cliente.

## 6. Endpoints e papel de cada um

- `GET /chave-publica`
  - Entrega chave publica RSA para o cliente.

- `POST /mensagem-hibrida`
  - Recebe pacote hibrido de mensagem.
  - Descriptografa no servidor.
  - Retorna conteudo, hash e assinatura.

- `GET /logs`
  - Exibe os logs do backend em interface web.
  - Tambem aceita `?format=json` para retorno em JSON.

- `POST /mensagem`
  - Fluxo legado de RSA direto (didatico, nao recomendado para dados grandes).

---

## 7. O que foi melhorado nesta versao

1. `package.json` corrigido (`main: server.js`, scripts `start/dev`).
2. URL de backend dinamica no frontend (nao depende de localhost fixo).
3. Suporte a mensagens longas via criptografia hibrida.
4. Logs didaticos de origem/rede/destino para apresentacao.
5. Integridade com SHA-256 exibida no fluxo.
6. Assinatura digital no backend + verificacao no frontend.
7. Chave privada removida dos logs (seguranca).
8. Rota `/logs` para visualizar comunicacao no navegador.

---

## 8. Roteiro de apresentacao (fala pronta)

1. "O PC1 gera um par RSA e publica apenas a chave publica."
2. "O PC2 pega essa chave e cria um pacote hibrido."
3. "O dado real vai em AES-GCM; a chave AES vai protegida por RSA-OAEP."
4. "No destino, o PC1 recupera o conteudo com a chave privada."
5. "Depois ele calcula hash SHA-256 e assina digitalmente o resultado."
6. "No cliente, eu valido assinatura e comparo hash origem/destino."
7. "Assim eu demonstro confidencialidade, integridade e autenticidade."

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

A proposta 2 foi atendida e expandida com praticas de criptografia aplicadas em sistemas reais:

- troca segura de chave (RSA)
- criptografia eficiente de dados (AES-GCM)
- garantia de integridade (SHA-256)
- garantia de autenticidade (assinatura digital)

Com isso, o projeto fica tecnicamente correto, demonstravel em sala e com narrativa clara de seguranca ponta a ponta.
