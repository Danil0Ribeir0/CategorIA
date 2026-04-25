const ANONYMIZATION_RULES = [
  { name: 'EMAIL', pattern: /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g },
  { name: 'CPF', pattern: /(?:\d{3}[-.\s]?){2}\d{3}[-.\s]?\d{2}/g },
  { name: 'CNPJ', pattern: /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g },
  { name: 'CARTAO', pattern: /(?:\d{4}[ -]?){3}\d{4}/g },
  { name: 'TELEFONE', pattern: /(\(?\d{2}\)?\s)?(\d{4,5}[-\s]?\d{4})/g }
];

export function anonymizeText(text) {
  if (!text) return "";
  
  let safeText = text;
  for (const rule of ANONYMIZATION_RULES) {
    safeText = safeText.replace(rule.pattern, `[${rule.name} PROTEGIDO]`);
  }
  
  return safeText;
}