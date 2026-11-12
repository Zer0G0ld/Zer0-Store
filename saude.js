// saude.js
async function verificarStatusLoja() {
    const containerStatus = document.getElementById('status-hf');
    if (!containerStatus) return;

    // Estado inicial
    containerStatus.innerHTML = `
        <div class="status-item">
            <span class="dot loading"></span> Verificando Servidores...
        </div>
    `;

    try {
        // 1. Verifica se o Hugging Face está online
        const ping = await fetch('https://huggingface.co/api/models?limit=1');
        const hfOnline = ping.ok;

        if (!hfOnline) throw new Error("Hugging Face Offline");

        // 2. Pega os metadados da ÁRVORE do repositório (Aqui está o segredo)
        // Usamos a API tree, que retorna o tamanho real e consolidado do repo
        const repoUrl = 'https://huggingface.co/api/datasets/Zer0G0ld/ps4z';
        const repoInfo = await fetch(repoUrl);
        
        let tamanhoTotalGB = 0;

        if (repoInfo.ok) {
            const data = await repoInfo.json();
            
            // A API do HF agora retorna o tamanho total usado no campo 'usedStorage' (em bytes)
            if (data.usedStorage) {
                tamanhoTotalGB = data.usedStorage / (1024 ** 3); // Converte para GB
            } 
            // Fallback para caso a API antiga responda (soma dos siblings)
            else if (data.siblings) {
                let totalBytes = 0;
                // A API antiga não manda o tamanho em todos, então não é confiável.
                // Mas se tiver, somamos.
                data.siblings.forEach(file => {
                    if (file.size) totalBytes += file.size;
                });
                tamanhoTotalGB = totalBytes / (1024 ** 3);
            }
        }

        // 3. Formata o número (Ex: 1.06) e exibe com o "TB" ou "GB" correto
        let tamanhoFormatado = "";
        if (tamanhoTotalGB >= 1024) {
            // Se passar de 1024 GB, mostra em TB
            tamanhoFormatado = (tamanhoTotalGB / 1024).toFixed(2) + " TB";
        } else if (tamanhoTotalGB > 0) {
            // Se for menor que 1TB, mostra em GB
            tamanhoFormatado = tamanhoTotalGB.toFixed(2) + " GB";
        } else {
            tamanhoFormatado = "Calculando..."; // Caso a API demore
        }

        // 4. Atualiza a tela com os dados
        containerStatus.innerHTML = `
            <div class="status-item">
                <span class="dot online"></span> 
                <span class="status-text"><strong>Servidores Online</strong></span>
            </div>
            <div class="status-item">
                <i class="fa-solid fa-server" style="color:#66c0f4; margin-right: 5px;"></i>
                <span class="status-text">${tamanhoFormatado} na nuvem</span>
            </div>
        `;

    } catch (error) {
        console.error("Erro ao verificar status:", error);
        // Se der erro (Offline ou CORS)
        containerStatus.innerHTML = `
            <div class="status-item">
                <span class="dot offline"></span> 
                <span class="status-text" style="color: #ff4d5e;"><strong>Servidores Offline</strong></span>
            </div>
        `;
    }
}

// Executa quando a página carregar
document.addEventListener("DOMContentLoaded", verificarStatusLoja);