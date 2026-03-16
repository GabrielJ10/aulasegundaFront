const express = require('express');
const cors = require('cors'); // Importando o CORS
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000; // Porta onde o backend vai rodar
const LOG_LIMIT = 500;
const logEntries = [];

function formatLogArg(arg) {
    if (typeof arg === 'string') {
        return arg;
    }

    if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack || ''}`.trim();
    }

    try {
        return JSON.stringify(arg);
    } catch (_) {
        return String(arg);
    }
}

function addLog(level, args) {
    const message = args.map(formatLogArg).join(' ');
    logEntries.push({
        timestamp: new Date().toISOString(),
        level,
        message,
    });

    if (logEntries.length > LOG_LIMIT) {
        logEntries.shift();
    }
}

const originalConsoleLog = console.log.bind(console);
const originalConsoleError = console.error.bind(console);

console.log = (...args) => {
    addLog('INFO', args);
    originalConsoleLog(...args);
};

console.error = (...args) => {
    addLog('ERROR', args);
    originalConsoleError(...args);
};

// Permite requisições de outras origens (seu frontend em outra porta/servidor)
app.use(cors()); 

// Permite que o servidor entenda requisições com dados em JSON
app.use(express.json({ limit: '20mb' }));

app.get('/logs', (req, res) => {
        if (req.query.format === 'json') {
                return res.json({
                        total: logEntries.length,
                        logs: logEntries,
                });
        }

        const logsHtml = logEntries
                .map((entry) => `<div class="entry"><span class="time">[${entry.timestamp}]</span> <span class="${entry.level.toLowerCase()}">${entry.level}</span> <span>${entry.message
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')}</span></div>`)
                .join('');

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Logs do Backend</title>
    <style>
        body { font-family: Consolas, monospace; background: #0b1220; color: #d1d5db; margin: 0; padding: 24px; }
        h1 { margin: 0 0 16px 0; font-size: 20px; }
        .meta { color: #9ca3af; margin-bottom: 16px; }
        .box { border: 1px solid #1f2937; background: #111827; border-radius: 8px; padding: 12px; max-height: 80vh; overflow: auto; }
        .entry { margin-bottom: 8px; white-space: pre-wrap; word-break: break-word; }
        .time { color: #60a5fa; }
        .info { color: #34d399; font-weight: bold; }
        .error { color: #f87171; font-weight: bold; }
    </style>
    <meta http-equiv="refresh" content="5" />
</head>
<body>
    <h1>Logs do Backend</h1>
    <div class="meta">Atualiza automaticamente a cada 5 segundos. Total de entradas: ${logEntries.length}</div>
    <div class="box">${logsHtml || '<div>Nenhum log registrado ainda.</div>'}</div>
</body>
</html>`);
});

// 1. GERAÇÃO DAS CHAVES (Executado no PC1)
console.log("Gerando par de chaves RSA...");
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});
console.log("Chaves geradas com sucesso!\n");

function calcularHashSha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function assinarComChavePrivada(buffer) {
    return crypto.sign('sha256', buffer, privateKey).toString('base64');
}

function descriptografarPacoteHibrido(pacote) {
    const {
        chaveSimetricaCriptografada,
        iv,
        tag,
        dadosCriptografados,
    } = pacote || {};

    if (!chaveSimetricaCriptografada || !iv || !tag || !dadosCriptografados) {
        throw new Error('Pacote híbrido inválido.');
    }

    const chaveSimetrica = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(chaveSimetricaCriptografada, 'base64')
    );

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        chaveSimetrica,
        Buffer.from(iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    return Buffer.concat([
        decipher.update(Buffer.from(dadosCriptografados, 'base64')),
        decipher.final(),
    ]);
}

// 2. ROTA DA CHAVE PÚBLICA (PC2 fará um GET aqui)
app.get('/chave-publica', (req, res) => {
    res.json({ publicKey: publicKey });
});

// 3. ROTA DE RECEBIMENTO E DESCRIPTOGRAFIA (PC2 fará um POST aqui)
app.post('/mensagem', (req, res) => {
    const { mensagemCriptografada } = req.body;

    if (!mensagemCriptografada) {
        return res.status(400).json({ erro: "Nenhuma mensagem recebida." });
    }

    try {
        console.log("--- Nova Mensagem Recebida do PC2 ---");
        console.log("Texto Cifrado (como transitou na rede):", mensagemCriptografada);

        // O PC1 utiliza sua chave privada para descriptografar a mensagem
        const bufferDescriptografado = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(mensagemCriptografada, 'base64')
        );

        const mensagemOriginal = bufferDescriptografado.toString('utf8');
        
        console.log("\nMensagem Descriptografada com Sucesso:");
        console.log(`"${mensagemOriginal}"\n--------------------------------------\n`);

        res.json({ 
            sucesso: true, 
            mensagem: "O PC1 recebeu e descriptografou sua mensagem com sucesso!" 
        });

    } catch (erro) {
        console.error("Erro ao descriptografar:", erro.message);
        res.status(500).json({ erro: "Falha ao descriptografar a mensagem." });
    }
});

// 4. ROTA DE MENSAGEM HIBRIDA (AES para dados + RSA para chave AES)
app.post('/mensagem-hibrida', (req, res) => {
    const { pacote } = req.body;

    if (!pacote) {
        return res.status(400).json({ erro: 'Pacote criptografado não recebido.' });
    }

    try {
        console.log('--- Nova Mensagem Híbrida Recebida do PC2 ---');
        console.log('Chave AES cifrada (base64):', pacote.chaveSimetricaCriptografada);
        console.log('IV (base64):', pacote.iv);
        console.log('TAG GCM (base64):', pacote.tag);
        console.log('Payload cifrado (base64):', pacote.dadosCriptografados);

        const bufferMensagem = descriptografarPacoteHibrido(pacote);
        const mensagemOriginal = bufferMensagem.toString('utf8');
        const hashSha256 = calcularHashSha256(bufferMensagem);
        const assinaturaDigital = assinarComChavePrivada(bufferMensagem);

        console.log('\nMensagem descriptografada com sucesso (híbrida):');
        console.log(`"${mensagemOriginal}"\n--------------------------------------\n`);
        console.log(`[INTEGRIDADE] SHA-256 no destino: ${hashSha256}`);
        console.log(`[ASSINATURA] Assinatura digital gerada (base64 len=${assinaturaDigital.length})`);

        res.json({
            sucesso: true,
            mensagem: 'Mensagem híbrida recebida e descriptografada com sucesso!',
            mensagemOriginal,
            hashSha256,
            assinaturaDigital,
        });
    } catch (erro) {
        console.error('Erro ao descriptografar pacote híbrido:', erro.message);
        res.status(500).json({ erro: 'Falha ao descriptografar a mensagem híbrida.' });
    }
});

// Inicia o servidor do PC1
app.listen(PORT, () => {
    const fingerprint = crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 16);
    console.log(`Servidor do PC1 (Backend) rodando na porta ${PORT}`);
    console.log(`[CHAVES] Fingerprint da chave pública (sha256/16): ${fingerprint}`);
    console.log('[CHAVES] Chave privada carregada no servidor (valor não exibido por segurança).');
});