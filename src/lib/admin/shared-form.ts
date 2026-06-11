// Normalizza i campi testuali opzionali prima di salvarli su database.
export function optionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

// Converte un valore obbligatorio in numero, bloccando input non validi.
export function requiredNumber(value: string, label: string) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${label} deve essere un numero valido.`);
  }

  return numberValue;
}

// Converte un valore opzionale in numero, lasciando null quando il campo e vuoto.
export function optionalNumber(value: string, label: string) {
  if (value.trim().length === 0) {
    return null;
  }

  return requiredNumber(value, label);
}
