# Frontend - Comunicação Criptográfica

## Configuração de Variáveis de Ambiente

O frontend usa um arquivo `.env` para configurar a URL do backend.

### Configuração Local

1. Crie um arquivo `.env` na raiz da pasta `trabalho-cripto-frontend`:

```
BACKEND_URL=http://localhost:3000
```

Ou copie do arquivo exemplo:
```bash
cp .env.example .env
```

### Configuração no Railway

Se você está deployando no Railway com backend em um serviço separado:

1. Vá até o serviço frontend no Railway
2. Abra a aba "Variables"
3. Adicione uma variável de ambiente:
   - **Nome:** `BACKEND_URL`
   - **Valor:** `https://seu-backend.up.railway.app`

Exemplo:
```
BACKEND_URL=https://meu-backend-prod.up.railway.app
```

### Como Funciona

1. Quando você executa `npm run start`, o servidor lê o arquivo `.env`.
2. A variável `BACKEND_URL` é substituída no arquivo `index.html`.
3. O frontend automaticamente conecta ao backend usando essa URL.

### Instalação de Dependências

Sempre execute antes:
```bash
npm install
```

### Execução

```bash
npm run start
```

O frontend estará disponível em:
- Local: `http://localhost:5500`
- Railway: URL pública do seu serviço

### Exemplo Completo de Deploy

**Backend (serviço 1):**
- Root Directory: `trabalho-cripto-backend`
- Build Command: `npm install`
- Start Command: `npm run start`
- URL pública: `https://meu-backend.up.railway.app`

**Frontend (serviço 2):**
- Root Directory: `trabalho-cripto-frontend`
- Build Command: `npm install`
- Start Command: `npm run start`
- Environment Variable: `BACKEND_URL=https://meu-backend.up.railway.app`
- URL pública: `https://meu-frontend.up.railway.app`

Ao abrir o frontend, ele se conectará automaticamente ao backend via URL configurada! ✅
