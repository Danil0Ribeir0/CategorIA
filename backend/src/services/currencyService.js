export async function convertToBrl(amount, currency) {
  if (currency === 'BRL') {
    return amount;
  }

  try {
    const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${currency}-BRL`);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar cotação da API. Status: ${response.status}`);
    }

    const data = await response.json();
    const key = `${currency}BRL`;

    if (!data[key]) {
      throw new Error(`Cotação para a moeda ${currency} não encontrada.`);
    }

    const rate = parseFloat(data[key].ask);
    
    const convertedAmount = parseFloat((amount * rate).toFixed(2));

    console.log(`Conversão: ${amount} ${currency} * R$ ${rate.toFixed(2)} = R$ ${convertedAmount}`);
    
    return convertedAmount;

  } catch (error) {
    console.error("Erro no serviço de conversão:", error.message);
    throw error;
  }
}