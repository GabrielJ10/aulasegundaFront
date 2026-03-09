const express = require('express');
const cors = require('cors'); // Importando o CORS
const crypto = require('crypto');

const app = express();
const PORT = 3000; // Porta onde o backend vai rodar

// Permite requisições de outras origens (seu frontend em outra porta/servidor)
app.use(cors()); 

// Permite que o servidor entenda requisições com dados em JSON
app.use(express.json());

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

// Inicia o servidor do PC1
app.listen(PORT, () => {
    console.log(`Servidor do PC1 (Backend) rodando na porta ${PORT}`);
    console.log(publicKey);//tirar dps
    console.log(privateKey);//tirar dps
});