export async function convertToBrl(amount, currency) {
    if (!currency || currency.toUpperCase() === 'BRL') {
      return amount;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${currency}-BRL`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error("Falha ao comunicar com a API de câmbio.");
        }

        const data = await response.json();
        const key = `${currency}BRL`;
        
        if (!data[key]) {
          throw new Error("Moeda não suportada ou cotação indisponível.");
        }

        const bid = parseFloat(data[key].bid);
        return amount * bid;

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            console.error(`[TIMEOUT] A API de câmbio não respondeu dentro de 5 segundos.`);
            throw new Error("O serviço de conversão de moedas está temporariamente indisponível. Tente novamente mais tarde.");
        }

        throw error;
    }
}